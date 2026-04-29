import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const LIVE_STATS = [
  { label: 'Active sellers', value: '2,400+' },
  { label: 'Products imported', value: '84,000+' },
  { label: 'Total profit made', value: '$1.2M+' },
];

const TESTIMONIALS = [
  { name: 'Jessie K.', flag: '🇬🇧', text: 'Made €350 my first week. I just paste links and set prices — Onshipy does everything else.', profit: '+€350' },
  { name: 'Diego M.', flag: '🇧🇷', text: 'I was skeptical but after pushing 5 products to Shopify in 10 minutes I was sold.', profit: '+$489' },
  { name: 'Amara T.', flag: '🇳🇬', text: 'Finally a tool that actually works from Nigeria. Import, price, push. Done.', profit: '+₦280k' },
];

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    const cookies = localStorage.getItem('onshipy_cookies');
    if (!cookies) setShowCookies(true);
    if (router.query.error === 'google_failed') setError('Google sign in failed. Please try again.');

    const iv = setInterval(() => {
      setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(iv);
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
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      localStorage.setItem('onshipy_token', data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server.'); setLoading(false); }
  };

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; background: #050509; font-family: 'Sora', sans-serif; }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes gridMove { from{transform:translateY(0)} to{transform:translateY(40px)} }
        .inp {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; font-size: 14px; outline: none; color: #fff;
          font-family: 'Sora',sans-serif; transition: border-color 0.2s, background 0.2s;
        }
        .inp::placeholder { color: rgba(255,255,255,0.25); }
        .inp:focus { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.08); }
        .page { display: flex; min-height: 100vh; }
        .left { flex: 1; display: none; position: relative; overflow: hidden; padding: 48px; flex-direction: column; justify-content: space-between; }
        .right { width: 100%; display: flex; align-items: center; justify-content: center; padding: 32px 24px; }
        .form-box { width: 100%; max-width: 380px; }
        .sub-btn { width: 100%; padding: 13px; background: #fff; color: #050509; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family:'Sora',sans-serif; transition: opacity .15s, transform .15s; }
        .sub-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .sub-btn:disabled { opacity: .4; cursor: not-allowed; }
        .g-btn { width: 100%; padding: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-family:'Sora',sans-serif; transition: background .15s; }
        .g-btn:hover { background: rgba(255,255,255,0.1); }
        @media(min-width:900px){ .left{display:flex;} .right{width:420px;flex-shrink:0;padding:48px 52px;} }
        @media(max-width:480px){ .right{align-items:flex-start;padding-top:40px;} }
      `}</style>

      <div className="page">

        {/* ── LEFT ─────────────────────────────────────────────────────────── */}
        <div className="left" style={{ background: '#050509' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`,
            backgroundSize: '48px 48px', animation: 'gridMove 8s linear infinite', zIndex: 0
          }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '30%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,200,83,0.06) 0%,transparent 70%)', zIndex: 0 }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, fontSize: 22, fontWeight: 800, color: '#fff' }}>Onshipy</div>

          {/* Center content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-1px' }}>
              Sell anything.<br />
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>From anywhere.</span>
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 40, maxWidth: 360 }}>
              Import from Nike, ASOS, Amazon and 1000+ stores. Set your price. We ship to your customers automatically.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 48 }}>
              {LIVE_STATS.map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Rotating testimonial */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px 22px',
              animation: 'fadeSlide 0.5s ease', key: testimonialIdx
            }}>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 14, fontStyle: 'italic' }}>
                "{t.text}"
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{t.flag}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{t.name}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#69f0ae' }}>{t.profit}</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00c853', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>2,400+ sellers active right now</span>
          </div>
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────────────── */}
        <div className="right" style={{ background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="form-box">
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 28 }}>Onshipy</div>

            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>Welcome back</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Sign in to your account</p>
            </div>

            <button className="g-btn" onClick={() => window.location.href = `${API_BASE}/api/auth/google`} style={{ marginBottom: 20 }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>or with email</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                <input className="inp" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                  <a href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Forgot?</a>
                </div>
                <input className="inp" type="password" required placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, marginBottom: 14, fontSize: 13, color: '#f87171' }}>
                  {error}
                </div>
              )}

              <button className="sub-btn" type="submit" disabled={loading} style={{ marginTop: 12 }}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              No account?{' '}
              <Link href="/register" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Cookie banner */}
      {showCookies && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '14px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', flex: 1, minWidth: 200 }}>
            We use cookies to improve your experience.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { localStorage.setItem('onshipy_cookies','rejected'); setShowCookies(false); }}
              style={{ padding: '7px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontFamily: 'Sora,sans-serif' }}>
              Reject
            </button>
            <button onClick={() => { localStorage.setItem('onshipy_cookies','accepted'); setShowCookies(false); }}
              style={{ padding: '7px 16px', background: '#fff', border: 'none', borderRadius: 8, color: '#050509', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Sora,sans-serif' }}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}