import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { RatingStars } from '../../components/ui/RatingStars.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { MessageSquare, Star, Calendar, User, Smile } from 'lucide-react';
import { format } from 'date-fns';

export const FeedbackView = () => {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeedback = async (targetPage = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getFeedback(targetPage);
      if (response.success && response.data) {
        setFeedbackList(response.data);
        setPage(response.page || 1);
        setTotalPages(response.pages || 1);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch feedback logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback(page);
  }, [page]);

  // Aggregate ratings distribution for quick summary card
  const getAverageRating = () => {
    if (feedbackList.length === 0) return '5.0';
    const sum = feedbackList.reduce((acc, curr) => acc + (curr.feedback?.rating || 5), 0);
    return (sum / feedbackList.length).toFixed(1);
  };

  return (
    <PageShell
      title="Customer Reviews & Ratings"
      subtitle="Operational feedback submitted by subscribers after daily meal deliveries"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* OVERALL RATING BANNER */}
        <Card className="card--highlight glass" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,153,51,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            flexShrink: 0
          }}>
            <Smile size={32} />
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>GLOBAL SATISFACTION SCORE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <h2 style={{ margin: 0, fontSize: 'var(--text-3xl)', fontWeight: 800 }}>{getAverageRating()} / 5.0</h2>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Star size={20} fill="var(--accent-primary)" color="var(--accent-primary)" />
              </div>
            </div>
          </div>
        </Card>

        {/* FEEDBACK FEED LIST */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>
            Recent Reviews ({feedbackList.length})
          </h3>

          {loading && feedbackList.length === 0 ? (
            <LoadingSkeleton type="text" count={4} />
          ) : feedbackList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {feedbackList.map((order) => (
                <Card key={order._id} className="glass" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-glass)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-secondary)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700
                      }}>
                        {order.user?.name ? order.user.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {order.user?.name || 'Customer'}
                        </span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          ({order.mealType} meal)
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <RatingStars value={order.feedback.rating} readOnly size={14} />
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        <Calendar size={10} />
                        {order.feedback.createdAt ? format(new Date(order.feedback.createdAt), 'MMM dd, h:mm a') : 'Recent'}
                      </span>
                    </div>

                  </div>

                  {order.feedback.comment && (
                    <p style={{ margin: '8px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4, fontStyle: 'italic', paddingLeft: '36px' }}>
                      "{order.feedback.comment}"
                    </p>
                  )}
                </Card>
              ))}

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
          ) : (
            <div className="glass" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <MessageSquare size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                No feedback reviews registered in the system yet.
              </p>
            </div>
          )}
        </div>

      </div>
    </PageShell>
  );
};

export default FeedbackView;
