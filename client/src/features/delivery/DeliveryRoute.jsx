import React, { useEffect, useState } from 'react';
import { deliveryService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { MapPin, Navigation, Truck, ChevronDown, ChevronUp } from 'lucide-react';

export const DeliveryRoute = () => {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [pincodeGroups, setPincodeGroups] = useState({});
  const [expandedPincodes, setExpandedPincodes] = useState({});

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await deliveryService.getMy();
      if (response.success && response.data) {
        setDeliveries(response.data);
        
        // Group deliveries by pincode for route optimization
        const groups = response.data.reduce((acc, curr) => {
          const pin = curr.deliveryAddress.pincode || 'Other';
          if (!acc[pin]) acc[pin] = [];
          acc[pin].push(curr);
          return acc;
        }, {});

        setPincodeGroups(groups);

        // Expand all pincodes by default
        const expansions = Object.keys(groups).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setExpandedPincodes(expansions);
      }
    } catch (err) {
      addToast(err.message || 'Failed to calculate optimized route.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const toggleExpand = (pincode) => {
    setExpandedPincodes((prev) => ({ ...prev, [pincode]: !prev[pincode] }));
  };

  const getPincodeTitle = (pincode, items) => {
    const pending = items.filter((i) => i.status !== 'delivered').length;
    return `${pincode} (${items.length} Box${items.length > 1 ? 'es' : ''}${pending > 0 ? `, ${pending} Pending` : ''})`;
  };

  if (loading) {
    return (
      <PageShell title="Route Optimization">
        <LoadingSkeleton type="card" count={2} />
      </PageShell>
    );
  }

  const pincodes = Object.keys(pincodeGroups);

  return (
    <PageShell
      title="Optimal Route Delivery Sequence"
      subtitle="Deliveries grouped by postal code (pincodes) for maximum speed and fuel optimization"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SUMMARY CARD */}
        <Card className="card--highlight glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,153,51,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            flexShrink: 0
          }}>
            <Truck size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>Route Overview</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Assigned to cover <strong>{pincodes.length} sectors/areas</strong> containing <strong>{deliveries.length} total tiffin drops</strong> today.
            </p>
          </div>
        </Card>

        {/* PINCODE SEQUENCE */}
        {pincodes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pincodes.map((pin, index) => {
              const items = pincodeGroups[pin];
              const isExpanded = expandedPincodes[pin];

              return (
                <div key={pin} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Accordian Header */}
                  <div
                    onClick={() => toggleExpand(pin)}
                    className="glass"
                    style={{
                      padding: '14px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge variant="glass" style={{ minWidth: '24px', textAlign: 'center' }}>#{index + 1}</Badge>
                      <span>Pincode: {getPincodeTitle(pin, items)}</span>
                    </span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {/* Accordian Child Items list */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '16px', borderLeft: '2px dashed var(--border-glass)' }}>
                      {items.map((delivery, dIdx) => (
                        <Card key={delivery._id} className="glass" style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                                <Badge variant="glass">Sequence #{dIdx + 1}</Badge>
                                <Badge variant={delivery.mealType === 'lunch' ? 'veg' : 'vegan'}>
                                  {delivery.mealType.toUpperCase()}
                                </Badge>
                                <Badge variant={delivery.status === 'delivered' ? 'veg' : 'glass'}>
                                  {delivery.status.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <h5 style={{ margin: '6px 0 2px 0', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                                Drop {dIdx + 1}: {delivery.user.name}
                              </h5>
                              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                Address: {delivery.deliveryAddress.line1}, {delivery.deliveryAddress.line2}
                              </p>
                            </div>

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${delivery.deliveryAddress.coordinates?.lat || 28.53},${delivery.deliveryAddress.coordinates?.lng || 77.34}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn--xs btn--outline"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                            >
                              <Navigation size={12} />
                              Navigate
                            </a>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <MapPin size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: 0 }}>No Routes Computed</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              No deliveries assigned to calculate maps optimization.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default DeliveryRoute;
