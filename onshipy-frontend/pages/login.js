import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(null);
  const [showCookies, setShowCookies] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('onshipy_token', data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleGoogle = () => {
    alert('Google sign-in coming soon. Use email and password for now.');
  };

  const handleApple = () => {
    alert('Apple sign-in coming soon. Use email and password for now.');
  };

  const acceptCookies = () => {
    localStorage.setItem('onshipy_cookies', 'accepted');
    setCookiesAccepted(true);
    setShowCookies(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('onshipy_cookies', 'rejected');
    setCookiesAccepted(false);
    setShowCookies(false);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          width: 100%;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #ffffff;
        }

        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
        }

        .login-logo {
          font-size: 26px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }

        .login-tagline {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .social-btn {
          width: 100%;
          padding: 12px 16px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #111;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.12s, border-color 0.12s;
          font-family: inherit;
          margin-bottom: 10px;
        }

        .social-btn:hover { background: #f9fafb; border-color: #d1d5db; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #f3f4f6;
        }

        .divider-text {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
          white-space: nowrap;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #111;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          outline: none;
          color: #111;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }

        .form-input:focus {
          border-color: #1a1a2e;
          box-shadow: 0 0 0 3px rgba(26,26,46,0.06);
        }

        .btn-primary {
          width: 100%;
          padding: 13px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s;
          margin-top: 4px;
        }

        .btn-primary:hover { opacity: 0.88; }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .features-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 32px;
          padding-top: 28px;
          border-top: 1px solid #f3f4f6;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          background: #00a47c;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }

        .feature-text {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }

        /* Cookie banner */
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #1a1a2e;
          padding: 16px 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cookie-text {
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          line-height: 1.5;
          flex: 1;
          min-width: 200px;
        }

        .cookie-text a {
          color: #00a47c;
          text-decoration: underline;
        }

        .cookie-btns {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .cookie-accept {
          padding: 8px 18px;
          background: #00a47c;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }

        .cookie-reject {
          padding: 8px 18px;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
        }

        @media (max-width: 480px) {
          .login-page { padding: 32px 20px 80px; align-items: flex-start; padding-top: 48px; }
          .features-row { grid-template-columns: 1fr; }
          .cookie-banner { flex-direction: column; align-items: flex-start; }
          .cookie-btns { width: 100%; }
          .cookie-accept, .cookie-reject { flex: 1; text-align: center; }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          {/* Logo */}
          <div className="login-logo">Onshipy</div>
          <div className="login-tagline">The smart way to resell products from anywhere</div>

          {/* Social sign-in */}
          <button className="social-btn" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button className="social-btn" onClick={handleApple}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#111">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
          </button>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or sign in with email</span>
            <div className="divider-line" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="yourname@example.com"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <a href="#" style={{ fontSize: '13px', color: '#00a47c', textDecoration: 'none', fontWeight: '500' }}>
                  Forgot password?
                </a>
              </div>
              <input
                className="form-input"
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Your password"
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '14px', fontSize: '14px', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: '#00a47c', fontWeight: '600', textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>

          {/* Features */}
          <div className="features-row">
            {[
              'Import from Nike, ASOS, Amazon & more',
              'Auto-purchase when customers order',
              'Full control over your profit margins',
              'Works with Shopify & WooCommerce',
            ].map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-dot" />
                <div className="feature-text">{f}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '24px', lineHeight: 1.6 }}>
            By signing in you agree to our{' '}
            <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Cookie banner */}
      {showCookies && (
        <div className="cookie-banner">
          <div className="cookie-text">
            We use cookies to improve your experience and analyse site usage.{' '}
            <a href="#">Learn more</a>
          </div>
          <div className="cookie-btns">
            <button className="cookie-reject" onClick={rejectCookies}>Reject all</button>
            <button className="cookie-accept" onClick={acceptCookies}>Accept cookies</button>
          </div>
        </div>
      )}
    </>
  );
}