import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Navigation, CheckCircle, Clock, Wallet, MessageSquare, Briefcase, 
  Settings, RefreshCw, X, AlertTriangle, CheckCircle2, Info 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InternalDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const isFetchingRef = useRef(false);

  // In-App Toast & Modal States
  const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });
  const toastTimeoutRef = useRef(null);

  const showToast = (title, message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, type, title, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const [issueModal, setIssueModal] = useState({
    isOpen: false,
    tripId: null,
    selectedTag: 'Vehicle Breakdown',
    customText: '',
    submitting: false
  });

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('driverToken');
      const res = await axios.put('/driver-auth/my-status', 
        { currentStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setDriverProfile({ ...driverProfile, currentStatus: newStatus });
        showToast('Duty Status Changed', `You are now marked as ${newStatus}`, 'success');
      }
    } catch (err) {
      showToast('Error', 'Failed to update live status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchTrips = async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent) setIsRefreshing(true);

    try {
      const token = localStorage.getItem('driverToken');
      if (!token) return;

      const [tripsRes, profileRes] = await Promise.allSettled([
        axios.get('/driver-auth/my-trips', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/driver-auth/profile', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (tripsRes.status === 'fulfilled' && tripsRes.value?.data?.success) {
        setTrips(tripsRes.value.data.data || []);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value?.data?.success) {
        setDriverProfile(profileRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch internal driver data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchTrips();

    // 1. WebSocket custom event listener
    const handleTripUpdate = (e) => {
      fetchTrips(true);
      setActiveTab('trips');
    };
    window.addEventListener('driver:tripUpdated', handleTripUpdate);

    // 2. Auto-polling every 6 seconds
    const pollInterval = setInterval(() => {
      fetchTrips(true);
    }, 6000);

    // 3. Auto-refresh when returning to tab
    const handleFocus = () => {
      fetchTrips(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('driver:tripUpdated', handleTripUpdate);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const [activeTab, setActiveTab] = useState('trips'); // 'trips' or 'earnings'

  const openIssueModal = (tripId) => {
    setIssueModal({
      isOpen: true,
      tripId,
      selectedTag: 'Vehicle Breakdown',
      customText: '',
      submitting: false
    });
  };

  const closeIssueModal = () => {
    if (issueModal.submitting) return;
    setIssueModal({ isOpen: false, tripId: null, selectedTag: 'Vehicle Breakdown', customText: '', submitting: false });
  };

  const handleIssueSubmit = async (e) => {
    if (e) e.preventDefault();
    const finalDescription = issueModal.customText.trim()
      ? `[${issueModal.selectedTag}] ${issueModal.customText.trim()}`
      : `[${issueModal.selectedTag}] Reported by internal driver`;

    try {
      setIssueModal(prev => ({ ...prev, submitting: true }));
      const token = localStorage.getItem('driverToken');
      const res = await axios.post(`/driver-auth/shipments/${issueModal.tripId}/issue`, 
        { issue: finalDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        closeIssueModal();
        showToast('Incident Reported ⚠️', 'Fleet operations has been notified.', 'info');
        fetchTrips(true);
      }
    } catch (err) {
      showToast('Report Failed', err.response?.data?.message || 'Failed to report issue', 'error');
      setIssueModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('driverToken');
      const res = await axios.put(`/driver-auth/trip-status/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showToast('Trip Status Updated', `Status changed to ${newStatus}`, 'success');
        fetchTrips(true);
      }
    } catch (err) {
      showToast('Update Failed', 'Failed to update trip status', 'error');
    }
  };

  if (loading) return <div className="app-content" style={{ color: '#fff' }}>Loading trips...</div>;

  return (
    <>
      <div className="app-content">
        {activeTab === 'trips' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>My Assigned Trips</h3>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }}></span>
                  LIVE
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fetchTrips(false)}
                  title="Refresh now"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    color: isRefreshing ? '#00e5ff' : '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
                  <span>Sync</span>
                </button>
                <Briefcase size={20} color="#10b981" />
              </div>
            </div>
            
            {trips.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '35px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Briefcase size={36} color="#4b5563" style={{ marginBottom: '10px' }} />
                <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 6px 0' }}>No trips assigned today</p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>New deliveries dispatched by company manager will appear here live in real-time.</p>
              </div>
            ) : (
              trips.map(trip => (
                <div key={trip._id} className="trip-card">
                  <div className={`trip-badge badge-${trip.status.toLowerCase().replace(' ', '-')}`}>
                    {trip.status}
                  </div>
                  <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '15px' }}>{trip.trackingNumber}</div>
                  
                  {trip.issueReported && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>
                        <MessageSquare size={12} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        <strong>Reported Issue:</strong> {trip.issueReported}
                      </p>
                    </div>
                  )}
            
            <div className="trip-locations" style={{ marginBottom: '12px' }}>
              <div className="trip-point">
                <h4>Pickup</h4>
                <p style={{ wordBreak: 'break-word' }}>{trip.pickupAddress || 'HQ Warehouse'}</p>
              </div>
              <div className="trip-point">
                <h4>Dropoff</h4>
                <p style={{ wordBreak: 'break-word' }}>{trip.deliveryAddress || 'Customer Location'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', fontSize: '0.72rem', color: '#94a3b8' }}>
              {trip.senderName && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>👤 From: {trip.senderName}</span>}
              {trip.receiverName && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>📍 To: {trip.receiverName}</span>}
              {trip.weight && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>⚖️ {trip.weight} kg</span>}
            </div>

            {trip.status !== 'Delivered' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="app-btn" onClick={() => openIssueModal(trip._id)} style={{ flex: 1, padding: '10px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <MessageSquare size={14} /> Report Issue
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {trip.status === 'Assigned' && (
                <button className="app-btn" onClick={() => updateStatus(trip._id, 'Picked Up')} style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>
                  <Clock size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Pick Up
                </button>
              )}
              {trip.status === 'Picked Up' && (
                <button className="app-btn" onClick={() => updateStatus(trip._id, 'In Transit')} style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>
                  <Navigation size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Start Transit
                </button>
              )}
              {trip.status === 'In Transit' && (
                <button className="app-btn" onClick={() => updateStatus(trip._id, 'Delivered')} style={{ flex: 1, padding: '10px', fontSize: '0.85rem', background: '#10b981', color: '#fff' }}>
                  <CheckCircle size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Mark Delivered
                </button>
              )}
            </div>
          </div>
        ))
      )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>My Earnings</h3>
              <Wallet size={20} color="#f59e0b" />
            </div>
            
            <div style={{ background: 'linear-gradient(135deg, #f59e0b22, #f59e0b11)', border: '1px solid #f59e0b44', borderRadius: '12px', padding: '15px', textAlign: 'center', marginBottom: '25px' }}>
              <p style={{ color: '#9ca3af', margin: '0 0 5px 0', fontSize: '0.9rem' }}>Total Earned</p>
              <h2 style={{ color: '#f59e0b', fontSize: '2rem', margin: 0 }}>${trips.filter(t => t.status === 'Delivered').reduce((sum, t) => sum + (t.revenue || 0), 0).toLocaleString()}</h2>
            </div>

            <h4 style={{ color: '#fff', marginBottom: '15px' }}>Growth Analytics</h4>
            <div style={{ height: '200px', width: '100%', marginBottom: '30px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trips.filter(t => t.status === 'Delivered').map((t, i) => ({ name: `Trip ${i+1}`, earned: t.revenue || 0 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} 
                    formatter={(value) => [`$${value}`, 'Earned']}
                  />
                  <Bar dataKey="earned" fill="url(#colorEarned)" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <h4 style={{ color: '#fff', marginBottom: '15px' }}>Payment History</h4>
            {trips.filter(t => t.status === 'Delivered').length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center' }}>No completed trips yet.</p>
            ) : (
              trips.filter(t => t.status === 'Delivered').map(trip => (
                <div key={trip._id} className="trip-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{trip.trackingNumber}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '5px' }}>Delivered</div>
                  </div>
                  <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    +${trip.revenue || 0}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>My Profile</h3>
              <Settings size={20} color="#9ca3af" />
            </div>

            <div className="trip-card">
              <h4 style={{ color: '#fff', marginBottom: '15px' }}>Account Details</h4>
              {driverProfile ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#9ca3af' }}>Name:</span>
                    <span style={{ color: '#fff' }}>{driverProfile.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#9ca3af' }}>Username:</span>
                    <span style={{ color: '#fff' }}>{driverProfile.username}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#9ca3af' }}>Phone:</span>
                    <span style={{ color: '#fff' }}>{driverProfile.phone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#9ca3af' }}>License:</span>
                    <span style={{ color: '#fff' }}>{driverProfile.licenseNumber}</span>
                  </div>

                  <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <span style={{ color: '#9ca3af', display: 'block', marginBottom: '5px' }}>Live Availability:</span>
                      <p style={{ color: '#fff', margin: 0, fontSize: '0.8rem' }}>Let admins know you are ready for a load.</p>
                    </div>
                    <select
                      className="app-input"
                      value={driverProfile.currentStatus || 'Available'}
                      onChange={handleStatusChange}
                      disabled={updatingStatus}
                      style={{ width: '130px', margin: 0, padding: '8px 12px', backgroundColor: driverProfile.currentStatus === 'Available' ? 'rgba(16, 185, 129, 0.2)' : driverProfile.currentStatus === 'On Duty' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: driverProfile.currentStatus === 'Available' ? '#10b981' : driverProfile.currentStatus === 'On Duty' ? '#3b82f6' : '#ef4444', border: 'none', fontWeight: 'bold' }}
                    >
                      <option value="Available">Available</option>
                      <option value="On Duty">On Duty</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af' }}>Loading profile...</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="app-bottom-nav">
        <button 
          className={`driver-nav-item ${activeTab === 'trips' ? 'active' : ''}`}
          onClick={() => setActiveTab('trips')}
          style={{ position: 'relative' }}
        >
          <Briefcase size={20} />
          <span>My Trips</span>
          {trips.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '16px',
              backgroundColor: '#10b981',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              minWidth: '17px',
              height: '17px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
            }}>
              {trips.length}
            </span>
          )}
        </button>
        <button 
          className={`driver-nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          <Wallet size={20} />
          <span>Earnings</span>
        </button>
        <button 
          className={`driver-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <Settings size={20} />
          <span>Profile</span>
        </button>
      </div>

      {/* IN-APP TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`driver-toast driver-toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />}
          {toast.type === 'error' && <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />}
          {toast.type === 'info' && <Info size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}>{toast.title}</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '2px', lineHeight: '1.3' }}>{toast.message}</div>
          </div>
          <button
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* IN-APP ISSUE REPORT MODAL */}
      {issueModal.isOpen && (
        <div className="driver-modal-overlay" onClick={closeIssueModal}>
          <div className="driver-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle-bar"></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Report Transit Incident</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>Fleet operations will be notified instantly</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeIssueModal}
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick incident chips */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Select Incident Type:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {['Vehicle Breakdown', 'Heavy Traffic', 'Weather Delay', 'Flat Tire', 'Accident Ahead', 'Customer Absent'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setIssueModal(prev => ({ ...prev, selectedTag: tag }))}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: issueModal.selectedTag === tag ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                      background: issueModal.selectedTag === tag ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.04)',
                      color: issueModal.selectedTag === tag ? '#ef4444' : '#cbd5e1',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleIssueSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Additional Incident Details (Optional):</span>
                <textarea
                  rows={3}
                  placeholder="Describe location, delay reason, or current vehicle condition..."
                  value={issueModal.customText}
                  onChange={(e) => setIssueModal(prev => ({ ...prev, customText: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.85rem',
                    color: '#fff',
                    background: '#0a0f1d',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    outline: 'none',
                    marginTop: '6px',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={closeIssueModal}
                  disabled={issueModal.submitting}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issueModal.submitting}
                  style={{ flex: 2, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.35)' }}
                >
                  {issueModal.submitting ? <RefreshCw size={16} className="spin-icon" /> : 'Submit Incident Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InternalDashboard;
