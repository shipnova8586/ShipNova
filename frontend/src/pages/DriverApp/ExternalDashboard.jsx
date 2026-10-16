import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Map, DollarSign, Briefcase, Navigation, CheckCircle, Clock, Wallet, MessageSquare, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExternalDashboard = () => {
  const [publicLoads, setPublicLoads] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      alert('Failed to update live status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchLoadsAndTrips = async () => {
    try {
      const token = localStorage.getItem('driverToken');
      // Fetch public loads via the driver-auth route
      const loadsRes = await axios.get('/driver-auth/public-loads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (loadsRes.data.success) {
        setPublicLoads(loadsRes.data.data);
      }

      // Fetch assigned trips
      const tripsRes = await axios.get('/driver-auth/my-trips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tripsRes.data.success) {
        setMyTrips(tripsRes.data.data);
      }

      // Fetch driver profile
      const profileRes = await axios.get('/driver-auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.data.success) {
        setDriverProfile(profileRes.data.data);
        if (profileRes.data.data.vehicleType) {
          setVehicleType(profileRes.data.data.vehicleType);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoadsAndTrips();
  }, []);

  const placeBid = async (shipmentId) => {
    if (driverProfile && !driverProfile.isVerified) {
      alert("Your profile is pending verification. Admin must verify your KYC before you can place bids.");
      return;
    }

    const amount = prompt("Enter your bid amount ($):");
    if (!amount || isNaN(amount)) return;

    try {
      const token = localStorage.getItem('driverToken');
      
      const res = await axios.post(`/driver-auth/shipments/${shipmentId}/bids`, 
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        alert('Bid placed successfully! (Wait for admin to accept)');
        fetchLoadsAndTrips();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place bid');
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
        fetchLoadsAndTrips();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'trips' or 'earnings'
  const [vehicleType, setVehicleType] = useState('Any');

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
        fetchLoadsAndTrips();
      }
    } catch (err) {
      alert('Failed to report issue');
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
      fetchLoadsAndTrips(); // Refresh loads to match new vehicle
    } catch (err) {
      console.error('Failed to update vehicle preference:', err);
      alert('Failed to update vehicle preference');
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
              <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>My Active Trips</h3>
              <Briefcase size={20} color="#10b981" />
            </div>
            
            {myTrips.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>No active trips right now.</p>
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

        {/* Public Load Board Tab */}
        {activeTab === 'board' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Public Load Board</h3>
              <Map size={20} color="#00e5ff" />
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
                  
                  <div className="trip-locations" style={{ marginBottom: '15px' }}>
                    <div className="trip-point">
                      <h4>Pickup</h4>
                      <p>HQ Warehouse</p>
                    </div>
                    <div className="trip-point">
                      <h4>Dropoff</h4>
                      <p>Delivery Location</p>
                    </div>
                  </div>

                  <button className="app-btn" onClick={() => placeBid(load._id)} style={{ padding: '10px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={16} /> Place Bid
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
        <button className={`driver-nav-item ${activeTab === 'trips' ? 'active' : ''}`} onClick={() => setActiveTab('trips')}>
          <Briefcase size={20} />
          <span>My Trips</span>
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
    </>
  );
};

export default ExternalDashboard;
