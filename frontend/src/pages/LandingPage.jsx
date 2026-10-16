import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import ShipNovaLogo from '../components/ShipNovaLogo';
import './LandingPage.css';

const faqs = [
  {
    id: 1,
    title: 'DOMESTIC TRANSPORTATION',
    content: 'Reliable domestic freight solutions designed to move cargo efficiently across the U.S. without surprises. ShipNova manages Full Truckload (FTL), Less-Than-Truckload (LTL), and Expedited Freight with a focus on consistency, visibility, and accountability at every mile. Whether you’re shipping a single pallet or a full trailer, we match your freight with the right equipment, carriers, and routing strategy to keep operations moving smoothly and costs under control.',
  },
  {
    id: 2,
    title: 'TIME CRITICAL & TIME SENSITIVE',
    content: 'When delivery windows are non-negotiable, ShipNova steps in with precision and urgency. Our Time-Critical Solutions are built for freight that cannot miss. Production shutdowns, emergency replenishment, launch deadlines, and mission-critical components all require proactive planning and real-time execution. We manage routes, carriers, and contingencies closely to ensure your freight arrives exactly when it needs to.',
  },
  {
    id: 3,
    title: 'HIGH RISK',
    content: 'Some freight carries more than financial value. It carries operational, reputational, or safety risk. ShipNova specializes in High-Risk Shipment Services that demand heightened oversight, vetted carriers, secure handling, and constant monitoring. From sensitive materials to high-value cargo, we mitigate risk through proactive planning, real-time tracking, and direct accountability so nothing is left to chance.',
  },
  {
    id: 4,
    title: 'HIGH TOUCH',
    content: 'High-touch freight requires more than a transaction. It requires attention, communication, and hands-on management. ShipNova provides White-Glove High Touch Logistics for shipments that demand extra care, coordination, or complexity. We stay closely involved from pickup to delivery, offering clear communication, proactive updates, and tailored execution that reflects the importance of your cargo and your customer experience.',
  },
  {
    id: 5,
    title: 'IN-HOUSE FREIGHT FORWARDING SERVICES',
    content: 'ShipNova’s in-house freight forwarding services simplify complex logistics from origin to destination. We handle Expedited Freight, Trade Show Logistics, and End-to-End Global Solutions, coordinating transportation, documentation, timing, and delivery details across borders and modes. Whether you’re racing a deadline or managing a multi-stage move, we provide a fully managed approach that keeps freight moving with confidence.',
  }
];

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "ShipNova is the first logistics partner we've had that actually feels like a partner. They communicate before we ever have to ask.",
      role: "OPERATIONS DIRECTOR",
      company: "MANUFACTURING"
    },
    {
      quote: "The level of visibility and control we have with ShipNova is unmatched. It's transformed how we handle our freight.",
      role: "SUPPLY CHAIN MANAGER",
      company: "RETAIL"
    },
    {
      quote: "When we have high-stakes, time-critical shipments, ShipNova is the only call we make. They deliver every single time.",
      role: "VP OF LOGISTICS",
      company: "TECHNOLOGY"
    },
    {
      quote: "Their proactive approach to freight management has saved us countless hours and reduced our logistics costs significantly.",
      role: "LOGISTICS COORDINATOR",
      company: "AUTOMOTIVE"
    },
    {
      quote: "A true extension of our team. Their hospitality-led service model makes dealing with freight actually enjoyable.",
      role: "DIRECTOR OF OPERATIONS",
      company: "FOOD & BEVERAGE"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
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
              <Link to="/pricing">Launch Pad</Link>
              <Link to="/track">Track Your Shipment</Link>
              <Link to="/driver/login">Driver Login</Link>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/sign-in" className="btn-nav-outline">SIGN IN</Link>
              <Link to="/pricing" className="btn-nav-outline">GET STARTED</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            DELIVERING YOUR MOST<br/>DEMANDING FREIGHT
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Simplifying freight logistics through hospitality and innovation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/contact" className="btn-hero-outline">CONNECT FOR A QUOTE</Link>
          </motion.div>
        </div>
      </section>

      {/* Standard in Freight Section */}
      <section className="standard-section">
        {/* Video Section */}
        <section className="video-section">
          <div className="video-container">
            <iframe 
              src="https://app.vidzflow.com/v/U3IWGogZMK?dq=576&ap=true&muted=true&loop=true&ctp=false&playsinline=true"
              frameBorder="0"
              allow="autoplay; fullscreen"
              className="promo-video"
              title="ShipNova Promo"
            ></iframe>
          </div>
        </section>

        <div className="standard-content">
          <h2 className="section-title text-white">THE NEW STANDARD IN <span className="underline">FREIGHT</span></h2>
          <div className="standard-desc-wrap">
            <p className="section-desc">
              Freight may be complex and demanding, but working with your logistics partner shouldn't be. At ShipNova,
              we take ownership of every load so you never have to wonder what comes next. From first call to final
              delivery, we anticipate needs, communicate clearly, and create calm in the chaos.
            </p>
            <p className="section-desc">
              Exceptional logistics isn't just about what we deliver. It's how we deliver it.
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="cards-grid">
          <div className="feature-card">
            <div className="card-image-wrap">
              <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/69551ff15c2847a6ec319969_banner-card-image-01.jpg" alt="Built for All Freight Types" />
            </div>
            <div className="card-content">
              <h3>Built for All Freight Types</h3>
              <p>Our network, processes, and people are designed to flex around your freight, no matter the size, sensitivity, or complexity. If it needs to get there safely, reliably, and without the drama, ShipNova is built for it.</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="card-image-wrap">
              <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/69551ff1f2dff67b35a78610_banner-card-image-02.jpg" alt="Hospitality-Grade Service" />
            </div>
            <div className="card-content">
              <h3>Hospitality-Grade Service</h3>
              <p>Clear communication, proactive updates, and a team that treats your freight like it’s our own. We deliver peace of mind with every mile.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="card-image-wrap">
              <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/69551ff1896e4bd82dd82c13_banner-card-image-03.jpg" alt="Intelligent Operations" />
            </div>
            <div className="card-content">
              <h3>Intelligent Operations</h3>
              <p>Innovation isn't a buzzword for us. It's how we streamline processes, reduce friction, and give you real-time confidence at every step. Powered by smart technology and data visibility, our team stays ahead of issues before they surface, so your freight keeps moving and you stay in control.</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="card-image-wrap">
              <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/69551ff1861667441e6f09b1_banner-card-image-04.jpg" alt="Scalable Capacity" />
            </div>
            <div className="card-content">
              <h3>Scalable Capacity</h3>
              <p>Whether you're shipping one load or managing a national program, our network and operational systems are built to grow with you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Accordion Section */}
      <section className="faq-section">
        <div className="faq-header">
          <Link to="/contact" className="btn-outline-cyan">CONNECT FOR A QUOTE</Link>
          <h2 className="faq-title">WHERE WE CAN HELP</h2>
          <p className="faq-subtitle">ShipNova offers comprehensive freight services designed to deliver consistency, proactive communication, and calm execution at every stage. We'll treat your load as our own.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq) => (
            <div key={faq.id} className="faq-item">
              <button 
                className={`faq-toggle ${openFaq === faq.id ? 'active' : ''}`}
                onClick={() => toggleFaq(faq.id)}
              >
                <span>{faq.title}</span>
                <div className="icon-wrap">
                  {openFaq === faq.id ? <Minus size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                </div>
              </button>
              <AnimatePresence>
                {openFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="faq-content-wrap"
                  >
                    <div className="faq-content">
                      <p>{faq.content}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <div className="testimonial-container">
          <h2 className="testimonial-title">WHY CLIENTS TRUST US</h2>
          
          <div className="testimonial-slider">
            <button className="slider-arrow left" onClick={prevTestimonial}>
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            
            <div className="testimonial-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="testimonial-quote">"{testimonials[currentTestimonial].quote}"</p>
                  <div className="testimonial-author">
                    <span className="author-role">{testimonials[currentTestimonial].role}</span>
                    <span className="author-company">{testimonials[currentTestimonial].company}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <button className="slider-arrow right" onClick={nextTestimonial}>
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="slider-dots">
            {testimonials.map((_, index) => (
              <button 
                key={index} 
                className={`slider-dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <img src="https://cdn.prod.website-files.com/69550c0d31b345c8a002ac3d/695769b2efcb4150332a8ed4_1503b047fede779a5b11ef1880cfb047_cta-bg-image.jpg" alt="CTA Background" className="cta-image" />
        </div>
        <div className="cta-content-container">
          <div className="cta-text-wrap">
            <h2 className="cta-title">READY FOR A LOGISTICS EXPERIENCE THAT FEELS OUT OF THIS WORLD?</h2>
            <p className="cta-subtitle">Let us move your most demanding freight with confidence.</p>
            <Link to="/contact" className="btn-nav-outline cta-btn">CONNECT FOR A QUOTE</Link>
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

export default LandingPage;
