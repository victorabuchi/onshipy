import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const features = [
    { title: 'Import any product', desc: 'Paste a URL from Nike, Amazon, ASOS and more' },
    { title: 'Auto-purchase', desc: 'We buy and ship directly to your customers' },
    { title: 'Set your price', desc: 'Full control over your margins and profits' },
    { title: 'Any platform', desc: 'Works with Shopify, WooCommerce and more' },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        /* Hero section — dark background with text */
        .login-hero {
          background: #1a1a2e;
          padding: 48px 24px 40px;
          text-align: center;
        }

        .login-hero-logo {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 24px;
        }

        .login-hero-headline {
          font-size: 32px;
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -0.5px;
          margin-bottom: 14px;
        }

        .login-hero-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.6);
          line-height: 1.65;
          max-width: 480px;
          margin: 0 auto 28px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          max-width: 480px;
          margin: 0 auto;
          text-align: left;
        }

        .feature-card {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px;
        }

        .feature-card-title {
          font-weight: 600;
          font-size: 13px;
          color: #fff;
          margin-bottom: 4px;
        }

        .feature-card-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
        }

        /* Form section */
        .login-form-wrap {
          flex: 1;
          padding: 36px 24px 40px;
          max-width: 440px;
          width: 100%;
          margin: 0 auto;
        }

        .login-form-title {
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin-bottom: 4px;
        }

        .login-form-sub {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
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
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          outline: none;
          color: #111;
          background: #fff;
          transition: border-color 0.15s;
        }

        .form-input:focus { border-color: #1a1a2e; }

        .btn-primary {
          width: 100%;
          padding: 13px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Desktop: side by side */
        @media (min-width: 768px) {
          .login-page {
            flex-direction: row;
          }

          .login-hero {
            width: 50%;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px 48px;
            text-align: left;
            min-height: 100vh;
          }

          .login-hero-logo { margin-bottom: 40px; }
          .login-hero-headline { font-size: 42px; }
          .login-hero-sub { margin-left: 0; }
          .feature-grid { margin-left: 0; }

          .login-form-wrap {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px 56px;
            max-width: none;
          }

          .login-form-inner {
            max-width: 400px;
          }
        }

        @media (min-width: 1200px) {
          .login-hero { width: 55%; }
          .login-hero-headline { font-size: 52px; }
        }
      `}</style>

      <div className="login-page">

        {/* Hero */}
        <div className="login-hero">
          <div className="login-hero-logo">Onshipy</div>
          <h1 className="login-hero-headline">Sell anything.<br />From anywhere.</h1>
          <p className="login-hero-sub">
            Import products from any website, set your price, and start selling. Onshipy handles purchasing, shipping, and tracking automatically.
          </p>
          <div className="feature-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-card-title">{f.title}</div>
                <div className="feature-card-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="login-form-wrap">
          <div className="login-form-inner">
            <div className="login-form-title">Sign in to your account</div>
            <div className="login-form-sub">Welcome back</div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
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

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <a href="#" style={{ fontSize: '13px', color: '#00a47c', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</a>
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
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: '#00a47c', fontWeight: '600', textDecoration: 'none' }}>Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}