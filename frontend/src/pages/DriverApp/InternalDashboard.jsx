import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Navigation, CheckCircle, Clock, Wallet, MessageSquare, Briefcase, Settings, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InternalDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const isFetchingRef = useRef(false);

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
      }
    } catch (err) {
      console.error('Failed to update live status:', err);
      alert('Failed to update live status');
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

  const reportIssue = async (id) => {
    const issue = prompt("Describe the issue (e.g., breakdown, heavy traffic):");
    if (!issue) return;

    try {
      const token = localStorage.getItem('driverToken');
      const res = await axios.post(`/driver-auth/shipments/${id}/issue`, 
        { issue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert('Issue reported successfully. Admin will be notified.');
        fetchTrips();
      }
    } catch (err) {
      console.error('Failed to report issue:', err);
      alert('Failed to report issue');
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
        fetchTrips();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
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
            
            <div className="trip-locations">
              <div className="trip-point">
                <h4>Pickup</h4>
                <p>Warehouse / HQ</p>
              </div>
              <div className="trip-point">
                <h4>Dropoff</h4>
                <p>Customer Location</p>
              </div>
            </div>

            {trip.status !== 'Delivered' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="app-btn" onClick={() => reportIssue(trip._id)} style={{ flex: 1, padding: '10px', fontSize: '0.85rem', background: '#ef4444', color: '#fff', border: 'none' }}>
                  <MessageSquare size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Report Issue
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
    </>
  );
};

export default InternalDashboard;
