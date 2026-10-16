import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, UserCheck, CheckCircle, ShieldAlert, Power, Trash2 } from 'lucide-react';
import './Pages.css';

const Carriers = () => {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCarriers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/network/carriers');
      if (res.data.success) {
        setCarriers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  const handleVerifyDriver = async (id) => {
    if (window.confirm('Verify this external carrier? They will be allowed to bid on loads.')) {
      try {
        const res = await axios.put(`/drivers/${id}/verify`);
        if (res.data.success) {
          fetchCarriers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to verify driver.');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    if (window.confirm(`Are you sure you want to mark this carrier as ${newStatus}?`)) {
      try {
        const res = await axios.put(`/drivers/${id}`, { status: newStatus });
        if (res.data.success) {
          fetchCarriers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update carrier status.');
      }
    }
  };

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this carrier?')) {
      try {
        const res = await axios.delete(`/drivers/${id}`);
        if (res.data.success) {
          fetchCarriers();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete carrier.');
      }
    }
  };

  const filteredCarriers = carriers.filter(carrier =>
    carrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    carrier.phone.includes(searchQuery) ||
    carrier.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && carriers.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Marketplace Carriers...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%)', zIndex: 0
      }} />

      <div className="page-header-section" style={{ borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: '24px', zIndex: 1, position: 'relative' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserCheck color="#00e5ff" size={32} />
            Find Carriers
            <span className="premium-badge" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>PRO</span>
          </h1>
          <p className="page-subtitle" style={{ color: '#a0aec0' }}>
            Browse and verify independent drivers in the ShipNova Marketplace.
          </p>
        </div>
      </div>

      <div className="controls-row" style={{ zIndex: 1, position: 'relative', marginTop: '24px' }}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search carriers by name, phone, or license..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredCarriers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', zIndex: 1, position: 'relative' }}>
          No carriers found in the network.
        </div>
      ) : (
        <div className="table-container" style={{ zIndex: 1, position: 'relative' }}>
          <table>
            <thead>
              <tr>
                <th>Carrier Name</th>
                <th>Contact Info</th>
                <th>License</th>
                <th>KYC Document</th>
                <th>Account Status</th>
                <th>Live Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarriers.map(carrier => (
                <tr key={carrier._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{carrier.name}</div>
                    <div style={{ color: '#00e5ff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <MapPin size={12} /> {carrier.location || 'Nationwide'}
                    </div>
                  </td>
                  <td>{carrier.phone}</td>
                  <td>{carrier.licenseNumber}</td>
                  <td>
                    {carrier.kycDocumentUrl ? (
                      <a href={carrier.kycDocumentUrl} target="_blank" rel="noreferrer" style={{ color: '#00e5ff', textDecoration: 'underline' }}>
                        View Document
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>No Document</span>
                    )}
                  </td>
                  <td>
                    {carrier.isVerified ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                        <CheckCircle size={16} /> Verified
                      </span>
                    ) : (
                      <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                        <ShieldAlert size={16} /> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      background: carrier.currentStatus === 'Available' ? 'rgba(16, 185, 129, 0.1)' : 
                                  carrier.currentStatus === 'On Duty' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: carrier.currentStatus === 'Available' ? '#10b981' : 
                             carrier.currentStatus === 'On Duty' ? '#3b82f6' : '#ef4444',
                      border: `1px solid ${carrier.currentStatus === 'Available' ? 'rgba(16, 185, 129, 0.3)' : carrier.currentStatus === 'On Duty' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                      {carrier.currentStatus || 'Available'}
                    </span>
                  </td>
                  <td>
                    {!carrier.isVerified ? (
                      <button 
                        onClick={() => handleVerifyDriver(carrier._id)} 
                        style={{ padding: '6px 12px', background: '#00e5ff', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Verify KYC
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleToggleStatus(carrier._id, carrier.status)}
                          className="btn-icon" 
                          title={carrier.status === 'Active' ? "Suspend Carrier" : "Activate Carrier"}
                          style={{ color: carrier.status === 'Active' ? '#f59e0b' : '#10b981', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDriver(carrier._id)}
                          className="btn-icon" 
                          title="Delete Carrier"
                          style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Carriers;
