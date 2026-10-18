import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, Trash2 } from 'lucide-react';

/**
 * Luxury Dark Confirm Modal
 */
export const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary' | 'success'
  onConfirm,
  onClose,
  loading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const isDanger = confirmVariant === 'danger';
  const isSuccess = confirmVariant === 'success';

  const accentColor = isDanger ? '#ef4444' : isSuccess ? '#10b981' : '#00e5ff';
  const accentBg = isDanger 
    ? 'rgba(239, 68, 68, 0.15)' 
    : isSuccess 
    ? 'rgba(16, 185, 129, 0.15)' 
    : 'rgba(0, 229, 255, 0.15)';
  const accentBorder = isDanger 
    ? 'rgba(239, 68, 68, 0.35)' 
    : isSuccess 
    ? 'rgba(16, 185, 129, 0.35)' 
    : 'rgba(0, 229, 255, 0.35)';

  const btnBg = isDanger
    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
    : isSuccess
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : 'linear-gradient(135deg, #00e5ff, #0284c7)';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={!loading ? onClose : undefined}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #131d31, #0c1424)',
          border: `1px solid ${accentBorder}`,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 35px ${isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 229, 255, 0.15)'}`,
          padding: '28px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isDanger ? (
                <Trash2 size={24} color={accentColor} />
              ) : isSuccess ? (
                <CheckCircle2 size={24} color={accentColor} />
              ) : (
                <Info size={24} color={accentColor} />
              )}
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Action Confirmation</p>
            </div>
          </div>
          {!loading && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Message Body */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            padding: '16px',
            margin: '20px 0',
            color: '#cbd5e1',
            fontSize: '0.92rem',
            lineHeight: '1.5'
          }}
        >
          {message}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '11px 22px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '11px 24px',
              borderRadius: '12px',
              border: 'none',
              background: btnBg,
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: `0 8px 20px -4px ${accentColor}66`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                {isDanger && <Trash2 size={16} />}
                {isSuccess && <CheckCircle2 size={16} />}
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Floating Luxury Toast Notification
 */
export const Toast = ({ show, title, message, type = 'success', onClose }) => {
  useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        background: isSuccess
          ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(15, 23, 42, 0.95))'
          : isError
          ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(15, 23, 42, 0.95))'
          : 'linear-gradient(135deg, rgba(14, 116, 144, 0.95), rgba(15, 23, 42, 0.95))',
        border: isSuccess
          ? '1px solid rgba(16, 185, 129, 0.4)'
          : isError
          ? '1px solid rgba(239, 68, 68, 0.4)'
          : '1px solid rgba(0, 229, 255, 0.4)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 229, 255, 0.1)',
        zIndex: 9999999,
        maxWidth: '420px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'fadeInDown 0.3s ease-out'
      }}
    >
      {isSuccess ? (
        <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
      ) : isError ? (
        <AlertTriangle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
      ) : (
        <Info size={22} color="#00e5ff" style={{ flexShrink: 0, marginTop: '2px' }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem' }}>{title}</div>
        <div style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '4px', lineHeight: '1.4' }}>{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
