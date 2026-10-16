import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, Wrench, ShieldAlert, Activity } from 'lucide-react';
import './Pages.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentVehicleId, setCurrentVehicleId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: '',
    capacity: '',
    status: 'Active',
    mileage: ''
  });

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({ description: '', cost: '' });

  const [formError, setFormError] = useState('');

  // Fetch Vehicles and Drivers
  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, driversRes] = await Promise.all([
        axios.get('/vehicles'),
        axios.get('/drivers')
      ]);
      
      if (vehiclesRes.data.success) {
        setVehicles(vehiclesRes.data.data);
      }
      if (driversRes.data.success) {
        setDrivers(driversRes.data.data.filter(d => d.status === 'Active')); // Only assign active drivers
      }
    } catch (err) {
      setError('Failed to fetch vehicles or drivers data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ vehicleNumber: '', type: '', capacity: '', status: 'Active', mileage: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setModalMode('edit');
    setCurrentVehicleId(vehicle._id);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      type: vehicle.type,
      capacity: vehicle.capacity,
      status: vehicle.status || 'Active',
      mileage: vehicle.mileage || 0
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (modalMode === 'add') {
        const res = await axios.post('/vehicles', formData);
        if (res.data.success) {
          fetchData();
          setIsModalOpen(false);
        }
      } else {
        const res = await axios.put(`/vehicles/${currentVehicleId}`, formData);
        if (res.data.success) {
          fetchData();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong saving vehicle details.');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const res = await axios.delete(`/vehicles/${id}`);
        if (res.data.success) {
          fetchData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete vehicle.');
      }
    }
  };

  const openMaintenanceModal = (vehicle) => {
    setActiveVehicle(vehicle);
    setMaintenanceForm({ description: '', cost: '' });
    setIsMaintenanceModalOpen(true);
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/vehicles/${activeVehicle._id}/maintenance`, maintenanceForm);
      if (res.data.success) {
        fetchData();
        // Update activeVehicle locally to show the new log instantly
        setActiveVehicle(res.data.data);
        setMaintenanceForm({ description: '', cost: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add maintenance log.');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vehicle.driverId && vehicle.driverId.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && vehicles.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Fleet Vehicles...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Fleet Vehicles</h1>
          <p className="page-subtitle">Track and configure delivery trucks, vans, and drivers.</p>
        </div>
      </div>

      <div className="controls-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by vehicle number, type, or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Vehicle</span>
        </button>
      </div>

      {error && (
        <div className="error-container">
          <AlertCircle size={32} className="error-icon" />
          <p>{error}</p>
        </div>
      )}

      {filteredVehicles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No vehicles in fleet. Add transport vehicles to schedule shipments!
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle Info</th>
                <th>Capacity</th>
                <th>Status & Mileage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map(vehicle => (
                <tr key={vehicle._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--info)', fontSize: '1.1rem' }}>{vehicle.vehicleNumber}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{vehicle.type}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{vehicle.capacity} kg</div>
                  </td>
                  <td>
                    <div style={{ marginBottom: '4px' }}>
                      <span className={`badge ${vehicle.status === 'Active' ? 'badge-success' : vehicle.status === 'Maintenance' ? 'badge-primary' : 'badge-danger'}`}>
                        {vehicle.status === 'Maintenance' && <Wrench size={10} style={{marginRight: '4px'}} />}
                        {vehicle.status === 'Out of Service' && <ShieldAlert size={10} style={{marginRight: '4px'}} />}
                        {vehicle.status || 'Active'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Activity size={12} />
                      {vehicle.mileage ? vehicle.mileage.toLocaleString() : 0} mi
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openMaintenanceModal(vehicle)} className="action-btn" title="Maintenance Logs" style={{ color: '#00e5ff' }}>
                        <Wrench size={16} />
                      </button>
                      <button onClick={() => openEditModal(vehicle)} className="action-btn edit" title="Edit Vehicle">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteVehicle(vehicle._id)} className="action-btn delete" title="Delete Vehicle">
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

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Vehicle' : 'Edit Vehicle Fleet Info'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {formError && <div className="error-alert">{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="modal-form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Registration Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    required
                    placeholder="e.g. MH-12-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Type</label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="" disabled>-- Select Vehicle Type --</option>
                    <option value="Cargo Van">🚐 Cargo Van</option>
                    <option value="Box Truck">🚛 Box Truck</option>
                    <option value="Container Truck">🚚 Container Truck</option>
                    <option value="Flatbed">🛻 Flatbed</option>
                    <option value="Pickup Truck">🚙 Pickup Truck</option>
                    <option value="Refrigerated Truck">❄️ Refrigerated Truck</option>
                    <option value="Semi-Trailer">🚜 Semi-Trailer</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Capacity (in kg)</label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    placeholder="e.g. 5000"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Mileage</label>
                  <input
                    type="number"
                    name="mileage"
                    placeholder="e.g. 45000"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Vehicle Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">In Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Add Vehicle' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Logs Modal */}
      {isMaintenanceModalOpen && activeVehicle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Maintenance: {activeVehicle.vehicleNumber}</h3>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Service History</h4>
              {(!activeVehicle.maintenanceLogs || activeVehicle.maintenanceLogs.length === 0) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No maintenance records found.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeVehicle.maintenanceLogs.map((log, idx) => (
                    <li key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #00e5ff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{log.description}</span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>${log.cost}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.date).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={handleMaintenanceSubmit} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <h4 style={{ color: '#00e5ff', marginBottom: '10px' }}>Add New Record</h4>
              <div className="modal-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label className="form-label">Service Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brake Replacement"
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Cost ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={maintenanceForm.cost}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, cost: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: '15px' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={16} /> Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
