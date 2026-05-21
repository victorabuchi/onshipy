import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import AuthNav from '../components/AuthNav';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ACTIVITIES = [
  { name: 'Marcus J.',  country: 'US', action: 'sale',      item: "Nike Air Force 1 '07",       profit: '+€80',  price: null,    time: '4s ago',  img: 15 },
  { name: 'Amara T.',   country: 'NG', action: 'import',    item: 'Gucci GG Marmont Belt',       profit: null,    price: '€380',  time: '21s ago', img: 44 },
  { name: 'Yuki N.',    country: 'JP', action: 'sale',      item: 'Jordan 1 Retro High OG',      profit: '+€95',  price: null,    time: '38s ago', img: 22 },
  { name: 'Sofia R.',   country: 'ES', action: 'shopify',   item: null,                          profit: null,    price: null,    time: '54s ago', img: 33 },
  { name: 'Liam O.',    country: 'CA', action: 'sale',      item: 'Apple AirPods Pro 2',         profit: '+€55',  price: null,    time: '1m ago',  img: 11 },
  { name: 'Diego M.',   country: 'BR', action: 'import',    item: 'Balenciaga Triple S',         profit: null,    price: '€720',  time: '1m ago',  img: 55 },
  { name: 'Priya L.',   country: 'IN', action: 'sale',      item: 'Off-White Zip Hoodie',        profit: '+€148', price: null,    time: '2m ago',  img: 29 },
  { name: 'Cole M.',    country: 'US', action: 'import',    item: 'New Balance 550 White',       profit: null,    price: '€89',   time: '2m ago',  img: 8  },
  { name: 'Riku S.',    country: 'FI', action: 'sale',      item: 'Zara Linen Blazer',           profit: '+€51',  price: null,    time: '3m ago',  img: 61 },
  { name: 'Lea V.',     country: 'DE', action: 'milestone', item: null,                          profit: '+€500', price: null,    time: '3m ago',  img: 37 },
  { name: 'Noah B.',    country: 'ZA', action: 'import',    item: 'Puma Suede Classic Plus',     profit: null,    price: '€74',   time: '4m ago',  img: 48 },
  { name: 'Jessie K.',  country: 'GB', action: 'sale',      item: 'Supreme Box Logo Hoodie',     profit: '+€211', price: null,    time: '4m ago',  img: 17 },
  { name: 'Kwame A.',   country: 'GH', action: 'shopify',   item: null,                          profit: null,    price: null,    time: '5m ago',  img: 59 },
  { name: 'Isabela C.', country: 'BR', action: 'import',    item: 'Dior Saddle Bag Mini',        profit: null,    price: '€1,250',time: '5m ago',  img: 26 },
  { name: 'Tariq M.',   country: 'AE', action: 'sale',      item: 'Rolex Submariner Replica',    profit: '+€340', price: null,    time: '6m ago',  img: 68 },
];

const FLAGS  = { US:'🇺🇸', GB:'🇬🇧', NG:'🇳🇬', JP:'🇯🇵', ES:'🇪🇸', CA:'🇨🇦', BR:'🇧🇷', IN:'🇮🇳', ZA:'🇿🇦', DE:'🇩🇪', FI:'🇫🇮', GH:'🇬🇭', AE:'🇦🇪' };
const STATS0 = [
  { label: 'Products imported', value: '412'    },
  { label: 'Profit generated',  value: '€9,241' },
  { label: 'Active sellers',    value: '2,847'  },
];

