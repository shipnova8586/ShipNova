import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const DriverSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    username: '',
    password: '',
    kycDocumentUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/driver-auth/signup', formData);
      if (res.data.success) {
        localStorage.setItem('driverToken', res.data.token);
        localStorage.setItem('driverId', res.data.data._id);
        localStorage.setItem('driverRole', res.data.data.role);
        // Always goes to external board because signup is only for external carriers
        navigate('/driver/external/board');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-auth-screen">
      <button 
        onClick={() => navigate('/driver/login')}
        style={{ background: 'none', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '20px', alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 style={{ color: '#fff', marginBottom: '5px' }}>Register Carrier</h2>
      <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '20px' }}>Join the public load board network</p>

      {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="name"
          className="app-input"
          placeholder="Full Name / Company Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="phone"
          className="app-input"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="licenseNumber"
          className="app-input"
          placeholder="License Number"
          value={formData.licenseNumber}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="kycDocumentUrl"
          className="app-input"
          placeholder="KYC Document Link (Google Drive / ID URL)"
          value={formData.kycDocumentUrl}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="username"
          className="app-input"
          placeholder="Choose a Username"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
        <input
          type="password"
          name="password"
          className="app-input"
          placeholder="Choose a Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <button type="submit" className="app-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default DriverSignup;
