import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Map, DollarSign, Briefcase, Navigation, CheckCircle, Clock, Wallet, 
  MessageSquare, Settings, RefreshCw, Radio, X, AlertTriangle, CheckCircle2, 
  Send, Sparkles, ChevronRight, Info 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExternalDashboard = () => {
  const [publicLoads, setPublicLoads] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
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

  const [bidModal, setBidModal] = useState({
    isOpen: false,
    load: null,
    amount: '',
    submitting: false,
    error: ''
  });

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
        showToast('Status Updated', `You are now marked as ${newStatus}`, 'success');
      }
    } catch (err) {
      showToast('Status Error', 'Failed to update live status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchLoadsAndTrips = async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent) setIsRefreshing(true);

    try {
      const token = localStorage.getItem('driverToken');
      if (!token) return;

      // Parallel fetch for speed
      const [loadsRes, tripsRes, profileRes] = await Promise.allSettled([
        axios.get('/driver-auth/public-loads', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/driver-auth/my-trips', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/driver-auth/profile', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (loadsRes.status === 'fulfilled' && loadsRes.value?.data?.success) {
        setPublicLoads(loadsRes.value.data.data || []);
      }
      if (tripsRes.status === 'fulfilled' && tripsRes.value?.data?.success) {
        setMyTrips(tripsRes.value.data.data || []);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value?.data?.success) {
        setDriverProfile(profileRes.value.data.data);
        if (profileRes.value.data.data?.vehicleType) {
          setVehicleType(profileRes.value.data.data.vehicleType);
        }
      }
    } catch (err) {
      console.error('Failed to fetch driver data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // 1. Initial fetch
    fetchLoadsAndTrips();

    // 2. Real-time WebSocket event listener (Fired when admin accepts driver's bid)
    const handleTripUpdate = (e) => {
      fetchLoadsAndTrips(true);
      // Automatically switch to 'trips' tab so the driver sees their won trip immediately!
      setActiveTab('trips');
    };

    window.addEventListener('driver:tripUpdated', handleTripUpdate);
    window.addEventListener('driver:bidAccepted', handleTripUpdate);

    // 3. Auto-polling every 6 seconds for background real-time sync
    const pollInterval = setInterval(() => {
      fetchLoadsAndTrips(true);
    }, 6000);

    // 4. Auto-refresh when user returns to this browser tab
    const handleFocus = () => {
      fetchLoadsAndTrips(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('driver:tripUpdated', handleTripUpdate);
      window.removeEventListener('driver:bidAccepted', handleTripUpdate);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const openBidModal = (load) => {
    if (driverProfile && !driverProfile.isVerified) {
      showToast('KYC Verification Required', 'Your profile is awaiting admin approval before you can place bids.', 'error');
      return;
    }
    setBidModal({
      isOpen: true,
      load,
      amount: '',
      submitting: false,
      error: ''
    });
  };

  const closeBidModal = () => {
    if (bidModal.submitting) return;
    setBidModal({ isOpen: false, load: null, amount: '', submitting: false, error: '' });
  };

  const handleQuickAdd = (delta) => {
    const current = Number(bidModal.amount) || 0;
    setBidModal(prev => ({ ...prev, amount: String(current + delta), error: '' }));
  };

  const handleBidSubmit = async (e) => {
    if (e) e.preventDefault();
    const numericAmount = Number(bidModal.amount);
    if (!bidModal.amount || isNaN(numericAmount) || numericAmount <= 0) {
      setBidModal(prev => ({ ...prev, error: 'Please enter a valid amount greater than $0' }));
      return;
    }

    try {
      setBidModal(prev => ({ ...prev, submitting: true, error: '' }));
      const token = localStorage.getItem('driverToken');
      const res = await axios.post(`/driver-auth/shipments/${bidModal.load._id}/bids`, 
        { amount: numericAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const loadTrack = bidModal.load.trackingNumber;
        closeBidModal();
        showToast(
          'Bid Placed Successfully! 🎯',
          `Your offer of $${numericAmount.toLocaleString()} for shipment ${loadTrack} has been sent to the dispatcher.`,
          'success'
        );
        fetchLoadsAndTrips(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place bid. Please try again.';
      setBidModal(prev => ({ ...prev, submitting: false, error: msg }));
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
        fetchLoadsAndTrips(true);
      }
    } catch (err) {
      showToast('Update Failed', 'Failed to update trip status', 'error');
    }
  };

  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'trips' or 'earnings'
  const [vehicleType, setVehicleType] = useState('Any');

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
      : `[${issueModal.selectedTag}] Reported by carrier`;

    try {
      setIssueModal(prev => ({ ...prev, submitting: true }));
      const token = localStorage.getItem('driverToken');
      const res = await axios.post(`/driver-auth/shipments/${issueModal.tripId}/issue`, 
        { issue: finalDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        closeIssueModal();
        showToast('Incident Reported ⚠️', 'Operations dispatch has been alerted to provide support.', 'info');
        fetchLoadsAndTrips(true);
      }
    } catch (err) {
      showToast('Report Failed', err.response?.data?.message || 'Failed to report issue', 'error');
      setIssueModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleVehicleChange = async (e) => {
    const newType = e.target.value;
    setVehicleType(newType);
    try {
      const token = localStorage.getItem('driverToken');
      await axios.put('/driver-auth/profile', 
        { vehicleType: newType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Vehicle Filter Updated', `Viewing loads suitable for ${newType}`, 'info');
      fetchLoadsAndTrips(true);
    } catch (err) {
      console.error('Failed to update vehicle preference:', err);
      showToast('Error', 'Failed to update vehicle preference', 'error');
    }
  };

  if (loading) return <div className="app-content" style={{ color: '#fff' }}>Loading board...</div>;

  return (
    <>
      <div className="app-content">
        
        {/* My Active Trips Tab */}
        {activeTab === 'trips' && (
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>My Active Trips</h3>
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
                  onClick={() => fetchLoadsAndTrips(false)}
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
            
            {myTrips.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '35px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Briefcase size={36} color="#4b5563" style={{ marginBottom: '10px' }} />
                <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 6px 0' }}>No active trips right now</p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '0 0 16px 0' }}>When you win a bid on the Load Board, it appears here automatically in real time.</p>
                <button
                  className="app-btn"
                  onClick={() => setActiveTab('board')}
                  style={{ background: '#00e5ff', color: '#000', fontWeight: 'bold', padding: '10px 18px', width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Map size={16} /> View Load Board
                </button>
              </div>
            ) : (
              myTrips.map(trip => (
                <div key={trip._id} className="trip-card" style={{ borderLeft: '4px solid #10b981' }}>
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
                      <p style={{ wordBreak: 'break-word' }}>{trip.pickupAddress || 'Origin Warehouse'}</p>
                    </div>
                    <div className="trip-point">
                      <h4>Dropoff</h4>
                      <p style={{ wordBreak: 'break-word' }}>{trip.deliveryAddress || 'Delivery Address'}</p>
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

        {/* Public Load Board Tab */}
        {activeTab === 'board' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Public Load Board</h3>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(0, 229, 255, 0.15)',
                  color: '#00e5ff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  letterSpacing: '0.5px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e5ff', display: 'inline-block', boxShadow: '0 0 6px #00e5ff' }}></span>
                  LIVE
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fetchLoadsAndTrips(false)}
                  title="Refresh loads"
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
                <Map size={20} color="#00e5ff" />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px', background: '#0f172a', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}><Settings size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }}/> My Vehicle Type</span>
              </div>
              <select 
                value={vehicleType} 
                onChange={handleVehicleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1a2333', color: '#fff', border: '1px solid #334155' }}
              >
                <option value="Any">All Vehicles</option>
                <option value="Small Van">Small Van</option>
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Flatbed">Flatbed</option>
                <option value="Refrigerated">Refrigerated</option>
              </select>
            </div>
            
            {publicLoads.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>No public loads available right now.</p>
            ) : (
              publicLoads.map(load => (
                <div key={load._id} className="trip-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{load.trackingNumber}</div>
                    <div className="badge-pending trip-badge" style={{ margin: 0 }}>Available</div>
                  </div>
                  
                  <div className="trip-locations" style={{ marginBottom: '12px' }}>
                    <div className="trip-point">
                      <h4>Pickup</h4>
                      <p style={{ wordBreak: 'break-word' }}>{load.pickupAddress || 'Origin Pending'}</p>
                    </div>
                    <div className="trip-point">
                      <h4>Dropoff</h4>
                      <p style={{ wordBreak: 'break-word' }}>{load.deliveryAddress || 'Destination Pending'}</p>
                    </div>
                  </div>

                  {/* Load Details Row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>⚖️ {load.weight || 0} kg</span>
                    <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>📦 {load.shipmentType || 'Standard'}</span>
                    {load.companyId?.name && (
                      <span style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', padding: '3px 8px', borderRadius: '6px' }}>🏢 {load.companyId.name}</span>
                    )}
                  </div>

                  <button className="app-btn" onClick={() => openBidModal(load)} style={{ padding: '12px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #00e5ff, #0284c7)', color: '#000', border: 'none', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.25)' }}>
                    <DollarSign size={18} /> Place Bid
                  </button>
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
              <h2 style={{ color: '#f59e0b', fontSize: '2rem', margin: 0 }}>${myTrips.filter(t => t.status === 'Delivered').reduce((sum, t) => sum + (t.revenue || 0), 0).toLocaleString()}</h2>
            </div>

            <h4 style={{ color: '#fff', marginBottom: '15px' }}>Growth Analytics</h4>
            <div style={{ height: '200px', width: '100%', marginBottom: '30px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={myTrips.filter(t => t.status === 'Delivered').map((t, i) => ({ name: `Trip ${i+1}`, earned: t.revenue || 0 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            {myTrips.filter(t => t.status === 'Delivered').length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center' }}>No completed trips yet.</p>
            ) : (
              myTrips.filter(t => t.status === 'Delivered').map(trip => (
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
              <h4 style={{ color: '#fff', marginBottom: '15px' }}>KYC & Verification</h4>
              {driverProfile ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#9ca3af' }}>Status:</span>
                    {driverProfile.isVerified ? (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>Verified</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Pending Verification</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#9ca3af' }}>Name:</span>
                    <span style={{ color: '#fff' }}>{driverProfile.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#9ca3af' }}>Phone:</span>
                    <span style={{ color: '#fff' }}>{driverProfile.phone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#9ca3af' }}>License:</span>
                    <span style={{ color: '#fff' }}>{driverProfile.licenseNumber}</span>
                  </div>
                  {driverProfile.kycDocumentUrl && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: '#9ca3af' }}>KYC Document:</span>
                      <a href={driverProfile.kycDocumentUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>View Document</a>
                    </div>
                  )}

                  <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <span style={{ color: '#9ca3af', display: 'block', marginBottom: '5px' }}>Live Availability:</span>
                      <p style={{ color: '#fff', margin: 0, fontSize: '0.8rem' }}>Let shippers know you are ready for a load.</p>
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
        <button className={`driver-nav-item ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
          <Map size={20} />
          <span>Load Board</span>
        </button>
        <button className={`driver-nav-item ${activeTab === 'trips' ? 'active' : ''}`} onClick={() => setActiveTab('trips')} style={{ position: 'relative' }}>
          <Briefcase size={20} />
          <span>My Trips</span>
          {myTrips.length > 0 && (
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
              {myTrips.length}
            </span>
          )}
        </button>
        <button className={`driver-nav-item ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>
          <Wallet size={20} />
          <span>Earnings</span>
        </button>
        <button className={`driver-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
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

      {/* IN-APP BID MODAL */}
      {bidModal.isOpen && (
        <div className="driver-modal-overlay" onClick={closeBidModal}>
          <div className="driver-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle-bar"></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={22} color="#00e5ff" />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Place Your Bid</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>{bidModal.load?.trackingNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeBidModal}
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Real Route & Cargo Summary */}
            <div style={{ background: '#0a0f1d', borderRadius: '14px', padding: '12px 14px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pickup (Origin)</span>
                    <strong style={{ color: '#00e5ff', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={bidModal.load?.pickupAddress}>
                      {bidModal.load?.pickupAddress || 'Origin Pending'}
                    </strong>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '1rem', padding: '0 4px', flexShrink: 0 }}>➔</div>
                  <div style={{ flex: 1, minWidth: 0, paddingLeft: '8px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dropoff (Dest)</span>
                    <strong style={{ color: '#10b981', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={bidModal.load?.deliveryAddress}>
                      {bidModal.load?.deliveryAddress || 'Destination Pending'}
                    </strong>
                  </div>
                </div>

                {(bidModal.load?.weight || bidModal.load?.shipmentType || bidModal.load?.companyId?.name) && (
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', fontSize: '0.72rem', color: '#94a3b8' }}>
                    {bidModal.load?.weight && <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>⚖️ {bidModal.load.weight} kg</span>}
                    {bidModal.load?.shipmentType && <span style={{ background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>📦 {bidModal.load.shipmentType}</span>}
                    {bidModal.load?.companyId?.name && <span style={{ color: '#00e5ff', marginLeft: 'auto' }}>🏢 {bidModal.load.companyId.name}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Quick preset buttons */}
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Quick Presets:</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {[50, 100, 250, 500].map(val => (
                  <button
                    key={val}
                    type="button"
                    className="quick-bid-chip"
                    onClick={() => handleQuickAdd(val)}
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Bid Input */}
            <form onSubmit={handleBidSubmit}>
              <div style={{ position: 'relative', margin: '14px 0 8px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.4rem', fontWeight: 800, color: '#00e5ff' }}>$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={bidModal.amount}
                  onChange={(e) => setBidModal(prev => ({ ...prev, amount: e.target.value, error: '' }))}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 38px',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#fff',
                    background: '#0a0f1d',
                    border: bidModal.error ? '1px solid #ef4444' : '1px solid rgba(0, 229, 255, 0.4)',
                    borderRadius: '14px',
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.08)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>

              {bidModal.error && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0 0 10px 4px' }}>{bidModal.error}</p>
              )}

              <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '0 0 16px 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} color="#00e5ff" /> Dispatcher evaluates quote & rating immediately upon submit.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={closeBidModal}
                  disabled={bidModal.submitting}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bidModal.submitting}
                  style={{ flex: 2, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #00e5ff, #0284c7)', color: '#000', border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.35)' }}
                >
                  {bidModal.submitting ? (
                    <RefreshCw size={16} className="spin-icon" />
                  ) : (
                    <>
                      <Send size={16} /> Place Bid ${bidModal.amount ? Number(bidModal.amount).toLocaleString() : ''}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>Operations team will be alerted immediately</p>
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
                  placeholder="Describe location, delay reason, or current condition..."
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
                  {issueModal.submitting ? <RefreshCw size={16} className="spin-icon" /> : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExternalDashboard;