function EyeIcon({ open }) {
  return open
    ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

export default function Login() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [feed, setFeed]       = useState([]);
  const [stats, setStats]     = useState(STATS0);

  useEffect(() => {
    const token = localStorage.getItem('onshipy_token');
    if (token) { router.replace('/dashboard'); return; }
    if (router.query.error === 'google_failed') setError('Google sign in failed. Try again.');

    const q = [...ACTIVITIES].sort(() => Math.random() - 0.5);
    let i = 0;
    const push = () => { setFeed(prev => [{ ...q[i % q.length], id: Date.now() }, ...prev].slice(0, 4)); i++; };
    push();
    const iv = setInterval(push, 3200);

    const sIv = setInterval(() => {
      setStats([
        { label: 'Products imported', value: (Math.floor(Math.random() * 80) + 380).toLocaleString() },
        { label: 'Profit generated',  value: `€${(Math.floor(Math.random() * 3000) + 8000).toLocaleString()}` },
        { label: 'Active sellers',    value: (2847 + Math.floor(Math.random() * 40) - 20).toLocaleString() },
      ]);
    }, 7000);

    return () => { clearInterval(iv); clearInterval(sIv); };
  }, []);

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

  const ash   = '#f1f1f1';
  const green = '#008060';
  const text  = 'rgba(48,48,48,1)';
  const sub   = 'rgba(97,97,97,1)';
  const bd    = 'rgba(220,220,220,1)';

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
        html, body { width:100%; min-height:100vh; background:#1a1a1a; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }

        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gridPan { from{background-position:0 0} to{background-position:0 48px} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes countUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

        .lg-shell  { display:flex; flex-direction:column; min-height:100vh; }
        .lg-panels { display:flex; flex:1; }

        .left { background:#1a1a1a; flex:1; display:flex; flex-direction:column; padding:32px 40px 28px; position:relative; overflow:hidden; }
        .left-grid { position:absolute; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px); background-size:48px 48px; animation:gridPan 10s linear infinite; }
        .left-glow-a { position:absolute; top:5%; left:10%; width:320px; height:320px; border-radius:50%; background:radial-gradient(circle,rgba(0,128,96,0.12) 0%,transparent 70%); pointer-events:none; z-index:0; }
        .left-glow-b { position:absolute; bottom:10%; right:5%; width:220px; height:220px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%); pointer-events:none; z-index:0; }

        .hero-area  { flex:1; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:1; margin:20px 0; }
        .hero-title { font-size:28px; font-weight:800; color:#fff; line-height:1.18; letter-spacing:-0.8px; margin-bottom:8px; }
        .hero-sub   { font-size:13px; color:rgba(255,255,255,0.38); line-height:1.7; margin-bottom:24px; }
        .stats-row  { display:flex; gap:0; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); margin-bottom:20px; }
        .stat-cell  { flex:1; padding:11px 14px; background:rgba(255,255,255,0.03); border-right:1px solid rgba(255,255,255,0.07); }
        .stat-cell:last-child { border-right:none; }
        .stat-val   { font-size:16px; font-weight:800; color:#fff; animation:countUp .4s ease; }
        .stat-lbl   { font-size:9px; color:rgba(255,255,255,0.3); margin-top:2px; }

        .feed-area  { position:relative; z-index:1; }
        .feed-label { font-size:9px; font-weight:600; color:rgba(255,255,255,0.25); text-transform:uppercase; letter-spacing:.1em; display:flex; align-items:center; gap:6px; margin-bottom:8px; }
        .pdot       { width:6px; height:6px; border-radius:50%; background:#00b86c; flex-shrink:0; animation:pulse 1.8s infinite; }
        .feed-list  { display:flex; flex-direction:column; gap:5px; }
        .feed-row   { display:flex; align-items:center; gap:9px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:9px; padding:8px 11px; animation:fadeUp .3s ease; }

        .right { width:480px; flex-shrink:0; background:${ash}; display:flex; align-items:center; justify-content:center; padding:36px 40px 48px; overflow-y:auto; }
        .form-shell { width:100%; max-width:360px; }

        .tabs    { display:flex; border-bottom:2px solid rgba(0,0,0,0.07); margin-bottom:24px; }
        .tab-btn { flex:1; padding:9px 0; background:none; border:none; border-bottom:2px solid transparent; margin-bottom:-2px; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; color:${sub}; transition:color .15s, border-color .15s; }
        .tab-btn.on { color:${text}; border-bottom-color:${green}; }

        .field { margin-bottom:12px; }
        .lbl   { font-size:11px; font-weight:500; color:${sub}; display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
        .lbl a { color:${green}; font-weight:500; text-decoration:none; font-size:11px; }
        .lbl a:hover { text-decoration:underline; }
        .inp   { width:100%; padding:9px 11px; background:#fff; border:1px solid ${bd}; border-radius:8px; font-size:13px; color:${text}; font-family:inherit; outline:none; transition:border-color .2s, box-shadow .2s; }
        .inp::placeholder { color:rgba(140,140,140,0.7); }
        .inp:focus { border-color:${green}; box-shadow:0 0 0 3px rgba(0,128,96,0.1); }

        .pw-wrap      { position:relative; }
        .pw-wrap .inp { padding-right:38px; }
        .pw-eye       { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(120,120,120,0.6); display:flex; padding:4px; transition:color .15s; }
        .pw-eye:hover { color:${sub}; }

        .cta-btn { width:100%; padding:11px; background:${text}; color:#fff; border:none; border-radius:9px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:7px; transition:opacity .15s, transform .15s; }
        .cta-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
        .cta-btn:disabled { opacity:.35; cursor:not-allowed; transform:none; }
        .g-btn { width:100%; padding:10px; background:#fff; border:1px solid ${bd}; border-radius:9px; color:${text}; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-family:inherit; transition:border-color .15s, box-shadow .15s; }
        .g-btn:hover { border-color:rgba(150,150,150,0.6); box-shadow:0 1px 4px rgba(0,0,0,0.07); }

        .divider { display:flex; align-items:center; gap:10px; margin:14px 0; }
        .divider-line { flex:1; height:1px; background:rgba(0,0,0,0.08); }
        .divider-text { font-size:11px; color:rgba(130,130,130,0.7); }

        .err-box { padding:9px 12px; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); border-radius:8px; margin-bottom:12px; font-size:12px; color:#c0392b; }

        @media (max-width:900px) {
          .lg-panels { flex-direction:column; }
          .left  { padding:24px 24px 20px; min-height:auto; }
          .hero-title { font-size:22px; }
          .right { width:100%; padding:28px 20px 48px; align-items:flex-start; }
        }
      `}</style>

      <div className="lg-shell">
        <AuthNav />

        <div className="lg-panels">

          {/* LEFT PANEL */}
          <div className="left">
            <div className="left-grid" />
            <div className="left-glow-a" />
            <div className="left-glow-b" />

            <div className="hero-area">
              <div className="hero-title">
                Sell anything.<br />
                <span style={{ color:'rgba(255,255,255,0.28)' }}>From anywhere.</span>
              </div>
              <p className="hero-sub">Import from Nike, ASOS, Amazon and 1,000+ stores. Set your price. We purchase and ship automatically.</p>

              <div className="stats-row">
                {stats.map((s, i) => (
                  <div key={i} className="stat-cell">
                    <div className="stat-val" key={s.value}>{s.value}</div>
                    <div className="stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="feed-area">
              <div className="feed-label"><span className="pdot"/> Live activity</div>
              <div className="feed-list">
                {feed.map(n => (
                  <div key={n.id} className="feed-row">
                    <div style={{ position:'relative', width:30, height:30, borderRadius:'50%', flexShrink:0, background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.7)', lineHeight:1, userSelect:'none', zIndex:0 }}>{n.name.split(' ').map(w=>w[0]).join('')}</span>
                      <img style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover', zIndex:1 }} src={`https://i.pravatar.cc/40?img=${n.img}`} alt={n.name} onError={e => { e.currentTarget.style.opacity='0'; }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                        <span style={{ fontSize:11, fontWeight:600, color:'#fff', flexShrink:0 }}>{n.name}</span>
                        <span style={{ fontSize:11 }}>{FLAGS[n.country] || ''}</span>
                        <span style={{ marginLeft:'auto', fontSize:9, color:'rgba(255,255,255,0.22)', flexShrink:0 }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.38)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {n.action==='sale'      && <><span style={{ color:'#69f0ae', fontWeight:600 }}>{n.profit}</span> profit · sold {n.item}</>}
                        {n.action==='import'    && <>Imported {n.item} · <span style={{ color:'rgba(255,255,255,0.55)' }}>{n.price}</span></>}
                        {n.action==='shopify'   && <span style={{ color:'#95BF47' }}>Connected Shopify store</span>}
                        {n.action==='milestone' && <><span style={{ color:'#ffd54f', fontWeight:600 }}>{n.profit}</span> total earnings milestone</>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="right">
            <div className="form-shell">

              <div className="tabs">
                <button className="tab-btn on">Login</button>
                <button className="tab-btn" onClick={() => router.push('/register')}>Sign Up</button>
              </div>

              <button className="g-btn" onClick={() => window.location.href = `${API_BASE}/api/auth/google`} style={{ marginBottom:14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="divider"><div className="divider-line"/><span className="divider-text">or with email</span><div className="divider-line"/></div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="lbl">Email address</label>
                  <input className="inp" type="email" required placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>

                <div className="field">
                  <label className="lbl">
                    <span>Password</span>
                    <a href="#">Forgot password?</a>
                  </label>
                  <div className="pw-wrap">
                    <input className="inp" type={showPw ? 'text' : 'password'} required placeholder="Enter your password"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button type="button" className="pw-eye" onClick={() => setShowPw(v => !v)}><EyeIcon open={showPw}/></button>
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

              <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:sub }}>
                No account yet?{' '}
                <Link href="/register" style={{ color:green, fontWeight:600, textDecoration:'none' }}>Create one free</Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
