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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '480px', flexShrink: 0, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px', borderRight: '1px solid #e1e3e5' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.5px', marginBottom: '8px' }}>Onshipy</div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 6px 0' }}>Sign in to your account</h1>
          <p style={{ color: '#6d7175', fontSize: '14px', margin: 0 }}>Welcome back</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px', color: '#1a1a1a' }}>Email address</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="yourname@example.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>Password</label>
              <a href="#" style={{ fontSize: '13px', color: '#008060', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" style={{ width: '100%', padding: '10px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ padding: '10px 14px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#cc0000' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: loading ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6d7175' }}>
          Don't have an account?{' '}<Link href="/register" style={{ color: '#008060', fontWeight: '500', textDecoration: 'none' }}>Create one free</Link>
        </p>
      </div>
      <div style={{ flex: 1, background: '#1a1a2e', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
        <div style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: '800', color: '#fff', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>Sell anything.<br />From anywhere.</div>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', marginBottom: '40px' }}>Import products from any website, set your price, and start selling. Onshipy handles purchasing, shipping, and tracking automatically.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left' }}>
            {[
              { title: 'Import any product', desc: 'Paste a URL from Nike, Amazon, ASOS and more' },
              { title: 'Auto-purchase', desc: 'We buy and ship directly to your customers' },
              { title: 'Set your price', desc: 'Full control over your margins and profits' },
              { title: 'Any platform', desc: 'Works with Shopify, WooCommerce and more' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#fff', marginBottom: '4px' }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}