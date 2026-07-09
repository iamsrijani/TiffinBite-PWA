import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/api.js';
import { useUiStore } from '../../store/uiStore.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { StatusStepper } from '../../components/ui/StatusStepper.jsx';
import { RatingStars } from '../../components/ui/RatingStars.jsx';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.jsx';
import { PageShell } from '../../components/layout/PageShell.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { MessageSquare, Star, Truck, Calendar, MapPin, CheckCircle, Flame, ShieldAlert, Award } from 'lucide-react';
import { format } from 'date-fns';

export const Orders = () => {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Feedback Modal
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchOrders = async (targetPage = 1) => {
    setLoading(true);
    try {
      const response = await orderService.getMy(targetPage);
      if (response.success) {
        setOrders(response.data);
        setPage(response.page || 1);
        setTotalPages(response.pages || 1);
      }
    } catch (err) {
      addToast(err.message || 'Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const getStepIndex = (status) => {
    switch (status) {
      case 'scheduled':
        return 0;
      case 'preparing':
        return 1;
      case 'out_for_delivery':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
      default:
        return 0;
    }
  };

  const steps = [
    { label: 'Scheduled', icon: <Calendar size={14} /> },
    { label: 'Preparing', icon: <Flame size={14} /> },
    { label: 'Out for Delivery', icon: <Truck size={14} /> },
    { label: 'Delivered', icon: <CheckCircle size={14} /> },
  ];

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const handleOpenFeedback = (order, e) => {
    e.stopPropagation(); // prevent opening details
    setFeedbackOrder(order);
    setRating(5);
    setComment('');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      addToast('Please provide a rating between 1 and 5.', 'warning');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const response = await orderService.submitFeedback(feedbackOrder._id, rating, comment);
      if (response.success) {
        addToast('Thank you for your feedback!', 'success');
        setShowFeedbackModal(false);
        fetchOrders(page); // refresh list
      }
    } catch (err) {
      addToast(err.message || 'Feedback submission failed.', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'delivered':
        return 'veg';
      case 'cancelled':
        return 'nonveg';
      case 'scheduled':
      case 'preparing':
      case 'out_for_delivery':
      default:
        return 'glass';
    }
  };

  return (
    <PageShell
      title="My Orders"
      subtitle="Track your active meal boxes or review order history"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {loading ? (
          <LoadingSkeleton type="card" count={3} />
        ) : orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <Card
                key={order._id}
                className="glass card--interactive"
                onClick={() => handleOpenDetail(order)}
                style={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Badge variant={order.mealType === 'lunch' ? 'veg' : 'vegan'}>
                        {order.mealType?.toUpperCase() || 'MEAL'}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>

                    <h4 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 600 }}>
                      {order.menu?.items?.[0]?.name || 'Healthy Daily Tiffin'}
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      Date: {format(new Date(order.date), 'eeee, do MMMM')}
                    </p>
                  </div>

                  {/* Feedback summary / action */}
                  {order.status === 'delivered' && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {order.feedback?.rating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} fill="var(--accent-primary)" color="var(--accent-primary)" />
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{order.feedback.rating} / 5</span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Star}
                          onClick={(e) => handleOpenFeedback(order, e)}
                        >
                          Leave Review
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Status stepper mini review for active orders */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div style={{ marginTop: '12px', pointerEvents: 'none' }}>
                    <StatusStepper steps={steps} currentStep={getStepIndex(order.status)} />
                  </div>
                )}
              </Card>
            ))}

            {/* Pagination Controls */}
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
          <div className="glass" style={{ padding: '40px 20px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <Truck size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: 'var(--text-md)', fontWeight: 600 }}>No Orders Found</h3>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Once your active subscriptions start daily meal generation, your delivery timeline will show up here.
            </p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title="Delivery Status Timeline"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Status Stepper */}
            {selectedOrder.status !== 'cancelled' ? (
              <div style={{ padding: '10px 0' }}>
                <StatusStepper steps={steps} currentStep={getStepIndex(selectedOrder.status)} />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', color: 'var(--error)' }}>
                <ShieldAlert size={18} />
                <span style={{ fontSize: 'var(--text-xs)' }}>This order was cancelled. Meals carry forward automatically.</span>
              </div>
            )}

            {/* Address */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>DELIVERY LOCATION</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{selectedOrder.deliveryAddress.label}</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {selectedOrder.deliveryAddress.line1}, {selectedOrder.deliveryAddress.line2 && `${selectedOrder.deliveryAddress.line2}, `}{selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Partner */}
            {selectedOrder.deliveryPartner && (
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>DELIVERY RIDER</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Truck size={18} color="var(--accent-secondary)" />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{selectedOrder.deliveryPartner.name || 'Rider Assigned'}</span>
                </div>
              </div>
            )}

            {/* Delivery Proof */}
            {selectedOrder.status === 'delivered' && selectedOrder.deliveryProof?.image && (
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>DELIVERY PROOF PHOTO</span>
                <img
                  src={selectedOrder.deliveryProof.image}
                  alt="Delivery Proof"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}
                />
                {selectedOrder.deliveryProof.notes && (
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Notes: "{selectedOrder.deliveryProof.notes}"
                  </p>
                )}
              </div>
            )}

            {/* Feedback Detail (if exists) */}
            {selectedOrder.feedback?.rating && (
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>YOUR REVIEW</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <RatingStars value={selectedOrder.feedback.rating} readOnly size={16} />
                </div>
                {selectedOrder.feedback.comment && (
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    "{selectedOrder.feedback.comment}"
                  </p>
                )}
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* FEEDBACK MODAL */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Leave Meal Feedback"
      >
        {feedbackOrder && (
          <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              How was your {feedbackOrder.mealType} today? Your feedback helps the kitchen cook better food!
            </p>

            <div>
              <span className="input__label" style={{ display: 'block', marginBottom: '8px' }}>Rating</span>
              <RatingStars value={rating} onChange={setRating} size={28} />
            </div>

            <Input
              id="feedback-comment"
              label="Review / Suggestions"
              placeholder="e.g. Rice was perfect, dal could use a bit more salt."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              icon={MessageSquare}
            />

            <Button
              id="btn-submit-feedback"
              type="submit"
              variant="primary"
              fullWidth
              loading={submittingFeedback}
            >
              Submit Feedback
            </Button>
          </form>
        )}
      </Modal>

    </PageShell>
  );
};

export default Orders;
