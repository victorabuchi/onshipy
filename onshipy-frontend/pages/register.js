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
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; }
        .page { min-height: 100vh; min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 32px 20px; background: #fff; }
        .card { width: 100%; max-width: 420px; }
        .inp { width: 100%; padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 15px; outline: none; color: #111; background: #fff; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s; }
        .inp:focus { border-color: #1a1a2e; box-shadow: 0 0 0 3px rgba(26,26,46,0.06); }
        .lbl { display: block; font-size: 13px; font-weight: 500; color: #111; margin-bottom: 6px; }
        .btn { width: 100%; padding: 13px; background: #1a1a1a; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .btn:hover { opacity: 0.88; }
        .btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @media (max-width: 480px) { .page { align-items: flex-start; padding-top: 48px; } }
      `}</style>

      <div className="page">
        <div className="card">
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#111', letterSpacing: '-0.5px', marginBottom: '6px' }}>Onshipy</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>Create your account</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>Start selling anything from anywhere — free</div>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Full name', key: 'full_name', type: 'text', placeholder: 'Victor Abuchi' },
              { label: 'Store name', key: 'store_name', type: 'text', placeholder: 'My Awesome Store' },
              { label: 'Email address', key: 'email', type: 'email', placeholder: 'victor@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Minimum 8 characters' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '14px' }}>
                <label className="lbl">{f.label}</label>
                <input className="inp" type={f.type} required value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
              </div>
            ))}

            {error && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '14px', fontSize: '14px', color: '#dc2626' }}>{error}</div>
            )}

            <button className="btn" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#00a47c', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </p>

          <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
            By creating an account you agree to our{' '}
            <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Terms</a>{' '}and{' '}
            <a href="#" style={{ color: '#6b7280', textDecoration: 'underline' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </>
  );
}