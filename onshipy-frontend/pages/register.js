import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', store_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      localStorage.setItem('onshipy_token', data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '480px', flexShrink: 0, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px', borderRight: '1px solid #e1e3e5' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', letterSpacing: '-0.5px', marginBottom: '8px' }}>Onshipy</div>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 6px 0' }}>Create your account</h1>
          <p style={{ color: '#6d7175', fontSize: '14px', margin: 0 }}>Start selling anything from anywhere</p>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full name', key: 'full_name', type: 'text', placeholder: 'John Doe' },
            { label: 'Store name', key: 'store_name', type: 'text', placeholder: 'My Awesome Store' },
            { label: 'Email address', key: 'email', type: 'email', placeholder: 'john@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px', color: '#1a1a1a' }}>{f.label}</label>
              <input type={f.type} required value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' }} />
            </div>
          ))}
          {error && <div style={{ padding: '10px 14px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#cc0000' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', background: loading ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Creating account...' : 'Create free account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6d7175' }}>
          Already have an account?{' '}<Link href="/login" style={{ color: '#008060', fontWeight: '500', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
      <div style={{ flex: 1, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', fontWeight: '800', color: '#fff', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.5px' }}>The smartest way to resell online</div>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7' }}>Join thousands of sellers who use Onshipy to import and resell products from any website without holding any inventory.</p>
        </div>
      </div>
    </div>
  );
}