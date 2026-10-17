import React from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

// Official Clerk component handles OAuth token exchange and redirect seamlessly
const SSOCallback = () => {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/register-company"
      fallback={
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
          <p>Verifying your Google account & syncing session...</p>
        </div>
      }
    />
  );
};

export default SSOCallback;

