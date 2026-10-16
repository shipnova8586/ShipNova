import { useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

// This page handles the redirect after Google OAuth
const SSOCallback = () => {
  const { handleRedirectCallback } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      try {
        await handleRedirectCallback({
          afterSignInUrl: '/dashboard',
          afterSignUpUrl: '/register-company',
        });
      } catch (err) {
        console.error('SSO callback error:', err);
        navigate('/sign-in');
      }
    };
    handle();
  }, [handleRedirectCallback, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      fontFamily: 'sans-serif',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div className="spinner" style={{ width: '40px', height: '40px' }} />
      <p>Verifying your Google account...</p>
    </div>
  );
};

export default SSOCallback;
