import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck } from 'lucide-react';

const DriverLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('driverToken');
    const role = localStorage.getItem('driverRole');
    if (token) {
      if (role === 'company_driver') navigate('/driver/internal/home');
      else if (role === 'external_carrier') navigate('/driver/external/board');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/driver-auth/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('driverToken', res.data.token);
        localStorage.setItem('driverId', res.data.data._id);
        localStorage.setItem('driverRole', res.data.data.role);

        if (res.data.data.role === 'company_driver') {
          navigate('/driver/internal/home');
        } else {
          navigate('/driver/external/board');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-auth-screen">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Truck size={48} color="#00e5ff" style={{ margin: '0 auto 10px' }} />
        <h2>Driver Portal</h2>
        <p>Login to manage your loads</p>
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleLogin}>
        <input
          type="text"
          className="app-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          className="app-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="app-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>New independent carrier? </span>
        <button 
          onClick={() => navigate('/driver/signup')} 
          style={{ background: 'none', border: 'none', color: '#00e5ff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default DriverLogin;
