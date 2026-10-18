import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, MapPin, Star, Power } from 'lucide-react';
import { ConfirmModal, Toast } from '../components/ConfirmModal';
import './Pages.css';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    username: '',
    password: '',
    status: 'Active'
  });

  const [formError, setFormError] = useState('');

  // Luxury Modal & Toast States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete Driver',
    confirmVariant: 'danger',
    onConfirm: null,
    loading: false
  });
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
  };

  // Fetch Drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/drivers');
      if (res.data.success) {
        setDrivers(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch drivers list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', phone: '', licenseNumber: '', username: '', password: '', status: 'Active', currentStatus: 'Available' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    setModalMode('edit');
    setCurrentDriverId(driver._id);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
      currentStatus: driver.currentStatus || 'Available'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (modalMode === 'add') {
        const res = await axios.post('/drivers', formData);
        if (res.data.success) {
          fetchDrivers();
          setIsModalOpen(false);
        }
      } else {
        const res = await axios.put(`/drivers/${currentDriverId}`, formData);
        if (res.data.success) {
          fetchDrivers();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong saving driver details.');
    }
  };

  const handleDeleteDriver = (driver) => {
    const driverId = typeof driver === 'object' ? driver._id : driver;
    const driverName = typeof driver === 'object' ? driver.name : 'this driver';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Driver',
      message: `Are you sure you want to permanently delete driver "${driverName}"? They will lose access to assigned trips.`,
      confirmText: 'Delete Driver',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await axios.delete(`/drivers/${driverId}`);
          if (res.data.success) {
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            showToast('Driver Deleted', `${driverName} has been removed successfully.`, 'success');
            fetchDrivers();
          }
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          showToast('Delete Failed', err.response?.data?.message || 'Failed to delete driver.', 'error');
        }
      }
    });
  };

  const handleToggleCurrentStatus = async (driver) => {
    const nextStatus = driver.currentStatus === 'Available' ? 'On Duty' : driver.currentStatus === 'On Duty' ? 'Off Duty' : 'Available';
    try {
      const res = await axios.put(`/drivers/${driver._id}`, { currentStatus: nextStatus });
      if (res.data.success) {
        showToast('Driver Status Updated', `${driver.name} is now ${nextStatus}.`, 'success');
        fetchDrivers();
      }
    } catch (err) {
      showToast('Status Update Failed', err.response?.data?.message || 'Failed to update live status.', 'error');
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone.includes(searchQuery) ||
    driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && drivers.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Drivers...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Driver Fleet</h1>
          <p className="page-subtitle">Manage cargo transport drivers and licenses.</p>
        </div>
      </div>

      <div className="controls-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name, phone or license number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Driver</span>
        </button>
      </div>

      {error && (
        <div className="error-container">
          <AlertCircle size={32} className="error-icon" />
          <p>{error}</p>
        </div>
      )}

      {filteredDrivers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No drivers registered. Add a driver to dispatch transport jobs!
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Driver Name & Rating</th>
                <th>Contact & License</th>
                <th>Location</th>
                <th>Account Status</th>
                <th>Live Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map(driver => (
                <tr key={driver._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{driver.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.85rem', marginTop: '4px' }}>
                      <Star size={12} fill="currentColor" />
                      <span>{driver.rating || '5.0'} / 5.0</span>
                    </div>
                  </td>
                  <td>
                    <div>{driver.phone}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{driver.licenseNumber}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00e5ff' }}>
                      <MapPin size={14} />
                      <span>{driver.location || 'HQ'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${driver.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleCurrentStatus(driver)}
                      className={`badge ${driver.currentStatus === 'Available' ? 'badge-success' : driver.currentStatus === 'On Duty' ? 'badge-primary' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none' }}
                      title="Click to toggle live status"
                    >
                      <Power size={12} />
                      {driver.currentStatus || 'Available'}
                    </button>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openEditModal(driver)} className="action-btn edit" title="Edit Driver">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteDriver(driver)} className="action-btn delete" title="Delete Driver">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Driver' : 'Edit Driver Details'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {formError && <div className="error-alert">{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="modal-form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Robert Smith"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="e.g. +1 (555) 321-7654"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    required
                    placeholder="e.g. DL-982348A"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">App Username</label>
                  <input
                    type="text"
                    name="username"
                    required={modalMode === 'add'}
                    placeholder="e.g. Raju_DL01"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={modalMode === 'edit'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">App Password</label>
                  <input
                    type="text"
                    name="password"
                    required={modalMode === 'add'}
                    placeholder={modalMode === 'edit' ? '(Leave blank to keep unchanged)' : 'e.g. Raju@123'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Account Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Driver' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
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

export default Drivers;
