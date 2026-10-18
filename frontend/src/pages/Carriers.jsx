import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, UserCheck, CheckCircle, ShieldAlert, Power, Trash2 } from 'lucide-react';
import { ConfirmModal, Toast } from '../components/ConfirmModal';
import './Pages.css';

const Carriers = () => {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Luxury Modal & Toast States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'danger',
    onConfirm: null,
    loading: false
  });
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
  };

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

  const handleVerifyDriver = (carrier) => {
    const carrierId = typeof carrier === 'object' ? carrier._id : carrier;
    const carrierName = typeof carrier === 'object' ? carrier.name : 'this carrier';

    setConfirmModal({
      isOpen: true,
      title: 'Verify External Carrier KYC',
      message: `Verify KYC documents for "${carrierName}"? They will be authorized to view the public load board and bid on shipments.`,
      confirmText: 'Verify Carrier',
      confirmVariant: 'success',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await axios.put(`/drivers/${carrierId}/verify`);
          if (res.data.success) {
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            showToast('Carrier Verified', `${carrierName} has been verified successfully.`, 'success');
            fetchCarriers();
          }
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          showToast('Verification Failed', err.response?.data?.message || 'Failed to verify driver.', 'error');
        }
      }
    });
  };

  const handleToggleStatus = (carrier) => {
    const carrierId = typeof carrier === 'object' ? carrier._id : carrier;
    const carrierName = typeof carrier === 'object' ? carrier.name : 'this carrier';
    const currentStatus = typeof carrier === 'object' ? carrier.status : 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    setConfirmModal({
      isOpen: true,
      title: `${newStatus === 'Active' ? 'Activate' : 'Suspend'} Carrier`,
      message: `Are you sure you want to change status of "${carrierName}" to ${newStatus}?`,
      confirmText: newStatus === 'Active' ? 'Activate Carrier' : 'Suspend Carrier',
      confirmVariant: newStatus === 'Active' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await axios.put(`/drivers/${carrierId}`, { status: newStatus });
          if (res.data.success) {
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            showToast('Status Updated', `${carrierName} is now ${newStatus}.`, 'success');
            fetchCarriers();
          }
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          showToast('Update Failed', err.response?.data?.message || 'Failed to update carrier status.', 'error');
        }
      }
    });
  };

  const handleDeleteDriver = (carrier) => {
    const carrierId = typeof carrier === 'object' ? carrier._id : carrier;
    const carrierName = typeof carrier === 'object' ? carrier.name : 'this carrier';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Carrier',
      message: `Are you sure you want to permanently delete carrier "${carrierName}"? They will be removed from your network directory.`,
      confirmText: 'Delete Carrier',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await axios.delete(`/drivers/${carrierId}`);
          if (res.data.success) {
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            showToast('Carrier Deleted', `${carrierName} has been deleted.`, 'success');
            fetchCarriers();
          }
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          showToast('Delete Failed', err.response?.data?.message || 'Failed to delete carrier.', 'error');
        }
      }
    });
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
                        onClick={() => handleVerifyDriver(carrier)} 
                        style={{ padding: '6px 12px', background: '#00e5ff', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Verify KYC
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => handleToggleStatus(carrier)}
                          className="btn-icon" 
                          title={carrier.status === 'Active' ? "Suspend Carrier" : "Activate Carrier"}
                          style={{ color: carrier.status === 'Active' ? '#f59e0b' : '#10b981', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDriver(carrier)}
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

      {/* Luxury Confirm Modal & Toast */}
      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
      <Toast
        {...toast}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default Carriers;
