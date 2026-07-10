import React, { useEffect, useState } from 'react';
import { walletService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const Wallet = () => {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add funds form states
  const [amount, setAmount] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);

  const fetchWallet = async (targetPage = 1) => {
    setLoading(true);
    try {
      const balanceRes = await walletService.get();
      if (balanceRes.success) {
        const walletData = balanceRes.data;
        setBalance(walletData.balanceInRupees);
      }

      const txRes = await walletService.getTransactions(targetPage);
      if (txRes.success) {
        setTransactions(txRes.data);
        setPage(txRes.page || 1);
        setTotalPages(txRes.pages || 1);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load wallet ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet(page);
  }, [page]);

  
  const handleRazorpayPayment = async (amount) => {
    try {
      const orderRes = await walletService.createOrder(amount * 100);
      if (!orderRes.success) return;
      const options = {
        key: orderRes.key,
        amount: orderRes.order.amount,
        currency: 'INR',
        name: 'DailyBite',
        description: 'Wallet Recharge',
        order_id: orderRes.order.id,
        handler: async (response) => {
          const verifyRes = await walletService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: amount * 100,
          });
          if (verifyRes.success) {
            addToast('Payment successful!', 'success');
            fetchWallet(1);
          }
        },
        prefill: { name: 'DailyBite User' },
        theme: { color: '#ff6b35' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      addToast('Payment failed', 'error');
    }
  };

  const handleAddFunds = async (e) => {
    if (e) e.preventDefault();
    
    const value = parseInt(amount, 10);
    if (isNaN(value) || value <= 0) {
      addToast('Please enter a valid recharge amount.', 'warning');
      return;
    }

    setAddingFunds(true);
    try {
      // Amount in paise (multiply by 100)
      const amountInPaise = value * 100;
      const response = await walletService.addFunds(amountInPaise);
      
      if (response.success) {
        addToast(`Recharged ₹${value.toFixed(2)} successfully!`, 'success');
        setAmount('');
        fetchWallet(1); // reload wallet balance and transaction lists
      }
    } catch (err) {
      addToast(err.message || 'Payment recharge failed.', 'error');
    } finally {
      setAddingFunds(false);
    }
  };

  const handleQuickRecharge = (val) => {
    setAmount(val.toString());
  };

  return (
    <PageShell
      title="DailyBite Wallet"
      subtitle="Add funds to purchase subscription meals and track your spend history"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* SECTION 1: Wallet Balance & Quick Add */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Card: Current Balance */}
          <Card className="card--highlight glass" style={{ flex: 1, minWidth: '280px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-secondary)', marginBottom: '8px' }}>
              <WalletIcon size={20} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.5px' }}>CURRENT BALANCE</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 'var(--text-4xl)', fontWeight: 800 }}>
              ₹{parseFloat(balance).toFixed(2)}
            </h2>
            <p style={{ margin: '8px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Fully encrypted secure checkout
            </p>
          </Card>

          {/* Card: Add Money form */}
          <Card className="glass" style={{ flex: 1.2, minWidth: '320px', padding: '24px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Recharge Wallet</h4>
            
            <form onSubmit={handleAddFunds} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Input
                  id="wallet-add-amount"
                  placeholder="Enter amount (₹)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  style={{ flex: 1 }}
                  required
                />
                <Button
                  id="btn-add-funds"
                  type="submit"
                  variant="primary"
                  loading={addingFunds}
                  icon={Plus}
                >
                  Add Funds
                </Button>
              </div>

              {/* Quick pre-sets */}
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>QUICK PRE-SETS</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[200, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickRecharge(val)}
                      className="glass"
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-glass)',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        background: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.color = 'var(--accent-primary)'; }}
                      onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.color = 'var(--text-secondary)'; }}
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* SECTION 2: Transaction Ledger */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
            Transaction History
          </h3>

          {loading && transactions.length === 0 ? (
            <LoadingSkeleton type="text" count={5} />
          ) : transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transactions.map((tx) => {
                const isCredit = tx.type === 'credit';
                const TxIcon = isCredit ? ArrowDownLeft : ArrowUpRight;
                const txColor = isCredit ? 'var(--success)' : 'var(--error)';

                return (
                  <Card key={tx._id} className="glass" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isCredit ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: txColor,
                        border: `1px solid ${isCredit ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}`
                      }}>
                        <TxIcon size={18} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>{tx.description || 'Transaction'}</h4>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Calendar size={12} />
                          {format(new Date(tx.createdAt), 'MMM dd, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <strong style={{ color: txColor, fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                        {isCredit ? '+' : '-'} ₹{(tx.amount / 100).toFixed(2)}
                      </strong>
                      {tx.referenceId && (
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Ref: {tx.referenceId.slice(-8)}</span>
                      )}
                    </div>
                  </Card>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                No wallet transactions found yet.
              </p>
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
};

export default Wallet;
