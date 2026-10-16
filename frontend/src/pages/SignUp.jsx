import React, { useState, useContext, useEffect } from 'react';
import { useSignUp, useAuth } from '@clerk/clerk-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';
import './SignUp.css';
import ShipNovaLogo from '../components/ShipNovaLogo';

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const { user, isNewClerkUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');

  useEffect(() => {
    if (isSignedIn && !authLoading) {
      if (user) {
        navigate(plan ? `/dashboard?plan=${plan}` : '/dashboard');
      } else if (isNewClerkUser) {
        navigate(plan ? `/register-company?plan=${plan}` : '/register-company');
      }
    }
  }, [isSignedIn, user, isNewClerkUser, authLoading, navigate, plan]);

  const [step, setStep] = useState('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otp });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        const planStr = plan ? `?plan=${plan}` : '';
        navigate(`/register-company${planStr}`);
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!isLoaded) return;
    try {
      const planStr = plan ? `?plan=${plan}` : '';
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `/register-company${planStr}`,
      });
    } catch (err) {
      console.error("Google OAuth Error:", err);
      const errorMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || JSON.stringify(err);
      setError(`Google sign up failed: ${errorMsg}`);
    }
  };

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
            Free 14-Day Trial &nbsp;·&nbsp;
            <span className="badge-dot2">No Credit Card Required</span>
          </div>

          {step === 'form' ? (
            <div className="login-heading-block">
              <h1 className="login-title text-gradient">Create Account</h1>
              <p className="login-subtitle">Start your logistics journey with ShipNova.</p>
            </div>
          ) : (
            <div className="login-heading-block">
              <div className="otp-icon">📧</div>
              <h1 className="login-title text-gradient" style={{ fontSize: '1.8rem' }}>Check Your Email</h1>
              <p className="login-subtitle">
                We sent a 6-digit code to <strong style={{ color: '#818cf8' }}>{email}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="login-glass-form">
          {step === 'form' ? (
            <>
              <button className="google-btn" onClick={handleGoogle} type="button">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google" width={20} height={20}
                />
                Sign up with Google
              </button>

              <div className="or-divider">
                <span /><p>OR</p><span />
              </div>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="lf-group">
                  <label>FULL NAME</label>
                  <div className="lf-input-wrap">
                    <User size={15} className="lf-icon" />
                    <input type="text" placeholder="John Doe" value={name}
                      onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>

                <div className="lf-group">
                  <label>EMAIL ADDRESS</label>
                  <div className="lf-input-wrap">
                    <Mail size={15} className="lf-icon" />
                    <input type="email" placeholder="admin@company.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="lf-group">
                  <label>PASSWORD</label>
                  <div className="lf-input-wrap">
                    <Lock size={15} className="lf-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required minLength={8}
                    />
                    <button type="button" className="lf-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="login-submit-btn" disabled={loading || !isLoaded}>
                  {loading ? <span className="btn-spinner" /> : <>Create Account <ArrowRight size={17} /></>}
                </button>
              </form>

              <p className="login-signup-link">
                Already have an account? <Link to="/sign-in">Sign In</Link>
              </p>
            </>
          ) : (
            <>
              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleVerify} className="login-form">
                <div className="lf-group">
                  <label>VERIFICATION CODE</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="otp-input"
                    maxLength={6}
                  />
                </div>

                <button type="submit" className="login-submit-btn" disabled={loading || otp.length < 6}>
                  {loading ? <span className="btn-spinner" /> : <>Verify & Continue <ArrowRight size={17} /></>}
                </button>
              </form>

              <p className="login-signup-link" style={{ marginTop: '16px' }}>
                Wrong email?{' '}
                <button onClick={() => setStep('form')}
                  style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                  Go back
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* ══════════════ RIGHT — SAME TRUCK VISUAL ══════════════ */}
      <div className="login-right">
        <div className="login-visual-bg" />
        <div className="login-visual-overlay" />
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

export default SignUp;
