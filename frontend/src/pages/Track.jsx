import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Truck, Calendar, User, Package, AlertTriangle, Phone, Share2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ShipNovaLogo from '../components/ShipNovaLogo';
import LiveMap from '../components/LiveMap';
import './Track.css';

const Track = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trackingParam = params.get('tracking');
    if (trackingParam) {
      setTrackingNumber(trackingParam);
      // We can't directly call handleTrackSubmit because it expects an event,
      // so we call a helper function instead.
      fetchShipmentData(trackingParam);
    }
  }, [location]);

  const fetchShipmentData = async (trackNum) => {
    if (!trackNum.trim()) return;

    setLoading(true);
    setError(null);
    setShipment(null);

    try {
      // Direct call to public tracking route
      const res = await axios.get(`/shipments/track/${trackNum.trim()}`);
      if (res.data.success) {
        setShipment(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No shipment found with this tracking number. Verify the number and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    fetchShipmentData(trackingNumber);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("Tracking link copied to clipboard!");
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  // Status index for timeline progress
  const statusSteps = [
    { label: 'Registered', status: 'Pending', desc: 'Shipment booking registered.' },
    { label: 'Assigned', status: 'Assigned', desc: 'Delivery driver allocated.' },
    { label: 'Picked Up', status: 'Picked Up', desc: 'Courier picked up package.' },
    { label: 'In Transit', status: 'In Transit', desc: 'Package traveling to destination hub.' },
    { label: 'Out for Delivery', status: 'Out For Delivery', desc: 'Courier out for final delivery.' },
    { label: 'Delivered', status: 'Delivered', desc: 'Package delivered successfully.' }
  ];

  const getStatusIndex = (currentStatus) => {
    if (currentStatus === 'Cancelled') return -1;
    return statusSteps.findIndex(step => step.status === currentStatus);
  };

  const currentStepIdx = shipment ? getStatusIndex(shipment.status) : -1;

  return (
    <div className="track-page">
      <div className="track-header">
        <div className="track-brand">
          <ShipNovaLogo style={{ height: '52px' }} />
        </div>
        <Link to="/" className="portal-link">Back to Merchant Sign In</Link>
      </div>

      <div className="track-container">
        <div className="track-search-box card">
          <h1>Track Your Shipment</h1>
          <p>Enter your unique 12-character ShipNova tracking number to monitor package status.</p>
          <form onSubmit={handleTrackSubmit} className="track-form">
            <div className="track-input-wrapper">
              <Search className="track-icon" size={20} />
              <input
                type="text"
                placeholder="e.g. SN-20260707-4592"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary track-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Track Package'}
            </button>
          </form>
        </div>

        {error && (
          <div className="track-error card">
            <AlertTriangle size={36} className="error-alert-icon" />
            <p>{error}</p>
          </div>
        )}

        {shipment && (
          <div className="track-result-grid">
            {/* Left Column: Shipment Status Timeline */}
            <div className="timeline-card card">
              <div className="timeline-top-content">
                <h3>Tracking Status Details</h3>
                
                {shipment.status === 'Cancelled' ? (
                  <div className="cancelled-message">
                    <AlertTriangle size={24} />
                    <span>This shipment has been cancelled by the merchant.</span>
                  </div>
                ) : (
                  <div className="timeline">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isActive = idx === currentStepIdx;
                      return (
                        <div key={idx} className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                          <div className="timeline-badge-node">
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <div className="timeline-content">
                            <h4 className="timeline-label">{step.label}</h4>
                            <p className="timeline-desc">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Actions Area */}
              <div className="bottom-actions-area">
                {shipment.driverId && (
                  <div className="driver-profile-card">
                    <div className="driver-profile-header">
                      <div className="driver-avatar">
                        <User size={24} />
                      </div>
                      <div className="driver-info">
                        <h4>{shipment.driverId.name}</h4>
                        <div className="driver-rating">
                          <span>⭐ 4.8</span>
                          <span className="dot-separator">•</span>
                          <span>Courier Partner</span>
                        </div>
                      </div>
                    </div>
                    <a href={`tel:${shipment.driverId.phone}`} className="btn btn-primary call-driver-btn">
                      <Phone size={16} /> Call Courier
                    </a>
                  </div>
                )}
                
                <button onClick={handleShare} className="share-btn">
                  <Share2 size={18} /> Share Tracking Details
                </button>
              </div>
            </div>

            {/* Right Column: Map + Shipment Meta Info */}
            <div className="track-right-col">
              <div className="map-card card" style={{ padding: 0, overflow: 'hidden', height: '240px', marginBottom: '24px' }}>
                <LiveMap shipment={shipment} />
              </div>

              <div className="details-card card">
                <h3>Shipment Specifications</h3>
                
                <div className="metadata-list">
                  <div className="meta-item">
                    <MapPin size={18} className="meta-icon" />
                    <div>
                      <span className="meta-label">Origin Location</span>
                      <p>{shipment.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="meta-item">
                    <MapPin size={18} className="meta-icon green" />
                    <div>
                      <span className="meta-label">Destination Address</span>
                      <p>{shipment.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="meta-item">
                    <User size={18} className="meta-icon" />
                    <div>
                      <span className="meta-label">Package Consignee</span>
                      <p>{shipment.receiverName} <span className="sender-tag">from {shipment.senderName}</span></p>
                    </div>
                  </div>

                  <div className="meta-item">
                    <Package size={18} className="meta-icon" />
                    <div>
                      <span className="meta-label">Details</span>
                      <p>{shipment.weight} kg, {shipment.shipmentType} Shipping</p>
                    </div>
                  </div>

                  {shipment.driverId && (
                    <div className="meta-item">
                      <Truck size={18} className="meta-icon" />
                      <div>
                        <span className="meta-label">Assigned Courier Agent</span>
                        <p>{shipment.driverId.name} ({shipment.driverId.phone})</p>
                      </div>
                    </div>
                  )}

                  <div className="meta-item">
                    <Calendar size={18} className="meta-icon" />
                    <div>
                      <span className="meta-label">Booked Date</span>
                      <p>{new Date(shipment.createdAt).toLocaleDateString()} {new Date(shipment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
                
                <div className="carrier-badge">
                  <span>Managed by tenant: </span>
                  <strong>{shipment.companyId?.name}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Track;
