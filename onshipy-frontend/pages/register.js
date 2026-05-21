import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const DIAL_CODES = [
  { code:'US', dial:'+1',   label:'US +1'   },
  { code:'GB', dial:'+44',  label:'GB +44'  },
  { code:'CA', dial:'+1',   label:'CA +1'   },
  { code:'NG', dial:'+234', label:'NG +234' },
  { code:'GH', dial:'+233', label:'GH +233' },
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

  useEffect(() => {
    const token = localStorage.getItem('onshipy_token');
    if (token) { router.replace('/dashboard'); }
  }, []);

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service and Privacy Policy'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name:form.full_name, email:form.email, password:form.password, phone:dial.dial+form.phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      localStorage.setItem('onshipy_token',  data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server.'); setLoading(false); }
  };

  const green = '#008060';
  const bd    = 'rgba(210,210,210,1)';
  const text  = 'rgba(48,48,48,1)';
  const sub   = 'rgba(100,100,100,1)';

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
        html, body { width:100%; min-height:100vh; background:#1a1a1a; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }

        .page { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:40px 16px 60px; }

        .logo-link { display:flex; align-items:center; gap:9px; text-decoration:none; margin-bottom:28px; }
        .logo-link span { font-size:20px; font-weight:800; color:#fff; letter-spacing:-0.4px; }

        .card { background:#fff; border-radius:14px; box-shadow:0 8px 48px rgba(0,0,0,0.5); width:100%; max-width:420px; padding:32px 36px 28px; }

        .card-title { font-size:22px; font-weight:800; color:${text}; letter-spacing:-0.5px; margin-bottom:4px; }
        .card-sub { font-size:13px; color:${sub}; margin-bottom:22px; }

        .g-btn { width:100%; height:44px; border:1px solid ${bd}; border-radius:9px; background:#fff; display:flex; align-items:center; justify-content:center; gap:10px; font-size:14px; font-weight:600; color:${text}; cursor:pointer; transition:background .15s; margin-bottom:18px; font-family:inherit; }
        .g-btn:hover { background:#f7f7f7; }

        .divider { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .divider-line { flex:1; height:1px; background:${bd}; }
        .divider-text { font-size:12px; color:${sub}; white-space:nowrap; }

        .sec { font-size:10px; font-weight:700; color:${sub}; letter-spacing:.07em; text-transform:uppercase; padding:10px 0 8px; border-top:1px solid ${bd}; margin-bottom:10px; }
        .sec:first-of-type { border-top:none; padding-top:0; }

        .field { margin-bottom:11px; }
        .label { font-size:12px; font-weight:600; color:${text}; display:block; margin-bottom:4px; }
        .inp-note { font-size:11px; color:${sub}; margin-top:3px; }

        .inp-wrap { position:relative; }
        .inp { width:100%; height:40px; border:1px solid ${bd}; border-radius:8px; padding:0 12px; font-size:14px; color:${text}; background:#fff; outline:none; font-family:inherit; transition:border-color .15s; }
        .inp:focus { border-color:${green}; box-shadow:0 0 0 3px rgba(0,128,96,0.1); }
        .inp::placeholder { color:rgba(160,160,160,0.8); }
        .eye-btn { position:absolute; right:10px; top:50%; transform:translateY(-50%); border:none; background:none; cursor:pointer; color:${sub}; display:flex; padding:2px; }

        .phone-row { display:flex; gap:8px; }
        .dial-sel { height:40px; border:1px solid ${bd}; border-radius:8px; padding:0 8px; font-size:13px; color:${text}; background:#fff; outline:none; font-family:inherit; cursor:pointer; flex-shrink:0; }
        .dial-sel:focus { border-color:${green}; }

        .check-row { display:flex; align-items:flex-start; gap:9px; margin:14px 0 16px; }
        .check-row input { width:15px; height:15px; margin-top:2px; accent-color:${green}; cursor:pointer; flex-shrink:0; }
        .check-label { font-size:12px; color:${sub}; line-height:1.5; }
        .check-label a { color:${green}; text-decoration:none; }
        .check-label a:hover { text-decoration:underline; }

        .submit-btn { width:100%; height:44px; background:#1a1a1a; color:#fff; border:none; border-radius:9px; font-size:15px; font-weight:700; cursor:pointer; transition:opacity .15s; display:flex; align-items:center; justify-content:center; gap:8px; font-family:inherit; }
        .submit-btn:hover:not(:disabled) { opacity:.88; }
        .submit-btn:disabled { opacity:.55; cursor:not-allowed; }

        .err-box { background:#fff5f5; border:1px solid #fecaca; border-radius:8px; padding:10px 12px; font-size:13px; color:#b91c1c; margin-bottom:12px; }

        .bottom-link { text-align:center; margin-top:16px; font-size:13px; color:${sub}; }
        .note-line { text-align:center; margin-top:10px; font-size:11px; color:rgba(120,120,120,0.7); }

        .page-foot { margin-top:32px; text-align:center; font-size:11px; color:rgba(255,255,255,0.2); line-height:1.7; }
        .page-foot a { color:rgba(255,255,255,0.35); text-decoration:none; }
        .page-foot a:hover { text-decoration:underline; }

        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="page">
        <Link href="/" className="logo-link">
          <img src="/favicon-32x32.png" alt="Onshipy" width={28} height={28} style={{ filter:'brightness(0) invert(1)' }} />
          <span>Onshipy</span>
        </Link>

        <div className="card">
          <h1 className="card-title">Start for free</h1>
          <p className="card-sub">No credit card required</p>

          <button className="g-btn" onClick={() => window.location.href = `${API_BASE}/api/auth/google`}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or with email</span>
            <div className="divider-line" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="sec">Account</div>

            <div className="field">
              <label className="label">Full name</label>
              <input className="inp" type="text" placeholder="Your full name" value={form.full_name} onChange={e => setForm({...form,full_name:e.target.value})} required />
            </div>
            <div className="field">
              <label className="label">Email address</label>
              <input className="inp" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} required />
              <div className="inp-note">OTP verification will be sent to this address</div>
            </div>

            <div className="sec">Phone</div>

            <div className="field">
              <label className="label">Phone number</label>
              <div className="phone-row">
                <select className="dial-sel" value={dial.code} onChange={e => setDial(DIAL_CODES.find(d => d.code===e.target.value))}>
                  {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
                </select>
                <input className="inp" type="tel" placeholder="8012345678" value={form.phone} style={{ flex:1 }} onChange={e => setForm({...form,phone:e.target.value.replace(/\D/g,'')})} />
              </div>
              <div className="inp-note">Required for payment verification</div>
            </div>

            <div className="sec">Security</div>

            <div className="field">
              <label className="label">Password</label>
              <div className="inp-wrap">
                <input className="inp" type={showPw?'text':'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({...form,password:e.target.value})} style={{ paddingRight:36 }} required minLength={8} />
                <button type="button" className="eye-btn" onClick={() => setShowPw(v=>!v)}><EyeIcon open={showPw} /></button>
              </div>
            </div>
            <div className="field">
              <label className="label">Confirm password</label>
              <div className="inp-wrap">
                <input className="inp" type={showCf?'text':'password'} placeholder="Repeat password" value={form.confirm} onChange={e => setForm({...form,confirm:e.target.value})} style={{ paddingRight:36 }} required />
                <button type="button" className="eye-btn" onClick={() => setShowCf(v=>!v)}><EyeIcon open={showCf} /></button>
              </div>
            </div>

            <div className="check-row">
              <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
              <label htmlFor="terms" className="check-label">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>

            {error && <div className="err-box">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg> Creating account…</>
                : 'Create account'
              }
            </button>
          </form>

          <p className="note-line">Free plan · No credit card required</p>
          <p className="bottom-link">
            Already have an account?{' '}
            <Link href="/login" style={{ color:green, fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>

        <p className="page-foot">
          By continuing you agree to our{' '}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>
      </div>
    </>
  );
}
