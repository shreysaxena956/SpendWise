import React from 'react';

/**
 * ============================================================================
 * SpendWise – Notification Toast
 * ============================================================================
 * Displays transient feedback messages (success or error) for user operations.
 * ============================================================================
 */
export default function NotificationToast({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${notification.type === 'error' ? 'error' : 'success'}`}>
        <span>
          {notification.type === 'error' ? '❌ ' : '✅ '}
          {notification.message}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: 16
          }}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

