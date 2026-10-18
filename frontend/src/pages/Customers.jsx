import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { ConfirmModal, Toast } from '../components/ConfirmModal';
import './Pages.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Luxury Modal & Toast States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    confirmVariant: 'danger',
    onConfirm: null,
    loading: false
  });
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });

  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
  };

  // Fetch Customers on load
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch customers list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', phone: '', email: '', address: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setModalMode('edit');
    setCurrentCustomerId(customer._id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission
    setFormError('');
    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        const res = await axios.post('/customers', formData);
        if (res.data.success) {
          showToast('Customer Created', `Customer "${formData.name}" added successfully!`, 'success');
          fetchCustomers();
          setIsModalOpen(false);
        }
      } else {
        const res = await axios.put(`/customers/${currentCustomerId}`, formData);
        if (res.data.success) {
          showToast('Customer Updated', `Customer "${formData.name}" updated successfully!`, 'success');
          fetchCustomers();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong saving customer details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = (customer) => {
    const customerId = typeof customer === 'object' ? customer._id : customer;
    const customerName = typeof customer === 'object' ? customer.name : 'this customer';

    setConfirmModal({
      isOpen: true,
      title: 'Delete Customer',
      message: `Are you sure you want to permanently delete "${customerName}"? This record and associated information will be permanently removed.`,
      confirmText: 'Delete Customer',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal(prev => ({ ...prev, loading: true }));
          const res = await axios.delete(`/customers/${customerId}`);
          if (res.data.success) {
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
            showToast('Customer Deleted', 'Customer has been deleted successfully.', 'success');
            fetchCustomers();
          }
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          showToast('Delete Failed', err.response?.data?.message || 'Failed to delete customer.', 'error');
        }
      }
    });
  };

  // Filter customers by search query
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && customers.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Customers...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Customer Directory</h1>
          <p className="page-subtitle">Manage customer profiles and contact details.</p>
        </div>
      </div>

      <div className="controls-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {error && (
        <div className="error-container">
          <AlertCircle size={32} className="error-icon" />
          <p>{error}</p>
        </div>
      )}

      {filteredCustomers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No customers found. Try adding a customer or adjusting your search!
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Email Address</th>
                <th>Billing Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer._id}>
                  <td style={{ fontWeight: 600 }}>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                  <td>{customer.address}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => openEditModal(customer)} className="action-btn edit" title="Edit Customer">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteCustomer(customer)} className="action-btn delete" title="Delete Customer">
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

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}</h3>
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
                    placeholder="e.g. Acme Corp / Jane Doe"
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
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="customer@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="e.g. Suite 300, 456 Main St"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', display: 'inline-block' }}></span>
                      <span>{modalMode === 'add' ? 'Adding...' : 'Saving...'}</span>
                    </span>
                  ) : (
                    modalMode === 'add' ? 'Add Customer' : 'Save Changes'
                  )}
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

export default Customers;
