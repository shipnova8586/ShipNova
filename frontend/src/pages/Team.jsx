import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, Search, Shield, Trash2, X, AlertCircle, Edit2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Pages.css';

const Team = () => {
  const { user } = useContext(AuthContext);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'dispatcher'
  });
  const [formError, setFormError] = useState('');

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users');
      if (res.data.success) {
        setTeamMembers(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch team members.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'company_admin') {
      fetchTeam();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', email: '', role: 'dispatcher' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setModalMode('edit');
    setCurrentMemberId(member._id);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (modalMode === 'add') {
        const res = await axios.post('/users/invite', formData);
        if (res.data.success) {
          fetchTeam();
          setIsModalOpen(false);
        }
      } else {
        const res = await axios.put(`/users/${currentMemberId}`, { role: formData.role });
        if (res.data.success) {
          fetchTeam();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong saving team member details.');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        const res = await axios.delete(`/users/${id}`);
        if (res.data.success) {
          fetchTeam();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to remove team member.');
      }
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'company_admin': return <span className="status-badge" style={{ backgroundColor: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc', borderColor: '#4f46e5' }}>👑 Admin</span>;
      case 'dispatcher': return <span className="status-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderColor: '#3b82f6' }}>🚚 Dispatcher</span>;
      case 'manager': return <span className="status-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', borderColor: '#f59e0b' }}>⚙️ Fleet Mgr</span>;
      case 'accountant': return <span className="status-badge" style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)', color: '#d1d5db', borderColor: '#6b7280' }}>📊 Accountant</span>;
      default: return <span className="status-badge">{role}</span>;
    }
  };

  if (user?.role !== 'company_admin') {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Shield size={48} style={{ color: 'var(--danger)', margin: '0 auto 20px' }} />
          <h2>Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view or manage the team. Only Company Administrators can access this page.</p>
        </div>
      </div>
    );
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Invite team members and manage role-based access.</p>
        </div>
      </div>

      <div className="controls-row">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search team members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Invite Member</span>
        </button>
      </div>

      {error && (
        <div className="error-container">
          <AlertCircle size={32} className="error-icon" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Team...</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member._id}>
                  <td style={{ fontWeight: 600 }}>
                    {member.name} {member._id === user.id && <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginLeft: '8px' }}>(You)</span>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{member.email}</td>
                  <td>{getRoleBadge(member.role)}</td>
                  <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        onClick={() => openEditModal(member)} 
                        className="action-btn edit" 
                        title="Edit Role"
                        disabled={member._id === user.id}
                        style={{ opacity: member._id === user.id ? 0.5 : 1, cursor: member._id === user.id ? 'not-allowed' : 'pointer' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMember(member._id)} 
                        className="action-btn delete" 
                        title="Remove Member"
                        disabled={member._id === user.id}
                        style={{ opacity: member._id === user.id ? 0.5 : 1, cursor: member._id === user.id ? 'not-allowed' : 'pointer' }}
                      >
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

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Invite Team Member' : 'Change Member Role'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            {formError && <div className="error-alert">{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="modal-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={modalMode === 'edit'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. rahul@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={modalMode === 'edit'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Role</label>
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="company_admin">👑 Administrator (Full Access)</option>
                    <option value="dispatcher">🚚 Dispatcher (Shipments & Customers)</option>
                    <option value="manager">⚙️ Fleet Manager (Vehicles & Drivers)</option>
                    <option value="accountant">📊 Accountant (Read-only / Audit)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Send Invite' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
