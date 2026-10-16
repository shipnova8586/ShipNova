import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, Phone, Home, Compass } from 'lucide-react';
import './RegisterCompany.css';

const RegisterCompany = () => {
  const { registerCompanyWithClerk, pendingClerkData, error, isNewClerkUser, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'core';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: pendingClerkData?.email || '',
    companyPhone: '',
    companyAddress: '',
    subscriptionPlan: plan
  });

  // We removed the useEffect that auto-navigates so it doesn't conflict with handleSubmit

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await registerCompanyWithClerk(formData);
    setLoading(false);
    if (success) {
      navigate('/pricing');
    }
  };

  return (
    <div className="register-company-page">
      <div className="register-company-card card">
        <div className="rc-header">
          <Compass size={40} className="rc-logo" />
          <h1>Welcome to ShipNova!</h1>
          <p>
            Hi <strong>{pendingClerkData?.name || 'there'}</strong>! Your Clerk account is ready.
            Now let's set up your logistics company to get started.
          </p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="rc-form">
          <h3 className="rc-section-title">Company Information</h3>

          <div className="rc-grid">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div className="input-with-icon">
                <Building2 className="input-icon" size={18} />
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. Apex Logistics Pvt Ltd"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Email</label>
              <div className="input-with-icon">
                <Building2 className="input-icon" size={18} />
                <input
                  type="email"
                  name="companyEmail"
                  required
                  placeholder="info@company.com"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input
                  type="text"
                  name="companyPhone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.companyPhone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Address</label>
              <div className="input-with-icon">
                <Home className="input-icon" size={18} />
                <input
                  type="text"
                  name="companyAddress"
                  required
                  placeholder="Street, City, State"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary rc-submit-btn" disabled={loading}>
            {loading ? 'Creating Company...' : '🚀 Create My Company & Choose Plan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterCompany;
