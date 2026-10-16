import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Reuse navbar and footer styles
import './Contact.css'; // Contact specific styles
import ShipNovaLogo from '../components/ShipNovaLogo';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    emailAddress: '',
    phoneNumber: '',
    serviceType: '',
    origin: '',
    destination: '',
    deadline: '',
    additionalDetails: ''
  });
  const [status, setStatus] = useState({ loading: false, message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: 'Sending request...', type: 'info' });
    
    try {
      // Connect to the backend API route
      const res = await axios.post('/contact', formData);
      setStatus({ loading: false, message: res.data.message || 'Your quote request has been sent successfully!', type: 'success' });
      setFormData({
        fullName: '', companyName: '', emailAddress: '', phoneNumber: '',
        serviceType: '', origin: '', destination: '', deadline: '', additionalDetails: ''
      });
      // Clear success message after 5 seconds
      setTimeout(() => setStatus({ loading: false, message: '', type: '' }), 5000);
    } catch (error) {
      console.error('Submit error:', error);
      setStatus({ 
        loading: false, 
        message: error.response?.data?.message || 'Oops! Something went wrong while submitting the form.', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="landing-page contact-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <ShipNovaLogo size="large" />
          </Link>
          <div className="nav-right">
            <div className="nav-links">
              <Link to="/about">About</Link>
              <div className="dropdown">
                <span>Services</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="dropdown">
                <span>Resources</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <Link to="/careers">Careers</Link>
              <Link to="/pricing">Launch Pad</Link>
              <Link to="/track">Track Your Shipment</Link>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/sign-in" className="btn-nav-outline">SIGN IN</Link>
              <Link to="/pricing" className="btn-nav-outline">GET STARTED</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contact Banner */}
      <section className="contact-banner-section">
        <div className="contact-banner-container">
          <div className="banner-title-wrap">
            <h1 className="banner-title">
              LET'S MOVE YOUR FREIGHT<br />WITH CONFIDENCE.
            </h1>
          </div>
          <div className="sub-banner-content-wrap">
            <p className="text-white">
              When the shipment matters, the conversation should be simple. Whether you’re planning ahead or<br />
              facing a tight timeline, our team is here to help you navigate next steps with clarity and care.
            </p>
            <p className="text-white">
              Reach out to request a quote, ask a question, or talk through your logistics needs. We’ll take it from there.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section (White Background) */}
      <section className="contact-main-section">
        <div className="contact-container">
          
          {/* Top Info Grid */}
          <div className="contact-info-grid">
            <div className="contact-info-left">
              <h2 className="contact-section-title">SPEAK WITH A<br />LOGISTICS EXPERT</h2>
              <div className="contact-info-desc">
                <p className="text-primary">
                  Our team is ready to learn about your freight, your<br />
                  timelines, and what matters most to your operation. No<br />
                  pressure. No guesswork. Just straightforward guidance<br />
                  and reliable support.
                </p>
              </div>
            </div>
            
            <div className="contact-info-right">
              {/* Phone */}
              <div className="contact-item">
                <div className="contact-item-left">
                  <div className="contact-icon-wrap">
                    <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/6957a5866d5aa02e69e774c6_contact-icon-01.svg" alt="Phone" />
                  </div>
                  <div className="contact-item-value">9173848586</div>
                </div>
                <a href="tel:9173848586" className="contact-item-link">Call</a>
              </div>

              {/* Sales Team Email */}
              <div className="contact-item">
                <div className="contact-item-left">
                  <div className="contact-icon-wrap">
                    <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/6957a586d902d65ced95bac0_contact-icon-02.svg" alt="Email" />
                  </div>
                  <div className="contact-item-value">shipnova8586@gmail.com</div>
                </div>
                <a href="mailto:shipnova8586@gmail.com" className="contact-item-link">Sales Team</a>
              </div>

              {/* Billing Support Email */}
              <div className="contact-item">
                <div className="contact-item-left">
                  <div className="contact-icon-wrap">
                    <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/6957a586d902d65ced95bac0_contact-icon-02.svg" alt="Email" />
                  </div>
                  <div className="contact-item-value">billing.shipnova@gmail.com</div>
                </div>
                <a href="mailto:billing.shipnova@gmail.com" className="contact-item-link">Billing Support</a>
              </div>

              {/* Address */}
              <div className="contact-item">
                <div className="contact-item-left">
                  <div className="contact-icon-wrap small-icon">
                    <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/6957a586260b1bc7ba2864e8_contact-icon-03.svg" alt="Address" />
                  </div>
                  <div className="contact-item-value">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="contact-form-area">
            <div className="contact-form-block">
              <div className="contact-form-top-wrap">
                <h3 className="contact-form-title">Tell us about your shipment. We’ll handle the rest.</h3>
                <div className="contact-form-text-wrap">
                  <p className="contact-form-text">Fill out the form below and a member of the ShipNova team will be in touch shortly. The more details<br />you provide, the better we can tailor a solution to your needs.</p>
                </div>
              </div>
              
              <form className="real-contact-form" onSubmit={handleSubmit}>
                <div className="form-field-row">
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required className="real-input" />
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" required className="real-input" />
                </div>
                <div className="form-field-row">
                  <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} placeholder="Email Address" required className="real-input" />
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="real-input" />
                </div>
                <div className="form-field-row">
                  <input type="text" name="serviceType" value={formData.serviceType} onChange={handleChange} placeholder="Service Type" required className="real-input" />
                  <input type="text" name="origin" value={formData.origin} onChange={handleChange} placeholder="Origin" required className="real-input" />
                </div>
                <div className="form-field-row">
                  <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="Destination" required className="real-input" />
                  <input type="text" name="deadline" value={formData.deadline} onChange={handleChange} placeholder="Deadline to Deliver" required className="real-input" />
                </div>
                <div className="form-field-row">
                  <textarea name="additionalDetails" value={formData.additionalDetails} onChange={handleChange} placeholder="Additional Details or Special Requirements" rows="4" className="real-input real-textarea"></textarea>
                </div>
                

                <p className="form-bottom-text">Once submitted, our team will review your request and follow up promptly with next steps or a custom quote.</p>
                <div className="contact-button-wrap">
                  <button type="submit" className="white-button" disabled={status.loading}>
                    {status.loading ? 'Sending...' : 'Submit Your Request'}
                  </button>
                </div>

                {status.message && (
                  <div style={{
                    marginTop: '20px',
                    padding: '15px 20px',
                    borderRadius: '6px',
                    backgroundColor: status.type === 'error' ? '#ffdede' : status.type === 'success' ? '#defce8' : 'rgba(79, 70, 229, 0.1)',
                    color: '#333333',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    textAlign: 'center'
                  }}>
                    {status.message}
                  </div>
                )}
              </form>
            </div>
          </div>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-col brand-col">
            <ShipNovaLogo size="large" />
            <p className="brand-desc">
              ShipNova simplifies the world's most demanding freight through <span className="highlight-text">hospitality-led service</span>, <span className="highlight-text">innovative operations</span>, and <span className="highlight-text">total ownership</span> from pickup to delivery.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="LinkedIn" style={{ fontWeight: 'bold', fontSize: '14px' }}>IN</a>
              <a href="#" aria-label="Instagram" style={{ fontWeight: 'bold', fontSize: '14px' }}>IG</a>
              <a href="#" aria-label="Twitter" style={{ fontWeight: 'bold', fontSize: '14px' }}>X</a>
            </div>
            <div className="made-by-badge">
              <div className="made-by-text">MADE BY</div>
              <div className="made-by-name">Ved</div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link to="#">Full Truckload (FTL)</Link></li>
              <li><Link to="#">Less Than Truckload (LTL)</Link></li>
              <li><Link to="#">High Risk Freight</Link></li>
              <li><Link to="#">Time Critical</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Learn more</h4>
            <ul>
              <li><Link to="#">About</Link></li>
              <li><Link to="#">Careers</Link></li>
              <li><Link to="#">Blog</Link></li>
              <li><Link to="#">Case Studies</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="#">Support</Link></li>
              <li><Link to="#">Legal</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
