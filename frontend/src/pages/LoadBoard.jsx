import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Compass, Clock, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, 
  MapPin, X, AlertTriangle, Truck, DollarSign, Award, Check 
} from 'lucide-react';
import './Pages.css';

const LoadBoard = () => {
  const [publicShipments, setPublicShipments] = useState([]);
  const [bids, setBids] = useState({}); // { shipmentId: [bids...] }
  const [loading, setLoading] = useState(true);

  // In-App Confirmation Modal & Toast States
  const [acceptModal, setAcceptModal] = useState({
    isOpen: false,
    bid: null,
    shipment: null,
    submitting: false
  });

  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });
  const toastTimeoutRef = useRef(null);

  const showToast = (title, message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, type, title, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const fetchPublicShipments = async () => {
    try {
      const res = await axios.get('/network/load-board');
      if (res.data.success) {
        setPublicShipments(res.data.data);
        
        // Fetch bids for each shipment
        res.data.data.forEach(shipment => {
          fetchBidsForShipment(shipment._id);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidsForShipment = async (id) => {
    try {
      const res = await axios.get(`/network/shipments/${id}/bids`);
      if (res.data.success) {
        setBids(prev => ({ ...prev, [id]: res.data.data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPublicShipments();
  }, []);

  const handleGenerateMockBids = async (id) => {
    try {
      const res = await axios.post(`/network/shipments/${id}/mock-bids`);
      if (res.data.success) {
        showToast('Bids Generated ✨', res.data.message || 'Simulated carrier bids received.', 'success');
        fetchBidsForShipment(id);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to generate simulated bids', 'error');
    }
  };

  const openAcceptModal = (bid, shipment) => {
    setAcceptModal({
      isOpen: true,
      bid,
      shipment,
      submitting: false
    });
  };

  const closeAcceptModal = () => {
    if (acceptModal.submitting) return;
    setAcceptModal({ isOpen: false, bid: null, shipment: null, submitting: false });
  };

  const handleConfirmAcceptBid = async () => {
    if (!acceptModal.bid) return;
    try {
      setAcceptModal(prev => ({ ...prev, submitting: true }));
      const res = await axios.put(`/network/bids/${acceptModal.bid._id}/accept`);
      if (res.data) {
        const carrier = acceptModal.bid.carrierName || 'Carrier';
        const track = acceptModal.shipment?.trackingNumber || '';
        closeAcceptModal();
        showToast(
          'Bid Accepted Successfully! 🚀',
          `Bid from ${carrier} has been accepted for shipment #${track}. Carrier is assigned and notified in real-time.`,
          'success'
        );
        fetchPublicShipments(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to accept bid:', err);
      showToast('Error', err.response?.data?.message || 'Failed to accept bid', 'error');
      setAcceptModal(prev => ({ ...prev, submitting: false }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ color: '#00e5ff' }}>Loading the ShipNova Premium Network...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      {/* Background glow effects for Network Premium Feel */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%)', zIndex: 0
      }} />

      <div className="page-header-section" style={{ borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: '24px', zIndex: 1, position: 'relative' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Compass color="#00e5ff" size={32} />
            Public Load Board
            <span className="premium-badge" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>PRO</span>
          </h1>
          <p className="page-subtitle" style={{ color: '#a0aec0' }}>
            Broadcast your open capacity to 10,000+ verified carriers and receive competitive bids instantly.
          </p>
        </div>
      </div>

      <div style={{ zIndex: 1, position: 'relative', marginTop: '24px' }}>
        {publicShipments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px', background: 'rgba(15,23,42,0.6)', border: '1px dashed rgba(0,229,255,0.3)' }}>
            <Sparkles size={48} color="#00e5ff" style={{ margin: '0 auto 16px auto', opacity: 0.8 }} />
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>The Marketplace is Waiting</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You haven't posted any shipments to the public load board yet.</p>
            <p style={{ color: 'var(--text-secondary)' }}>Go to <b>My Shipments</b> and toggle "Post to Network" to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {publicShipments.map(shipment => {
              const shipmentBids = bids[shipment._id] || [];
              const lowestBid = shipmentBids.length > 0 ? Math.min(...shipmentBids.map(b => b.bidAmount)) : null;

              return (
                <div key={shipment._id} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {/* Shipment Header Info */}
                  <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', display: 'grid', gridTemplateColumns: '2fr 3fr 1fr', gap: '20px', alignItems: 'center' }}>
                    
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                        Tracking #{shipment.trackingNumber}
                      </p>
                      <h3 style={{ color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {shipment.shipmentType} Freight <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>• {shipment.weight} kg</span>
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PICKUP</p>
                        <p style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} color="#00e5ff" />
                          {shipment.pickupAddress}
                        </p>
                      </div>
                      <div style={{ height: '2px', flex: '0.5', background: 'linear-gradient(90deg, #00e5ff, transparent)' }}></div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DELIVERY</p>
                        <p style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} color="#8b5cf6" />
                          {shipment.deliveryAddress}
                        </p>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <button 
                        className="btn" 
                        style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)', width: '100%' }}
                        onClick={() => handleGenerateMockBids(shipment._id)}
                      >
                        <TrendingUp size={16} /> Simulate Bids
                      </button>
                    </div>
                  </div>

                  {/* Bids List */}
                  <div style={{ padding: '24px', background: 'rgba(15,23,42,0.6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Active Bids ({shipmentBids.length})</h4>
                      {lowestBid && (
                        <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                          Lowest Bid: ${lowestBid}
                        </span>
                      )}
                    </div>

                    {shipmentBids.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No bids placed yet. Simulating bids will generate mock offers from carriers.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {shipmentBids.map(bid => (
                          <div key={bid._id} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', 
                            gap: '16px', 
                            alignItems: 'center',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.2s ease',
                            cursor: 'default'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.border = '1px solid rgba(0, 229, 255, 0.3)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateX(0)' }}
                          >
                            <div>
                              <h5 style={{ color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {bid.carrierName}
                                <ShieldCheck size={14} color="#00e5ff" />
                              </h5>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                                Network Verified Carrier
                              </p>
                            </div>
                            
                            <div>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>RATING</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{bid.carrierRating}</span>
                                <span style={{ color: 'var(--text-tertiary)' }}>/ 5.0</span>
                              </div>
                            </div>

                            <div>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>EST. DELIVERY</p>
                              <p style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} color="var(--text-tertiary)" />
                                {bid.estimatedDelivery}
                              </p>
                            </div>

                            <div>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>BID AMOUNT</p>
                              <p style={{ color: '#4ade80', fontSize: '1.2rem', fontWeight: 700 }}>${bid.bidAmount}</p>
                            </div>

                            <div>
                              <button 
                                className="btn btn-primary"
                                style={{ background: '#00e5ff', color: '#000', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                onClick={() => openAcceptModal(bid, shipment)}
                              >
                                <CheckCircle2 size={16} /> Accept
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM ACCEPT BID MODAL */}
      {acceptModal.isOpen && acceptModal.bid && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 10, 20, 0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }} onClick={closeAcceptModal}>
          <div style={{
            background: 'linear-gradient(135deg, #131d31, #0c1424)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 229, 255, 0.15)',
            padding: '28px',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={26} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Accept Carrier Bid</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Assign shipment to carrier & award load
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAcceptModal}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Carrier & Shipment Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipment</span>
                  <div style={{ color: '#00e5ff', fontWeight: 700, fontSize: '0.95rem' }}>
                    #{acceptModal.shipment?.trackingNumber}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agreed Bid Rate</span>
                  <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.4rem' }}>
                    ${acceptModal.bid?.bidAmount}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Selected Carrier</span>
                  <strong style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Truck size={14} color="#00e5ff" /> {acceptModal.bid?.carrierName}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Carrier Rating</span>
                  <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    ⭐ {acceptModal.bid?.carrierRating || '5.0'} / 5.0
                  </strong>
                </div>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.4', margin: '0 0 24px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <ShieldCheck size={18} color="#00e5ff" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Accepting this bid will immediately assign the shipment to <strong>{acceptModal.bid?.carrierName}</strong>, update company dispatch, and remove it from the public load board.
              </span>
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={closeAcceptModal}
                disabled={acceptModal.submitting}
                style={{
                  flex: 1,
                  padding: '13px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAcceptBid}
                disabled={acceptModal.submitting}
                style={{
                  flex: 2,
                  padding: '13px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
              >
                {acceptModal.submitting ? (
                  <span>Assigning Carrier...</span>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Confirm & Assign Carrier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: toast.type === 'success' 
            ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(15, 23, 42, 0.95))' 
            : 'linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(15, 23, 42, 0.95))',
          border: toast.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 229, 255, 0.1)',
          zIndex: 999999,
          maxWidth: '420px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>{toast.title}</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '4px', lineHeight: '1.4' }}>{toast.message}</div>
          </div>
          <button
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadBoard;
