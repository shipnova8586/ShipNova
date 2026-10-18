import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Eye, Globe } from 'lucide-react';
import { ConfirmModal, Toast } from '../components/ConfirmModal';
import './Pages.css';

const Shipments = () => {
  const { user } = useContext(AuthContext);
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [currentShipment, setCurrentShipment] = useState(null);
  
  const [formData, setFormData] = useState({
    customerId: '',
    senderName: '',
    receiverName: '',
    pickupAddress: '',
    deliveryAddress: '',
    weight: '',
    shipmentType: 'Standard',
    driverId: '',
    vehicleId: '',
    requiredVehicle: 'Any',
    status: 'Pending',
    isPublic: false
  });

  const [formError, setFormError] = useState('');

  // Luxury Modal & Toast States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete Shipment',
    confirmVariant: 'danger',
    onConfirm: null,
    loading: false
  });
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
  };

  const canManageShipments = ['company_admin', 'manager', 'dispatcher'].includes(user.role);
  const hasNetworkAccess = user.companyId?.subscriptionPlan === 'network';

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      const shipmentsRes = await axios.get('/shipments');
      if (shipmentsRes.data.success) {
        setShipments(shipmentsRes.data.data);
      }

      if (canManageShipments) {
        const [custRes, drivRes, vehRes] = await Promise.all([
          axios.get('/customers'),
          axios.get('/drivers'),
          axios.get('/vehicles')
        ]);

        if (custRes.data.success) setCustomers(custRes.data.data);
        if (drivRes.data.success) setDrivers(drivRes.data.data.filter(d => d.status === 'Active'));
        if (vehRes.data.success) setVehicles(vehRes.data.data);
      }
    } catch (err) {
      setError('Failed to load shipments records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (e) => {
    const selectedCust = customers.find(c => c._id === e.target.value);
    setFormData({
      ...formData,
      customerId: e.target.value,
      // Default delivery address to customer's address
      deliveryAddress: selectedCust ? selectedCust.address : ''
    });
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentShipment(null);
    setFormData({
      customerId: '',
      senderName: '',
      receiverName: '',
      pickupAddress: '',
      deliveryAddress: '',
      weight: '',
      shipmentType: 'Standard',
      driverId: '',
      vehicleId: '',
      requiredVehicle: 'Any',
      status: 'Pending',
      isPublic: false
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (shipment) => {
    setModalMode('edit');
    setCurrentShipment(shipment);
    setFormData({
      customerId: shipment.customerId?._id || '',
      senderName: shipment.senderName,
      receiverName: shipment.receiverName,
      pickupAddress: shipment.pickupAddress,
      deliveryAddress: shipment.deliveryAddress,
      weight: shipment.weight,
      shipmentType: shipment.shipmentType,
      driverId: shipment.driverId?._id || '',
      vehicleId: shipment.vehicleId?._id || '',
      status: shipment.status,
      isPublic: shipment.isPublic || false
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openViewModal = (shipment) => {
    setModalMode('view');
    setCurrentShipment(shipment);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Prepare payload (convert empty strings to nulls for object IDs)
    const payload = { ...formData };
    
    // If public bid is selected, ensure we don't assign internal driver/vehicle
    if (payload.isPublic) {
      payload.driverId = null;
      payload.vehicleId = null;
    } else {
      if (!payload.driverId) payload.driverId = null;
      if (!payload.vehicleId) payload.vehicleId = null;
    }

    try {
      if (modalMode === 'add') {
        const res = await axios.post('/shipments', payload);
        if (res.data.success) {
          fetchData();
          setIsModalOpen(false);
        }
      } else {
        const res = await axios.put(`/shipments/${currentShipment._id}`, payload);
        if (res.data.success) {
          fetchData();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred saving shipment details.');
    }
  };

  const handleQuickStatusUpdate = async (shipment, newStatus) => {
    try {
      const res = await axios.put(`/shipments/${shipment._id}`, { status: newStatus });
      if (res.data.success) {
        showToast('Status Updated', `Shipment #${shipment.trackingNumber} status changed to ${newStatus}.`, 'success');
        fetchData();
        if (isModalOpen && currentShipment?._id === shipment._id) {
          setCurrentShipment({ ...currentShipment, status: newStatus });
        }
      }
    } catch (err) {
      showToast('Update Failed', err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDeleteShipment = (shipment) => {
    const shipmentId = typeof shipment === 'object' ? shipment._id : shipment;
    const trackNum = typeof shipment === 'object' ? shipment.trackingNumber : '';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Shipment Record',
      message: `Are you sure you want to permanently delete shipment #${trackNum}? All history, dispatch info, and customer links will be removed.`,
      confirmText: 'Delete Shipment',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await axios.delete(`/shipments/${shipmentId}`);
          if (res.data.success) {
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            showToast('Shipment Deleted', `Shipment #${trackNum} has been permanently deleted.`, 'success');
            fetchData();
          }
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          showToast('Delete Failed', err.response?.data?.message || 'Failed to delete shipment.', 'error');
        }
      }
    });
  };

  const handleDownloadInvoice = async (shipment) => {
    if (shipment.status !== 'Delivered') return;
    try {
      showToast('Generating Invoice', `Preparing PDF invoice for #${shipment.trackingNumber}...`, 'info');
      const res = await axios.get(`/shipments/${shipment._id}/invoice`, {
        responseType: 'blob' // Important for PDF
      });
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `INV-${shipment.trackingNumber.slice(-6).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast('Invoice Downloaded', `Invoice for #${shipment.trackingNumber} saved.`, 'success');
    } catch (err) {
      showToast('Download Failed', 'Failed to generate and download invoice.', 'error');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Assigned': return 'badge-info';
      case 'Picked Up': return 'badge-info';
      case 'In Transit': return 'badge-info';
      case 'Out For Delivery': return 'badge-warning';
      case 'Delivered': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return '';
    }
  };

  // Scoped search filter
  const filteredShipments = shipments.filter(shipment => {
    const term = searchQuery.toLowerCase();
    return (
      shipment.trackingNumber.toLowerCase().includes(term) ||
      shipment.senderName.toLowerCase().includes(term) ||
      shipment.receiverName.toLowerCase().includes(term) ||
      shipment.status.toLowerCase().includes(term) ||
      (shipment.customerId && shipment.customerId.name.toLowerCase().includes(term))
    );
  });

  if (loading && shipments.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Shipments Ledger...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Shipments Manager</h1>
          <p className="page-subtitle">Track, register, and assign dispatch shipments.</p>
        </div>
      </div>

      <div className="controls-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by tracking #, sender, receiver, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {canManageShipments && (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Create Shipment</span>
          </button>
        )}
      </div>

      {error && (
        <div className="error-container">
          <AlertCircle size={32} className="error-icon" />
          <p>{error}</p>
        </div>
      )}

      {filteredShipments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No shipments recorded. Register a new cargo delivery job to begin!
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Customer Profile</th>
                <th>Weight (Kg)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map(shipment => (
                <tr key={shipment._id}>
                  <td style={{ fontWeight: 800 }}>
                    {shipment.status === 'Delivered' ? (
                      <span 
                        onClick={() => handleDownloadInvoice(shipment)}
                        style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }}
                        title="Click to Download PDF Invoice"
                      >
                        {shipment.trackingNumber}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--primary)' }}>
                        {shipment.trackingNumber}
                      </span>
                    )}
                    {shipment.issueReported && (
                      <span 
                        onClick={() => openViewModal(shipment)}
                        title={`Issue Reported: ${shipment.issueReported} (Click to view details)`} 
                        style={{ color: '#ef4444', marginLeft: '8px', cursor: 'pointer' }}
                      >
                        ⚠️
                      </span>
                    )}
                  </td>
                  <td>{shipment.senderName}</td>
                  <td>{shipment.receiverName}</td>
                  <td>{shipment.customerId?.name || 'Walk-in Client'}</td>
                  <td>{shipment.weight} kg</td>
                  <td>
                    <span className={`badge ${getStatusBadge(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openViewModal(shipment)} className="action-btn edit" title="View Details" style={{ color: 'var(--info)' }}>
                        <Eye size={16} />
                      </button>
                      {canManageShipments && (
                        <>
                          <button onClick={() => openEditModal(shipment)} className="action-btn edit" title="Edit Shipment">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteShipment(shipment)} className="action-btn delete" title="Delete Shipment">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {!canManageShipments && user.role === 'driver' && shipment.status !== 'Delivered' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => {
                              const transitions = {
                                'Assigned': 'Picked Up',
                                'Picked Up': 'In Transit',
                                'In Transit': 'Out For Delivery',
                                'Out For Delivery': 'Delivered'
                              };
                              const next = transitions[shipment.status];
                              if (next) handleQuickStatusUpdate(shipment, next);
                            }}
                            className="btn btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                          >
                            Update Status
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit / View Shipment Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>
                {modalMode === 'add' && 'Create Cargo Shipment'}
                {modalMode === 'edit' && `Edit Shipment: ${currentShipment?.trackingNumber}`}
                {modalMode === 'view' && `Shipment Detail: ${currentShipment?.trackingNumber}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {formError && <div className="error-alert">{formError}</div>}

            {modalMode === 'view' ? (
              <div className="shipment-view-details">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div className="detail-group">
                    <span className="form-label">Sender Name</span>
                    <p style={{ fontWeight: 600 }}>{currentShipment.senderName}</p>
                  </div>
                  <div className="detail-group">
                    <span className="form-label">Receiver Name</span>
                    <p style={{ fontWeight: 600 }}>{currentShipment.receiverName}</p>
                  </div>
                  <div className="detail-group" style={{ gridColumn: 'span 2' }}>
                    <span className="form-label">Pickup Location Address</span>
                    <p>{currentShipment.pickupAddress}</p>
                  </div>
                  <div className="detail-group" style={{ gridColumn: 'span 2' }}>
                    <span className="form-label">Destination Address</span>
                    <p>{currentShipment.deliveryAddress}</p>
                  </div>
                  <div className="detail-group">
                    <span className="form-label">Weight</span>
                    <p>{currentShipment.weight} kg</p>
                  </div>
                  <div className="detail-group">
                    <span className="form-label">Service Class</span>
                    <p>{currentShipment.shipmentType}</p>
                  </div>
                  <div className="detail-group">
                    <span className="form-label">Assigned Courier</span>
                    <p>{currentShipment.driverId?.name || <span style={{ color: 'var(--text-muted)' }}>Not Dispatched</span>}</p>
                  </div>
                  <div className="detail-group">
                    <span className="form-label">Fleet Vehicle</span>
                    <p>{currentShipment.vehicleId?.vehicleNumber || <span style={{ color: 'var(--text-muted)' }}>Not Dispatched</span>}</p>
                  </div>
                </div>

                {currentShipment.issueReported && (
                  <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                    <h4 style={{ color: '#b91c1c', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⚠️ Driver Reported Issue
                    </h4>
                    <p style={{ color: '#7f1d1d', margin: 0 }}>{currentShipment.issueReported}</p>
                  </div>
                )}

                <div className="detail-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <span className="form-label">Shipment Delivery Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    <span className={`badge ${getStatusBadge(currentShipment.status)}`} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                      {currentShipment.status}
                    </span>
                    
                    {/* Status updater dropdown for drivers or managers inside the view modal */}
                    {(canManageShipments || (user.role === 'driver' && currentShipment.driverId?._id === user.id)) && (
                      <select
                        value={currentShipment.status}
                        onChange={(e) => handleQuickStatusUpdate(currentShipment, e.target.value)}
                        className="form-input"
                        style={{ margin: 0, padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out For Delivery">Out For Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label className="form-label">Sender Name</label>
                    <input
                      type="text"
                      name="senderName"
                      required
                      placeholder="Sender name"
                      value={formData.senderName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Billing Customer Profile</label>
                    <select
                      name="customerId"
                      required
                      value={formData.customerId}
                      onChange={handleCustomerChange}
                      className="form-input"
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Pickup Location Address</label>
                    <input
                      type="text"
                      name="pickupAddress"
                      required
                      placeholder="Full street address"
                      value={formData.pickupAddress}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Receiver Name</label>
                    <input
                      type="text"
                      name="receiverName"
                      required
                      placeholder="Receiver name"
                      value={formData.receiverName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Service Type</label>
                    <select
                      name="shipmentType"
                      value={formData.shipmentType}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="Standard">Standard Delivery</option>
                      <option value="Express">Express Delivery</option>
                      <option value="Overnight">Overnight Delivery</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Delivery Destination Address</label>
                    <input
                      type="text"
                      name="deliveryAddress"
                      required
                      placeholder="Receiver full street address"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Weight (in kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      required
                      placeholder="e.g. 15.5"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shipment Current Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={modalMode === 'add' || formData.isPublic}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Picked Up">Picked Up</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Required Vehicle Type (For Load Board)
                    </label>
                    <select
                      name="requiredVehicle"
                      value={formData.requiredVehicle}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="Any">Any Vehicle</option>
                      <option value="Small Van">Small Van</option>
                      <option value="Heavy Truck">Heavy Truck</option>
                      <option value="Flatbed">Flatbed</option>
                      <option value="Refrigerated">Refrigerated</option>
                    </select>
                  </div>

                  {currentShipment?.carrierName ? (
                    <div className="form-group full-width" style={{ padding: '15px', backgroundColor: 'rgba(0, 229, 255, 0.05)', borderRadius: '8px', borderLeft: '4px solid #00e5ff' }}>
                      <h4 style={{ color: '#00e5ff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={16} /> Externally Fulfilled
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Carrier Assigned:</span>
                          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{currentShipment.carrierName}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Agreed Rate:</span>
                          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#f59e0b' }}>${currentShipment.revenue}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="form-group full-width">
                      <label className="form-label" style={{ color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Post to Public Load Board (For External Carriers)?
                        {!hasNetworkAccess && (
                          <span className="premium-badge" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>PRO</span>
                        )}
                      </label>
                      <select
                        name="isPublic"
                        value={formData.isPublic}
                        onChange={(e) => {
                          const isPub = e.target.value === 'true';
                          setFormData({
                            ...formData, 
                            isPublic: isPub,
                            status: isPub ? 'Pending' : formData.status
                          });
                        }}
                        className="form-input"
                        style={{ border: '1px solid #00e5ff', opacity: !hasNetworkAccess ? 0.6 : 1 }}
                        disabled={!hasNetworkAccess}
                        title={!hasNetworkAccess ? "Upgrade to ShipNova Network plan to access this feature" : ""}
                      >
                        <option value="false">No - Keep Internal</option>
                        {hasNetworkAccess && <option value="true">Yes - Allow Public Bids</option>}
                      </select>
                      {!hasNetworkAccess && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                          * This feature requires the ShipNova Network (PRO) tier.
                        </div>
                      )}
                    </div>
                  )}

                  {(!formData.isPublic && !currentShipment?.carrierName) && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Dispatch Courier (Driver)</label>
                        <select
                          name="driverId"
                          value={formData.driverId}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="">-- Unassigned --</option>
                          {drivers.map(d => (
                            <option key={d._id} value={d._id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Fleet Vehicle Allocated</label>
                        <select
                          name="vehicleId"
                          value={formData.vehicleId}
                          onChange={handleInputChange}
                          className="form-input"
                        >
                          <option value="">-- Unallocated --</option>
                          {vehicles.map(v => (
                            <option key={v._id} value={v._id}>
                              {v.vehicleNumber} ({v.type})
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalMode === 'add' ? 'Register Shipment' : 'Save Details'}
                  </button>
                </div>
              </form>
            )}
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

export default Shipments;
