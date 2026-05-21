import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const DIAL_CODES = [
  { code:'US', dial:'+1',   label:'US +1'   },
  { code:'GB', dial:'+44',  label:'GB +44'  },
  { code:'NG', dial:'+234', label:'NG +234' },
  { code:'GH', dial:'+233', label:'GH +233' },
  { code:'CA', dial:'+1',   label:'CA +1'   },
  { code:'ZA', dial:'+27',  label:'ZA +27'  },
  { code:'AU', dial:'+61',  label:'AU +61'  },
  { code:'DE', dial:'+49',  label:'DE +49'  },
  { code:'FR', dial:'+33',  label:'FR +33'  },
  { code:'IN', dial:'+91',  label:'IN +91'  },
  { code:'JP', dial:'+81',  label:'JP +81'  },
  { code:'BR', dial:'+55',  label:'BR +55'  },
  { code:'AE', dial:'+971', label:'AE +971' },
];

function EyeIcon({ open }) {
  return open
    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

export default function Register() {
  const router = useRouter();
  const [form, setForm]       = useState({ full_name:'', email:'', password:'', confirm:'', phone:'' });
  const [dial, setDial]       = useState(DIAL_CODES[0]);
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service and Privacy Policy.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:  form.full_name,
          email:      form.email,
          password:   form.password,
          store_name: form.full_name ? form.full_name + "'s Store" : 'My Store',
          phone:      dial.dial + form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      localStorage.setItem('onshipy_token',  data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server.'); setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Create account — Onshipy</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { width:100%; min-height:100vh; background:#f5f5f5; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }

        @keyframes spin { to { transform:rotate(360deg); } }

        .rg-page { min-height:100vh; background:#f5f5f5; display:flex; flex-direction:column; }

        /* ── Top bar ── */
        .rg-nav { height:58px; background:#fff; border-bottom:1px solid #e8e8e8; display:flex; align-items:center; justify-content:space-between; padding:0 32px; flex-shrink:0; }
        .rg-logo { display:flex; align-items:center; gap:8px; text-decoration:none; }
        .rg-logo-text { font-size:18px; font-weight:800; color:#1a1a1a; letter-spacing:-0.4px; }
        .rg-nav-links { display:flex; align-items:center; gap:4px; }
        .rg-nav-link { padding:6px 12px; font-size:13px; font-weight:500; color:#555; text-decoration:none; border-radius:7px; transition:color .15s, background .15s; }
        .rg-nav-link:hover { color:#1a1a1a; background:#f5f5f5; }
        .rg-nav-btns { display:flex; align-items:center; gap:8px; }
        .rg-signin-btn { padding:7px 16px; font-size:13px; font-weight:600; color:#333; background:none; border:1.5px solid #ddd; border-radius:8px; cursor:pointer; font-family:inherit; text-decoration:none; transition:border-color .15s; }
        .rg-signin-btn:hover { border-color:#aaa; }
        .rg-free-btn { padding:8px 18px; font-size:13px; font-weight:700; color:#fff; background:#1a1a1a; border:none; border-radius:24px; cursor:pointer; font-family:inherit; text-decoration:none; transition:opacity .15s; }
        .rg-free-btn:hover { opacity:.85; }

        /* ── Body ── */
        .rg-body { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:32px 16px 48px; }
        .rg-card { background:#fff; border-radius:16px; border:1px solid #e8e8e8; padding:36px 36px 40px; width:100%; max-width:460px; box-shadow:0 2px 16px rgba(0,0,0,0.05); }

        .rg-heading { font-size:24px; font-weight:800; color:#1a1a1a; letter-spacing:-0.5px; margin-bottom:4px; }
        .rg-subhead { font-size:13px; color:#888; margin-bottom:24px; }

        .g-btn { width:100%; padding:10px 16px; background:#fff; border:1.5px solid #ddd; border-radius:10px; color:#333; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-family:inherit; transition:border-color .15s, box-shadow .15s; margin-bottom:16px; }
        .g-btn:hover { border-color:#bbb; box-shadow:0 1px 4px rgba(0,0,0,0.07); }

        .divider { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .divider-line { flex:1; height:1px; background:#ebebeb; }
        .divider-text { font-size:11px; color:#aaa; }

        .sec { font-size:9px; font-weight:700; color:#aaa; text-transform:uppercase; letter-spacing:.1em; margin:16px 0 10px; display:flex; align-items:center; gap:8px; }
        .sec::after { content:''; flex:1; height:1px; background:#ebebeb; }

        .field { margin-bottom:10px; }
        .lbl   { font-size:11px; font-weight:500; color:#666; margin-bottom:4px; display:block; }
        .inp   { width:100%; padding:9px 12px; background:#fafafa; border:1.5px solid #e5e5e5; border-radius:9px; font-size:13px; color:#1a1a1a; font-family:inherit; outline:none; transition:border-color .2s, box-shadow .2s; }
        .inp::placeholder { color:#c0c0c0; }
        .inp:focus { border-color:#008060; box-shadow:0 0 0 3px rgba(0,128,96,0.1); background:#fff; }
        .inp-note { font-size:10px; color:#bbb; margin-top:3px; }

        .phone-row { display:flex; gap:6px; }
        .cc-sel    { padding:9px 8px; background:#fafafa; border:1.5px solid #e5e5e5; border-radius:9px; font-size:12px; color:#333; font-family:inherit; outline:none; cursor:pointer; flex-shrink:0; width:94px; appearance:none; -webkit-appearance:none; transition:border-color .2s; }
        .cc-sel:focus { border-color:#008060; box-shadow:0 0 0 3px rgba(0,128,96,0.1); }

        .pw-wrap      { position:relative; }
        .pw-wrap .inp { padding-right:40px; }
        .pw-eye       { position:absolute; right:11px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#bbb; display:flex; padding:3px; transition:color .15s; }
        .pw-eye:hover { color:#666; }

        .check-row  { display:flex; align-items:flex-start; gap:9px; margin:14px 0; }
        .check-box  { width:16px; height:16px; border-radius:4px; border:1.5px solid #ddd; background:#fafafa; cursor:pointer; flex-shrink:0; margin-top:1px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .check-box.on { background:#1a1a1a; border-color:#1a1a1a; }
        .check-label { font-size:11px; color:#888; line-height:1.55; }
        .check-label a { color:#008060; text-decoration:none; font-weight:500; }
        .check-label a:hover { text-decoration:underline; }

        .cta-btn { width:100%; padding:11px; background:#1a1a1a; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:7px; transition:opacity .15s, transform .15s; margin-top:4px; }
        .cta-btn:hover:not(:disabled) { opacity:.87; transform:translateY(-1px); }
        .cta-btn:disabled { opacity:.35; cursor:not-allowed; transform:none; }

        .err-box { padding:9px 12px; background:#fef2f2; border:1px solid #fecaca; border-radius:8px; margin-bottom:12px; font-size:12px; color:#c0392b; }

        @media (max-width:540px) {
          .rg-nav-links { display:none; }
          .rg-card { padding:24px 20px 28px; border-radius:12px; }
          .rg-heading { font-size:20px; }
        }
      `}</style>

      <div className="rg-page">

        {/* Top navigation */}
        <nav className="rg-nav">
          <Link href="/" className="rg-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#008060" strokeWidth="2" strokeLinejoin="round" fill="rgba(0,128,96,0.1)"/>
              <polyline points="3 7 12 12 21 7" stroke="#008060" strokeWidth="2" strokeLinejoin="round"/>
              <line x1="12" y1="22" x2="12" y2="12" stroke="#008060" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="rg-logo-text">Onshipy</span>
          </Link>

          <div className="rg-nav-links">
            {['Why Onshipy','Products','Pricing','Enterprise'].map(l => (
              <a key={l} href="#" className="rg-nav-link">{l}</a>
            ))}
          </div>

          <div className="rg-nav-btns">
            <Link href="/login" className="rg-signin-btn">Log in</Link>
            <Link href="/sign-up" className="rg-free-btn">Start for free</Link>
          </div>
        </nav>

        {/* Form body */}
        <div className="rg-body">
          <div className="rg-card">
            <h1 className="rg-heading">Create your account</h1>
            <p className="rg-subhead">Free plan. No credit card required.</p>

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
              <div className="sec">Account</div>

              <div className="field">
                <label className="lbl">Full name</label>
                <input className="inp" required placeholder="Your full name" value={form.full_name} onChange={e => setForm({...form, full_name:e.target.value})} />
              </div>

              <div className="field">
                <label className="lbl">Email address</label>
                <input className="inp" type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
                <div className="inp-note">OTP verification will be sent to this address</div>
              </div>

              <div className="sec">Phone</div>

              <div className="field">
                <label className="lbl">Phone number</label>
                <div className="phone-row">
                  <select className="cc-sel" value={dial.code} onChange={e => setDial(DIAL_CODES.find(c => c.code === e.target.value) || DIAL_CODES[0])}>
                    {DIAL_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input className="inp" type="tel" placeholder="8012345678" value={form.phone} style={{ flex:1 }} onChange={e => setForm({...form, phone:e.target.value.replace(/\D/g,'')})} />
                </div>
                <div className="inp-note">Required for payment verification</div>
              </div>

              <div className="sec">Security</div>

              <div className="field">
                <label className="lbl">Password</label>
                <div className="pw-wrap">
                  <input className="inp" type={showPw?'text':'password'} required minLength={8} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
                  <button type="button" className="pw-eye" onClick={() => setShowPw(v=>!v)}><EyeIcon open={showPw}/></button>
                </div>
              </div>

              <div className="field">
                <label className="lbl">Confirm password</label>
                <div className="pw-wrap">
                  <input className="inp" type={showCf?'text':'password'} required placeholder="Repeat password" value={form.confirm} onChange={e => setForm({...form, confirm:e.target.value})} />
                  <button type="button" className="pw-eye" onClick={() => setShowCf(v=>!v)}><EyeIcon open={showCf}/></button>
                </div>
              </div>

              <div className="check-row">
                <div className={`check-box${agreed?' on':''}`} onClick={() => setAgreed(v=>!v)}>
                  {agreed && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="check-label">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </div>

              {error && <div className="err-box">{error}</div>}

              <button className="cta-btn" type="submit" disabled={loading}>
                {loading
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg> Creating account…</>
                  : 'Create account'
                }
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'#999' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color:'#008060', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
