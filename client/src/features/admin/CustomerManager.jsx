import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { Search, User, MapPin, DollarSign, Wallet, ShieldAlert, Award, FileText } from 'lucide-react';
import { format } from 'date-fns';

export const CustomerManager = () => {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail modal
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Refund states
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundDesc, setRefundDesc] = useState('Service dispute resolution refund');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const fetchCustomers = async (targetPage = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const response = await adminService.getCustomers(targetPage, searchQuery);
      if (response.success) {
        setCustomers(response.data);
        setPage(response.page || 1);
        setTotalPages(response.pages || 1);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch customer list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, search);
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(1, search);
  };

  const handleOpenDetail = async (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
    setShowRefundForm(false);
  };

  const handleIssueRefund = async (e) => {
    e.preventDefault();
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Please enter a valid refund amount.', 'warning');
      return;
    }

    setSubmittingRefund(true);
    try {
      // Amount in paise
      const paiseAmount = amount * 100;
      const response = await adminService.issueRefund(selectedCustomer._id, paiseAmount, refundDesc);
      
      if (response.success) {
        addToast(`Refund of ₹${amount.toFixed(2)} issued successfully!`, 'success');
        setShowRefundForm(false);
        setShowDetail(false);
        fetchCustomers(page, search);
      }
    } catch (err) {
      addToast(err.message || 'Refund failed.', 'error');
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <PageShell
      title="Customer Operations"
      subtitle="View customer profiles, active subscriptions, and issue balance adjustments"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
          <Input
            id="cust-search"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            style={{ flex: 1 }}
          />
          <Button type="submit" variant="primary">Search</Button>
        </form>

        {/* CUSTOMERS GRID */}
        {loading && customers.length === 0 ? (
          <LoadingSkeleton type="card" count={3} />
        ) : customers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {customers.map((cust) => (
              <Card
                key={cust._id}
                className="glass card--interactive"
                onClick={() => handleOpenDetail(cust)}
                style={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    fontWeight: 700
                  }}>
                    {cust.name ? cust.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>{cust.name || 'Member'}</h4>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>+91 {cust.phone}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)' }}>
                  <Badge variant={cust.dietaryPreferences?.type || 'veg'}>
                    {(cust.dietaryPreferences?.type || 'veg').toUpperCase()}
                  </Badge>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Role: {cust.role}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              No customer records matched your query.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}

      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Customer Operational File"
        size="lg"
      >
        {selectedCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Core Info */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: 'var(--text-md)'
              }}>
                {selectedCustomer.name ? selectedCustomer.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{selectedCustomer.name}</h4>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  Phone: {selectedCustomer.phone} | Email: {selectedCustomer.email || 'None'}
                </p>
              </div>
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: 0 }} />

            {/* Diet settings */}
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>DIETARY CONFIGURATION</span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Badge variant="glass">Diet: {selectedCustomer.dietaryPreferences?.type || 'veg'}</Badge>
                <Badge variant="glass">Spice: {selectedCustomer.dietaryPreferences?.spiceLevel || 'medium'}</Badge>
                {selectedCustomer.dietaryPreferences?.allergies?.length > 0 && (
                  <Badge variant="glass">Allergies: {selectedCustomer.dietaryPreferences.allergies.join(', ')}</Badge>
                )}
              </div>
            </div>

            {/* Addresses */}
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>DELIVERY LOCATIONS ({selectedCustomer.addresses?.length || 0})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedCustomer.addresses?.map((addr) => (
                  <div key={addr._id} className="glass" style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', fontSize: 'var(--text-xs)' }}>
                    <strong>{addr.label}</strong>: {addr.line1}, {addr.city} ({addr.pincode})
                  </div>
                ))}
              </div>
            </div>

            {/* Refund form toggle */}
            {!showRefundForm ? (
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <Button
                  variant="outline"
                  icon={DollarSign}
                  onClick={() => setShowRefundForm(true)}
                >
                  Issue Balance Refund
                </Button>
              </div>
            ) : (
              <form onSubmit={handleIssueRefund} style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px dashed var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-secondary)' }}>REFUND ADJUSTMENT FORM</span>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Input
                    id="ref-amount"
                    label="Amount (₹)"
                    placeholder="200"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  <Input
                    id="ref-desc"
                    label="Description"
                    placeholder="Dispute credit"
                    value={refundDesc}
                    onChange={(e) => setRefundDesc(e.target.value)}
                    style={{ flex: 2 }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" size="sm" onClick={() => setShowRefundForm(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm" loading={submittingRefund}>Issue Credit</Button>
                </div>
              </form>
            )}

          </div>
        )}
      </Modal>

    </PageShell>
  );
};

export default CustomerManager;
