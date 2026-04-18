import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    if (!router.isReady) return;

    const { token, seller } = router.query;

    if (token && seller) {
      try {
        const sellerData = JSON.parse(decodeURIComponent(seller));
        localStorage.setItem('onshipy_token', token);
        localStorage.setItem('onshipy_seller', JSON.stringify(sellerData));
        setStatus('Success! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 500);
      } catch (err) {
        setStatus('Something went wrong. Redirecting to login...');
        setTimeout(() => router.push('/login?error=google_failed'), 2000);
      }
    } else {
      setStatus('Sign in failed. Redirecting...');
      setTimeout(() => router.push('/login?error=google_failed'), 2000);
    }
  }, [router.isReady, router.query]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '44px', height: '44px', border: '3px solid #f3f4f6',
          borderTop: '3px solid #1a1a1a', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 20px'
        }} />
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '6px' }}>
          {status}
        </div>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>
          Please wait a moment
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}