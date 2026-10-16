import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import './DriverApp.css';
import ShipNovaLogo from '../../components/ShipNovaLogo';

const DriverLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('driverToken');
  const driverId = localStorage.getItem('driverId');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (driverId) {
      const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
      const socketUrl = (envSocketUrl && !envSocketUrl.includes('<') && !envSocketUrl.includes('AAPKA'))
        ? envSocketUrl
        : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : 'https://shipnova-backend-nrwn.onrender.com');
      const socket = io(socketUrl);
      
      socket.on('connect', () => {
        socket.emit('joinDriverRoom', driverId);
      });

      socket.on('bidAccepted', (data) => {
        setNotification(data.message);
        // Auto hide notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [driverId]);

  const handleLogout = () => {
    localStorage.removeItem('driverToken');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverRole');
    navigate('/driver/login');
  };

  return (
    <div className="driver-simulator-bg">
      <div className="driver-simulator-frame">
        {token && (
          <div className="app-header">
            <div className="app-logo">
              <ShipNovaLogo style={{ height: '36px', display: 'flex', alignItems: 'center' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LogOut size={18} className="logout-icon" onClick={handleLogout} />
            </div>
          </div>
        )}
        
        {notification && (
          <div style={{
            position: 'absolute', top: '100px', left: '20px', right: '20px',
            backgroundColor: '#10b981', color: 'white', padding: '15px',
            borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 9999,
            animation: 'fadeInDown 0.3s ease-out'
          }}>
            <Bell size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{notification}</span>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
};

export default DriverLayout;
