import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Compass, Clock, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import './Pages.css';

const LoadBoard = () => {
  const [publicShipments, setPublicShipments] = useState([]);
  const [bids, setBids] = useState({}); // { shipmentId: [bids...] }
  const [loading, setLoading] = useState(true);

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
        alert(res.data.message);
        fetchBidsForShipment(id);
      }
    } catch (err) {
      console.error(err);
      alert('Error generating bids');
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (window.confirm('Accept this bid? The carrier will be assigned to this shipment and it will be removed from the public load board.')) {
      try {
        const res = await axios.put(`/network/bids/${bidId}/accept`);
        if (res.data) {
          alert('Bid accepted successfully! Carrier assigned.');
          fetchPublicShipments(); // Refresh list
        }
      } catch (err) {
        console.error('Failed to accept bid:', err);
        alert('Failed to accept bid');
      }
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
                                style={{ background: '#00e5ff', color: '#000', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => handleAcceptBid(bid._id)}
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
    </div>
  );
};

export default LoadBoard;
