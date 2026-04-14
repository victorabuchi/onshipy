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
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .login-wrap { display: flex; min-height: 100vh; min-height: 100dvh; width: 100%; }
        .login-left { width: 100%; max-width: 480px; background: #fff; display: flex; flex-direction: column; justify-content: center; padding: 48px 40px; }
        .login-right { flex: 1; background: #1a1a2e; display: flex; align-items: center; justify-content: center; padding: 48px 40px; }
        .login-right-inner { max-width: 400px; width: 100%; text-align: center; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 32px; text-align: left; }
        .feature-card { background: rgba(255,255,255,0.07); border-radius: 10px; padding: 14px; }
        @media (max-width: 767px) {
          .login-wrap { flex-direction: column; }
          .login-left { max-width: 100%; padding: 40px 24px; justify-content: flex-start; padding-top: 60px; }
          .login-right { display: none; }
        }
      `}</style>
      <div className="login-wrap">
        <div className="login-left">
          <div style={{ marginBottom: '36px' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.5px', marginBottom: '8px' }}>Onshipy</div>
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px' }}>Sign in to your account</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Welcome back</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#111' }}>Email address</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="yourname@example.com" style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', color: '#111' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>Password</label>
                <a href="#" style={{ fontSize: '13px', color: '#00a47c', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" style={{ width: '100%', padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
            </div>
            {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#dc2626' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#9ca3af' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}<Link href="/register" style={{ color: '#00a47c', fontWeight: '500', textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>
        <div className="login-right">
          <div className="login-right-inner">
            <div style={{ fontSize: '40px', fontWeight: '800', color: '#fff', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '16px' }}>Sell anything.<br />From anywhere.</div>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>Import products from any website, set your price, and start selling. Onshipy handles purchasing, shipping, and tracking automatically.</p>
            <div className="feature-grid">
              {[
                { title: 'Import any product', desc: 'Paste a URL from Nike, Amazon, ASOS and more' },
                { title: 'Auto-purchase', desc: 'We buy and ship directly to your customers' },
                { title: 'Set your price', desc: 'Full control over your margins and profits' },
                { title: 'Any platform', desc: 'Works with Shopify, WooCommerce and more' },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#fff', marginBottom: '4px' }}>{f.title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}