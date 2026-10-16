import React from "react";
import { Link } from "react-router-dom";
import { Star, Shield, Users, Heart, Target } from "lucide-react";
import ShipNovaLogo from "../components/ShipNovaLogo";
import "./LandingPage.css"; /* Import landing page styles for the exact navbar */
import "./About.css";

const About = () => {
  return (
    <div className="about-page">
      {/* Exact Navbar from Landing Page */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <ShipNovaLogo size="large" />
          </Link>
          <div className="nav-right">
            <div className="nav-links">
              <Link to="/about">About</Link>
              <Link to="/pricing">Pricing</Link>
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
              <Link to="/launch-pad">Launch Pad</Link>
              <Link to="/track">Track Your Shipment</Link>
              <Link to="/driver/login">Driver Login</Link>
            </div>
            <Link to="/pricing" className="btn-nav-outline">CONNECT FOR A QUOTE</Link>
          </div>
        </div>
      </nav>

      <section className="about-hero">
        <div className="about-container">
          <div className="story-grid">
            <div className="story-image-container">
              <img 
                src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/695773bbc0bb990f3c03be03_about-banner-image-p-500.jpg" 
                alt="ShipNova Office" 
                className="story-image"
              />
            </div>
            <div className="story-content">
              <h2>OUR STORY</h2>
              <p>
                Freight is demanding by nature. The roads are rough, the deadlines are tight, and for too long, the logistics industry has used that pressure as an excuse for poor communication and finger-pointing.
              </p>
              <p>
                <strong>ShipNova was built to disrupt that matrix.</strong>
              </p>
              <p>
                We started with a simple promise: no matter what breaks down, we don't. We believe that while freight may be a chaotic puzzle, working with your logistics partner should feel like a breeze. From day one, we've treated every load like a VIP mission—taking absolute ownership and removing all uncertainty for our customers.
              </p>
              <p>
                We don't wait for problems to surface; we anticipate them with cutting-edge tech and zero excuses. We don't hide behind automated emails. We stay accountable, accessible, and proactive from the first call to the final delivery.
              </p>
              <p>
                By pairing hospitality-grade service with innovative operations and technology, ShipNova delivers more than freight. We deliver confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="core-values-section">
        <div className="about-container">
          <h2 className="values-title">OUR CORE VALUES</h2>
          <p className="values-subtitle">
            In freight, every journey starts with a route. It&#39;s the plan that keeps things moving, the discipline that prevents chaos, and the promise that what&#39;s been entrusted will arrive as expected. At ShipNova, R.O.U.T.E. is more than the path a load takes &mdash; it&#39;s the mindset we bring to every shipment and every relationship.
          </p>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon-container bg-reliability">
                <Star size={48} color="white" />
              </div>
              <div className="value-text-container">
                <h3 className="text-reliability">RELIABILITY</h3>
                <p>Reliability starts with integrity. From pickup to proof of delivery, we follow through on every commitment with proactive communication and complete accountability.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="value-icon-container bg-ownership">
                <Target size={48} color="white" />
              </div>
              <div className="value-text-container">
                <h3 className="text-ownership">OWNERSHIP</h3>
                <p>We take personal responsibility for every load we move and every outcome attached to it. It isn&#39;t about control. It&#39;s about accountability, care, and standing behind the work we do.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="value-icon-container bg-understanding">
                <Shield size={48} color="white" />
              </div>
              <div className="value-text-container">
                <h3 className="text-understanding">UNDERSTANDING</h3>
                <p>We approach every load with awareness of its impact because behind each shipment is someone&#39;s promise and reputation.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="value-icon-container bg-teamwork">
                <Users size={48} color="white" />
              </div>
              <div className="value-text-container">
                <h3 className="text-teamwork">TEAMWORK</h3>
                <p>Collaboration builds resilience. We move together, adapt together, and deliver together. Because when challenges arise, our strength is in how we show up for each other.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="value-icon-container bg-empathy">
                <Heart size={48} color="white" />
              </div>
              <div className="value-text-container">
                <h3 className="text-empathy">EMPATHY</h3>
                <p>Hospitality is our hallmark. We look for moments to go beyond what&#39;s expected, showing care in ways that make every interaction feel personal.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer from Landing Page */}
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
              <li><a href="#">Full Truckload (FTL)</a></li>
              <li><a href="#">Less Than Truckload (LTL)</a></li>
              <li><a href="#">High Risk Freight</a></li>
              <li><a href="#">Time Critical & Time Sensitive</a></li>
              <li><a href="#">End-To-End Solutions</a></li>
              <li><a href="#">Trade Shows & Exhibits</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Learn more</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Launch Pad</a></li>
              <li><a href="#">Case Studies</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
