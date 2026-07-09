import React, { useEffect, useState } from 'react';
import { deliveryService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Truck, MapPin, Phone, CheckCircle, Navigation, Award, Star, ShieldAlert, Camera, Send } from 'lucide-react';
import { format } from 'date-fns';

export const DeliveryDashboard = () => {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  
  // Delivery proof modal states
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // mock image link (Unsplash delivery box)
  const [submittingProof, setSubmittingProof] = useState(false);

  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      const statsRes = await deliveryService.getStats();
      if (statsRes.success) setStats(statsRes.data);

      const listRes = await deliveryService.getMy();
      if (listRes.success) setDeliveries(listRes.data);
    } catch (err) {
      addToast(err.message || 'Failed to fetch delivery logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await deliveryService.updateStatus(orderId, newStatus);
      if (response.success) {
        addToast(`Status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
        fetchDeliveryData();
      }
    } catch (err) {
      addToast(err.message || 'Status update failed.', 'error');
    }
  };

  const handleOpenProofModal = (order) => {
    setSelectedOrder(order);
    setNotes('');
    // pre-fill a mock photo URL for demonstration
    setImageUrl('https://images.unsplash.com/photo-1582284738521-48763244fae5?auto=format&fit=crop&q=80&w=600');
    setShowProofModal(true);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    setSubmittingProof(true);

    try {
      // Create FormData payload for multer memoryStorage on backend
      const formData = new FormData();
      formData.append('notes', notes.trim());
      formData.append('latitude', 28.53); // mock coords
      formData.append('longitude', 77.34);
      
      // If we are sending an actual file, we would append a File blob. 
      // For testing, our mock controller allows either mock image URLs or actual file uploads.
      // We will append a placeholder string and handle it gracefully.
      formData.append('mockImage', imageUrl);

      const response = await deliveryService.submitProof(selectedOrder._id, formData);
      if (response.success) {
        addToast('Delivery completed successfully! Proof uploaded.', 'success');
        setShowProofModal(false);
        fetchDeliveryData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit delivery proof.', 'error');
    } finally {
      setSubmittingProof(false);
    }
  };

  if (loading && !stats) {
    return (
      <PageShell title="Rider Dashboard">
        <LoadingSkeleton type="card" count={2} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Rider Dashboard"
      subtitle="Track your daily food box deliveries and verify completion proofs"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* STATS TILES */}
        {stats && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Card className="glass" style={{ flex: 1, minWidth: '150px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>COMPLETED TODAY</span>
              <h3 style={{ margin: '8px 0 0 0', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--success)' }}>
                {stats.completedCount}
              </h3>
            </Card>
            <Card className="glass" style={{ flex: 1, minWidth: '150px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>PENDING DISPATCH</span>
              <h3 style={{ margin: '8px 0 0 0', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--warning)' }}>
                {stats.pendingCount}
              </h3>
            </Card>
            <Card className="glass" style={{ flex: 1, minWidth: '150px', padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>RIDER RATING</span>
              <h3 style={{ margin: '8px 0 0 0', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Star size={18} fill="var(--accent-primary)" />
                {stats.averageRating ? stats.averageRating.toFixed(1) : '5.0'}
              </h3>
            </Card>
          </div>
        )}

        {/* DELIVERIES LIST */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
            Assigned Deliveries ({deliveries.length})
          </h3>

          {deliveries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {deliveries.map((item) => (
                <Card key={item._id} className="glass" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Badge variant="glass">{item.mealType.toUpperCase()}</Badge>
                        <Badge variant={item.menu?.items?.[0]?.category || 'veg'}>
                          {(item.menu?.items?.[0]?.category || 'veg').toUpperCase()}
                        </Badge>
                        <Badge variant="veg" style={{ textTransform: 'uppercase' }}>
                          {item.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <h4 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 600 }}>
                        Deliver to: {item.user.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        <MapPin size={14} color="var(--accent-primary)" />
                        <span>{item.deliveryAddress.line1}, {item.deliveryAddress.city} - {item.deliveryAddress.pincode}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <Phone size={14} />
                        <span>+91 {item.user.phone}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Navigation Shortcut */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${item.deliveryAddress.coordinates?.lat || 28.53},${item.deliveryAddress.coordinates?.lng || 77.34}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--xs btn--outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        <Navigation size={12} />
                        Navigate
                      </a>
                    </div>
                  </div>

                  {/* Actions buttons based on status */}
                  <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px', marginTop: '14px' }}>
                    {item.status === 'scheduled' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Truck}
                        onClick={() => handleUpdateStatus(item._id, 'preparing')}
                      >
                        Start Kitchen Prep
                      </Button>
                    )}

                    {item.status === 'preparing' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Truck}
                        onClick={() => handleUpdateStatus(item._id, 'out_for_delivery')}
                      >
                        Mark Out For Delivery
                      </Button>
                    )}

                    {item.status === 'out_for_delivery' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleOpenProofModal(item)}
                      >
                        Complete Delivery (Proof)
                      </Button>
                    )}

                    {item.status === 'delivered' && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Delivered Successfully
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="glass" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <Truck size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                No active delivery boxes assigned to you today.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* DELIVERY PROOF MODAL */}
      <Modal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        title="Submit Delivery Verification"
      >
        {selectedOrder && (
          <form onSubmit={handleSubmitProof} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Snap or upload a quick photo of the tiffin container delivered at the doorstep.
            </p>

            {/* Mock Image Camera container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="input__label">Delivery Photo</span>
              <div style={{
                height: '160px',
                border: '1px dashed var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Tiffin delivery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Camera size={24} />
                    <span style={{ fontSize: 'var(--text-xs)' }}>Camera simulation enabled</span>
                  </div>
                )}
              </div>
            </div>

            <Input
              id="proof-notes"
              label="Delivery Note (Optional)"
              placeholder="e.g. Left with guard / Handed to customer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              icon={Send}
            />

            <div style={{ display: 'flex', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass)', fontSize: '10px', color: 'var(--text-secondary)' }}>
              <MapPin size={14} color="var(--success)" style={{ flexShrink: 0 }} />
              <span>Auto-attaching GPS coordinates: <strong>Lat 28.53, Lng 77.34</strong> (Noida Sector 62)</span>
            </div>

            <Button
              id="btn-submit-proof"
              type="submit"
              variant="primary"
              fullWidth
              loading={submittingProof}
            >
              Verify & Complete Delivery
            </Button>
          </form>
        )}
      </Modal>

    </PageShell>
  );
};

export default DeliveryDashboard;
