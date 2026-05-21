import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function EyeIcon({ open }) {
  return open
    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

export default function Login() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (router.query.error === 'google_failed') setError('Google sign in failed. Try again.');
  }, [router.query]);

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      localStorage.setItem('onshipy_token',  data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server.'); setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Sign in — Onshipy</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { width:100%; min-height:100vh; background:#fff; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }

        @keyframes spin { to { transform:rotate(360deg); } }

        .lg-page { min-height:100vh; background:#fff; display:flex; flex-direction:column; }

        /* ── Top bar ── */
        .lg-nav { height:58px; background:#fff; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; justify-content:space-between; padding:0 32px; flex-shrink:0; }
        .lg-logo { display:flex; align-items:center; gap:8px; text-decoration:none; }
        .lg-logo-text { font-size:18px; font-weight:800; color:#1a1a1a; letter-spacing:-0.4px; }
        .lg-nav-links { display:flex; align-items:center; gap:4px; }
        .lg-nav-link { padding:6px 12px; font-size:13px; font-weight:500; color:#555; text-decoration:none; border-radius:7px; transition:color .15s, background .15s; }
        .lg-nav-link:hover { color:#1a1a1a; background:#f5f5f5; }
        .lg-nav-btns { display:flex; align-items:center; gap:8px; }
        .lg-reg-btn { padding:7px 16px; font-size:13px; font-weight:600; color:#333; background:none; border:1.5px solid #ddd; border-radius:8px; cursor:pointer; font-family:inherit; text-decoration:none; transition:border-color .15s; }
        .lg-reg-btn:hover { border-color:#aaa; }
        .lg-free-btn { padding:8px 18px; font-size:13px; font-weight:700; color:#fff; background:#008060; border:none; border-radius:24px; cursor:pointer; font-family:inherit; text-decoration:none; transition:opacity .15s; }
        .lg-free-btn:hover { opacity:.88; }

        /* ── Body ── */
        .lg-body  { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 16px 60px; }
        .lg-inner { width:100%; max-width:400px; }

        .lg-icon { width:44px; height:44px; border-radius:12px; background:#f0faf6; border:1px solid #c3e6d8; display:flex; align-items:center; justify-content:center; margin-bottom:18px; }
        .lg-heading { font-size:26px; font-weight:800; color:#1a1a1a; letter-spacing:-0.6px; margin-bottom:4px; }
        .lg-subhead { font-size:13px; color:#999; margin-bottom:28px; }

        .g-btn { width:100%; padding:11px 16px; background:#fff; border:1.5px solid #e0e0e0; border-radius:10px; color:#333; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-family:inherit; transition:border-color .15s, box-shadow .15s; margin-bottom:18px; }
        .g-btn:hover { border-color:#bbb; box-shadow:0 1px 4px rgba(0,0,0,0.06); }

        .divider { display:flex; align-items:center; gap:10px; margin-bottom:18px; }
        .divider-line { flex:1; height:1px; background:#f0f0f0; }
        .divider-text { font-size:11px; color:#ccc; }

        .field { margin-bottom:14px; }
        .lbl-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; }
        .lbl     { font-size:12px; font-weight:500; color:#555; }
        .lbl-link { font-size:12px; color:#008060; font-weight:500; text-decoration:none; }
        .lbl-link:hover { text-decoration:underline; }
        .inp { width:100%; padding:10px 13px; background:#fafafa; border:1.5px solid #ebebeb; border-radius:10px; font-size:14px; color:#1a1a1a; font-family:inherit; outline:none; transition:border-color .2s, box-shadow .2s; }
        .inp::placeholder { color:#c8c8c8; }
        .inp:focus { border-color:#008060; box-shadow:0 0 0 3px rgba(0,128,96,0.08); background:#fff; }

        .pw-wrap      { position:relative; }
        .pw-wrap .inp { padding-right:42px; }
        .pw-eye       { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#ccc; display:flex; padding:3px; transition:color .15s; }
        .pw-eye:hover { color:#666; }

        .cta-btn { width:100%; padding:12px; background:#008060; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:7px; transition:opacity .15s, transform .15s; margin-top:4px; }
        .cta-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
        .cta-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

        .err-box { padding:10px 13px; background:#fef2f2; border:1px solid #fecaca; border-radius:9px; margin-bottom:14px; font-size:12px; color:#c0392b; }

        .divider-or { display:flex; align-items:center; gap:10px; margin:20px 0; }
        .divider-or div { flex:1; height:1px; background:#f0f0f0; }
        .divider-or span { font-size:11px; color:#ccc; }

        @media (max-width:540px) {
          .lg-nav-links { display:none; }
          .lg-heading { font-size:22px; }
        }
      `}</style>

      <div className="lg-page">

        {/* Top navigation */}
        <nav className="lg-nav">
          <Link href="/" className="lg-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#008060" strokeWidth="2" strokeLinejoin="round" fill="rgba(0,128,96,0.1)"/>
              <polyline points="3 7 12 12 21 7" stroke="#008060" strokeWidth="2" strokeLinejoin="round"/>
              <line x1="12" y1="22" x2="12" y2="12" stroke="#008060" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="lg-logo-text">Onshipy</span>
          </Link>

          <div className="lg-nav-links">
            {['Why Onshipy','Products','Pricing','Enterprise'].map(l => (
              <a key={l} href="#" className="lg-nav-link">{l}</a>
            ))}
          </div>

          <div className="lg-nav-btns">
            <Link href="/register" className="lg-reg-btn">Create account</Link>
            <Link href="/sign-up" className="lg-free-btn">Start for free</Link>
          </div>
        </nav>

        {/* Form */}
        <div className="lg-body">
          <div className="lg-inner">

            <div className="lg-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#008060" strokeWidth="2" strokeLinejoin="round" fill="rgba(0,128,96,0.15)"/>
                <polyline points="3 7 12 12 21 7" stroke="#008060" strokeWidth="2" strokeLinejoin="round"/>
                <line x1="12" y1="22" x2="12" y2="12" stroke="#008060" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 className="lg-heading">Welcome back</h1>
            <p className="lg-subhead">Sign in to your Onshipy account</p>

            <button className="g-btn" onClick={() => window.location.href = `${API_BASE}/api/auth/google`}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">
              <div className="divider-line"/><span className="divider-text">or with email</span><div className="divider-line"/>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="lbl">Email address</label>
                <input className="inp" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
              </div>

              <div className="field">
                <div className="lbl-row">
                  <label className="lbl">Password</label>
                  <a href="#" className="lbl-link">Forgot password?</a>
                </div>
                <div className="pw-wrap">
                  <input className="inp" type={showPw?'text':'password'} required placeholder="Enter your password"
                    value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
                  <button type="button" className="pw-eye" onClick={() => setShowPw(v=>!v)}><EyeIcon open={showPw}/></button>
                </div>
              </div>

              {error && <div className="err-box">{error}</div>}

              <button className="cta-btn" type="submit" disabled={loading}>
                {loading
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg> Signing in…</>
                  : 'Sign in'
                }
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#aaa' }}>
              No account yet?{' '}
              <Link href="/register" style={{ color:'#008060', fontWeight:600, textDecoration:'none' }}>Create one free</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  );
}
