import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem',
};

export default function BillingSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }

    // Refresh seller data
    fetch(`${API_BASE}/api/sellers/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(data => {
        if (data.seller) {
          localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
        }
        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 3000);
      })
      .catch(() => setStatus('success'));
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: P.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: P.font
    }}>
      <div style={{
        background: P.surface, borderRadius: 16, padding: '48px 40px',
        textAlign: 'center', maxWidth: 440, width: '100%',
        border: `1px solid ${P.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
      }}>
        {status === 'loading' ? (
          <div style={{ color: P.textSubdued }}>Activating your plan...</div>
        ) : (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#cdfed4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" fill="none" stroke="#006847" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 650, color: P.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              You're all set!
            </h1>
            <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: '0 0 24px' }}>
              Your subscription is now active. Redirecting to dashboard...
            </p>
            <button onClick={() => router.push('/dashboard')} style={{
              padding: '9px 24px', background: P.text, color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font
            }}>
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}