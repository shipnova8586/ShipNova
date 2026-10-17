import React, { useState, useContext, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';
import ShipNovaLogo from '../components/ShipNovaLogo';

const Login = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const { user, isNewClerkUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn && !authLoading) {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else if (isNewClerkUser) {
        navigate('/register-company', { replace: true });
      }
    }
  }, [isSignedIn, user, isNewClerkUser, authLoading, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Email + Password Sign In ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ──
  const handleGoogle = async () => {
    if (!isLoaded) return;
    if (isSignedIn) {
      navigate('/dashboard', { replace: true });
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      console.error("Google OAuth Error:", err);
      const errorMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || '';
      
      // If user is already authenticated in Clerk, seamlessly route to dashboard
      if (errorMsg.toLowerCase().includes('already signed in') || err?.errors?.some(e => e.code === 'session_exists')) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setError(`Google login failed: ${errorMsg || 'Please try again.'}`);
      setLoading(false);
    }
  };

  // If user is already authenticated, show friendly redirect state instead of active form
  if (isSignedIn) {
    return (
      <div className="login-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', maxWidth: '400px', width: '90%' }}>
          <div className="spinner" style={{ margin: '0 auto 20px', width: '40px', height: '40px' }}></div>
          <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', marginBottom: '8px' }}>Active Session Detected</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Redirecting to your ShipNova console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">

      {/* ══════════════ LEFT — FORM PANEL ══════════════ */}
      <div className="login-left">
        <div className="login-header-group">
          {/* Logo */}
          <div className="login-logo">
            <ShipNovaLogo style={{ height: '60px' }} />
          </div>

          {/* Badge */}
          <div className="login-badge">
            <span className="badge-dot">✦</span>
            SaaS Platform: Built for Scale &nbsp;·&nbsp;
            <span className="badge-dot2">Multi-Tenant Architecture</span>
          </div>

          {/* Heading */}
          <div className="login-heading-block">
            <h1 className="login-title text-gradient">Operator Access</h1>
            <p className="login-subtitle">Enter your credentials to access the console.</p>
          </div>
        </div>

        <div className="login-glass-form">
          {/* Google Button */}
          <button className="google-btn" onClick={handleGoogle} type="button">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Google login
          </button>

          {/* OR Divider */}
          <div className="or-divider">
            <span /><p>OR</p><span />
          </div>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="lf-group">
              <label>EMAIL ADDRESS</label>
              <div className="lf-input-wrap">
                <Mail size={15} className="lf-icon" />
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="lf-group">
              <label>PASSWORD</label>
              <div className="lf-input-wrap">
                <Lock size={15} className="lf-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="lf-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading || !isLoaded}>
              {loading ? <span className="btn-spinner" /> : <>Initialize Dashboard <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="login-signup-link">
            Don't have an account? <Link to="/sign-up">Sign Up Free</Link>
          </p>
        </div>
      </div>

      {/* ══════════════ RIGHT — VISUAL PANEL ══════════════ */}
      <div className="login-right">
        {/* Full bleed truck image */}
        <div className="login-visual-bg" />

        {/* Overlay gradient so left edge blends into form panel */}
        <div className="login-visual-overlay" />

        {/* Floating stat cards on top of image */}
        <div className="login-stats">
          <div className="stat-card">
            <span className="stat-num">2,400+</span>
            <span className="stat-label">Shipments Tracked</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">50+</span>
            <span className="stat-label">Companies</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
