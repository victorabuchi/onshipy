import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    const cookies = localStorage.getItem('onshipy_cookies');
    if (!cookies) setShowCookies(true);
    if (router.query.error === 'google_failed') {
      setError('Google sign in failed. Please try again or use email.');
    }
  }, [router.query]);

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
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  const handleGoogle = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

        .page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          background: #fff;
        }

        /* Left panel — full image/video background on desktop */
        .left-panel {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: none;
          background: #1a1a2e;
        }

        .left-panel-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, #0d2b1e 100%);
        }

        /* Grid pattern overlay */
        .left-panel-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
         
        .left-panel-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
        }

        .left-headline {
          font-size: 52px;
          font-weight: 900;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        .left-headline span { color: #00a47c; }

        .left-sub {
          font-size: 16px;
          color: rgba(255,255,255,0.5);
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 48px;
        }

        .stats-row {
          display: flex;
          gap: 32px;
        }

        .stat-item {}
        .stat-num { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .stat-lbl { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Floating product card */
        .product-card {
          position: absolute;
          bottom: 60px;
          right: 40px;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 16px 20px;
          width: 260px;
        }

        .product-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .product-thumb {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justifyContent: center;
          font-size: 20px;
        }

        .product-card-label { font-size: 11px; color: rgba(255,255,255,0.4); }
        .product-card-title { font-size: 13px; color: #fff; fontWeight: 500; }
        .product-card-prices { display: flex; justify-content: space-between; align-items: center; }
        .product-card-cost { font-size: 12px; color: rgba(255,255,255,0.4); }
        .product-card-profit { font-size: 13px; font-weight: 700; color: #00a47c; }

        /* Right panel — the form */
        .right-panel {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px 80px;
          background: #fff;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
        }

        .logo { font-size: 22px; font-weight: 800; color: #111; letter-spacing: -0.5px; margin-bottom: 28px; }

        .social-btn {
          width: 100%;
          padding: 12px 16px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #111;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: inherit;
          margin-bottom: 10px;
          transition: background 0.1s, border-color 0.1s;
        }

        .social-btn:hover { background: #f9fafb; border-color: #d1d5db; }

        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: #f3f4f6; }
        .divider-text { font-size: 12px; color: #9ca3af; white-space: nowrap; }

        .lbl { display: block; font-size: 13px; font-weight: 500; color: #111; margin-bottom: 6px; }

        .inp {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          outline: none;
          color: #111;
          background: #fff;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .inp:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }

        .btn {
          width: 100%;
          padding: 13px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity 0.15s;
        }

        .btn:hover { opacity: 0.85; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Cookie banner */
        .cookie {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #111;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          z-index: 9999;
          flex-wrap: wrap;
        }

        .cookie p { font-size: 13px; color: rgba(255,255,255,0.7); flex: 1; min-width: 180px; line-height: 1.5; }
        .cookie p a { color: #00a47c; }
        .cookie-btns { display: flex; gap: 8px; }
        .c-accept { padding: 8px 18px; background: #00a47c; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .c-reject { padding: 8px 18px; background: transparent; color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-size: 13px; cursor: pointer; font-family: inherit; }

        @media (min-width: 900px) {
          .left-panel { display: flex; flex-direction: column; }
          .right-panel { width: 480px; flex-shrink: 0; padding: 40px 56px; }
        }

        @media (max-width: 480px) {
          .right-panel { padding: 40px 20px 80px; align-items: flex-start; }
          .cookie { flex-direction: column; align-items: flex-start; }
          .cookie-btns { width: 100%; }
          .c-accept, .c-reject { flex: 1; text-align: center; }
        }
      `}</style>

      <div className="page">

        {/* Left visual panel — desktop only */}
        <div className="left-panel">
          <div className="left-panel-bg" />
          <div className="left-panel-grid" />
          <div className="left-panel-content">
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#00a47c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
              Onshipy Platform
            </div>
            <h1 className="left-headline">
              Sell <span>anything</span>.<br />
              From anywhere.
            </h1>
            <p className="left-sub">
              Import products from any website, set your price, and start selling. We handle purchasing, shipping, and tracking automatically.
            </p>

            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-num">10K+</div>
                <div className="stat-lbl">Products imported</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">500+</div>
                <div className="stat-lbl">Active sellers</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">50+</div>
                <div className="stat-lbl">Source websites</div>
              </div>
            </div>
          </div>

          {/* Floating product card */}
          <div className="product-card">
            <div className="product-card-top">
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>👟</div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Just imported</div>
                <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>Nike Air Max 270</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Source price</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>$120.00</div>
              </div>
              <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Selling price</div>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>$165.00</div>
              </div>
              <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Profit</div>
                <div style={{ fontSize: '14px', color: '#00a47c', fontWeight: '700' }}>+$45</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="right-panel">
          <div className="form-card">
            <div className="logo">Onshipy</div>

            <div style={{ fontSize: '22px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>
              Sign in
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              Welcome back
            </div>

            {/* Google */}
            <button className="social-btn" onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or continue with email</span>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="lbl">Email</label>
                <input className="inp" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="yourname@example.com" />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="lbl" style={{ marginBottom: 0 }}>Password</label>
                  <a href="#" style={{ fontSize: '13px', color: '#00a47c', textDecoration: 'none', fontWeight: '500' }}>Forgot?</a>
                </div>
                <input className="inp" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '14px', fontSize: '14px', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: '#6b7280' }}>
              No account?{' '}
              <Link href="/register" style={{ color: '#00a47c', fontWeight: '600', textDecoration: 'none' }}>Create one free</Link>
            </p>

            <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
              By signing in you agree to our{' '}
              <a href="#" style={{ color: '#9ca3af' }}>Terms</a> and{' '}
              <a href="#" style={{ color: '#9ca3af' }}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Cookie banner */}
      {showCookies && (
        <div className="cookie">
          <p>
            We use cookies to improve your experience.{' '}
            <a href="#">Learn more</a>
          </p>
          <div className="cookie-btns">
            <button className="c-reject" onClick={() => { localStorage.setItem('onshipy_cookies', 'rejected'); setShowCookies(false); }}>Reject all</button>
            <button className="c-accept" onClick={() => { localStorage.setItem('onshipy_cookies', 'accepted'); setShowCookies(false); }}>Accept cookies</button>
          </div>
        </div>
      )}
    </>
  );
}