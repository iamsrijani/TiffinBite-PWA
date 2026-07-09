import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { Users, TrendingUp, Calendar, ShoppingBag, DollarSign, PieChart, ShieldAlert } from 'lucide-react';

export const Dashboard = () => {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch admin stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <PageShell title="Admin Dashboard">
        <LoadingSkeleton type="card" count={2} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Admin Control Center"
      subtitle="Overview of kitchen operations, daily sales, active subscribers, and delivery metrics"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* STATS ROW */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Total Users */}
            <Card className="glass" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>TOTAL CUSTOMERS</span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                  {stats.totalUsers || 0}
                </h3>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--info)', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
            </Card>

            {/* Active Subscriptions */}
            <Card className="glass" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>ACTIVE PLANS</span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                  {stats.activeSubscriptions || 0}
                </h3>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--success)', justifyContent: 'center' }}>
                <TrendingUp size={20} />
              </div>
            </Card>

            {/* Today's Orders */}
            <Card className="glass" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>TODAY'S ORDERS</span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                  {stats.todayOrdersCount || 0}
                </h3>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--warning)', justifyContent: 'center' }}>
                <ShoppingBag size={20} />
              </div>
            </Card>

            {/* Total Sales Revenue */}
            <Card className="glass" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                  ₹{(stats.totalRevenue / 100 || 0).toFixed(2)}
                </h3>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,153,51,0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--accent-primary)', justifyContent: 'center' }}>
                <DollarSign size={20} />
              </div>
            </Card>
          </div>
        )}

        {/* DIETARY SPLIT */}
        {stats?.dietSplit && (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            
            {/* Card: Meal Diet counts */}
            <Card className="glass" style={{ flex: 1.5, minWidth: '320px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <PieChart size={18} color="var(--accent-primary)" />
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>Operational Kitchen Splits (Today's Orders)</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                  <Badge variant="veg">VEG</Badge>
                  <h3 style={{ margin: '12px 0 0 0', fontSize: 'var(--text-xl)', fontWeight: 800 }}>{stats.dietSplit.veg || 0}</h3>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>meals</span>
                </div>
                
                <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                  <Badge variant="nonveg">NON-VEG</Badge>
                  <h3 style={{ margin: '12px 0 0 0', fontSize: 'var(--text-xl)', fontWeight: 800 }}>{stats.dietSplit.nonveg || 0}</h3>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>meals</span>
                </div>

                <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                  <Badge variant="vegan">VEGAN</Badge>
                  <h3 style={{ margin: '12px 0 0 0', fontSize: 'var(--text-xl)', fontWeight: 800 }}>{stats.dietSplit.vegan || 0}</h3>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>meals</span>
                </div>
              </div>
            </Card>

            {/* Card: Pending Dispatch Status */}
            <Card className="glass" style={{ flex: 1, minWidth: '260px', padding: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Delivery Milestone Splits</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.statusSplit && Object.entries(stats.statusSplit).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {status.replace(/_/g, ' ')}
                    </span>
                    <strong style={{ fontSize: 'var(--text-xs)' }}>{count}</strong>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        )}

      </div>
    </PageShell>
  );
};

export default Dashboard;
