import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const SELLER_POOL = [
  { name: 'Cole M.',       flag: '🇺🇸', city: 'New York'     },
  { name: 'Jessie K.',     flag: '🇬🇧', city: 'London'       },
  { name: 'Amara T.',      flag: '🇳🇬', city: 'Lagos'        },
  { name: 'Riku S.',       flag: '🇫🇮', city: 'Helsinki'     },
  { name: 'Sofia R.',      flag: '🇪🇸', city: 'Madrid'       },
  { name: 'Liam O.',       flag: '🇨🇦', city: 'Toronto'      },
  { name: 'Yuki N.',       flag: '🇯🇵', city: 'Tokyo'        },
  { name: 'Diego M.',      flag: '🇧🇷', city: 'São Paulo'    },
  { name: 'Priya L.',      flag: '🇮🇳', city: 'Mumbai'       },
  { name: 'Noah B.',       flag: '🇿🇦', city: 'Cape Town'    },
  { name: 'Lea V.',        flag: '🇩🇪', city: 'Berlin'       },
  { name: 'Marcus J.',     flag: '🇺🇸', city: 'Atlanta'      },
  { name: 'Chloe F.',      flag: '🇫🇷', city: 'Paris'        },
  { name: 'Tariq A.',      flag: '🇦🇪', city: 'Dubai'        },
  { name: 'Mei W.',        flag: '🇨🇳', city: 'Shanghai'     },
  { name: 'Ivan P.',       flag: '🇵🇱', city: 'Warsaw'       },
  { name: 'Fatima H.',     flag: '🇲🇦', city: 'Casablanca'   },
  { name: 'Oscar L.',      flag: '🇸🇪', city: 'Stockholm'    },
  { name: 'Nia G.',        flag: '🇬🇭', city: 'Accra'        },
  { name: 'Ben C.',        flag: '🇦🇺', city: 'Sydney'       },
];

const PRODUCTS = [
  'Nike Air Max 270', 'Adidas Ultraboost 22', 'Zara Linen Blazer',
  'Apple AirPods Pro', 'ASOS Floral Dress', 'Gucci GG Belt',
  'Jordan 1 Retro High', 'New Balance 550', 'H&M Denim Jacket',
  "Levi's 501 Jeans", 'Puma Suede Classic', 'Converse Chuck Taylor',
  'Balenciaga Triple S', 'Off-White Belt', 'Stone Island Jacket',
];

const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const randProfit = () => {
  const amounts = [34, 47, 58, 72, 89, 95, 112, 130, 145, 178, 203, 245, 280, 312, 350, 389];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

const getSellerCount = () => (2847 + Math.floor(Math.random() * 40) - 20).toLocaleString();

const makeEvent = (product) => {
  const r = Math.random();
  if (r < 0.35) return { type: 'import', text: `imported ${product}`, color: '#f97316', icon: '🔗' };
  if (r < 0.65) { const p = randProfit(); return { type: 'profit', text: `made +$${p} profit`, color: '#22c55e', icon: '💰', profit: p }; }
  const p = randProfit(); return { type: 'sold', text: `sold ${product} · +$${p}`, color: '#3b82f6', icon: '🛍️', profit: p };
};

export default function Login() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs]   = useState([]);
  const [stats, setStats]     = useState([
    { label: 'Imported today', value: '412' },
    { label: 'Profit today',   value: '$9,241' },
    { label: 'Active sellers', value: '2,847' },
  ]);

  const sellerQueue = useRef(shuffle(SELLER_POOL));
  const productQueue = useRef(shuffle(PRODUCTS));
  const sellerIdx = useRef(0);
  const productIdx = useRef(0);
  const lastSeller = useRef(null);

  const nextSeller = () => {
    if (sellerIdx.current >= sellerQueue.current.length) {
      let r = shuffle(SELLER_POOL);
      if (r[0].name === lastSeller.current?.name) r = [...r.slice(1), r[0]];
      sellerQueue.current = r; sellerIdx.current = 0;
    }
    const s = sellerQueue.current[sellerIdx.current++];
    lastSeller.current = s; return s;
  };

  const nextProduct = () => {
    if (productIdx.current >= productQueue.current.length) {
      productQueue.current = shuffle(PRODUCTS); productIdx.current = 0;
    }
    return productQueue.current[productIdx.current++];
  };

  useEffect(() => {
    if (router.query.error === 'google_failed') setError('Google sign in failed. Try again.');
    const initial = Array.from({ length: 3 }, () => {
      const seller = nextSeller(); const product = nextProduct();
      return { id: Math.random(), seller, event: makeEvent(product) };
    });
    setNotifs(initial);

    const iv = setInterval(() => {
      const seller = nextSeller(); const product = nextProduct();
      const event = makeEvent(product);
      setNotifs(prev => [{ id: Math.random(), seller, event }, ...prev].slice(0, 4));
    }, 3200);

    const statsIv = setInterval(() => {
      setStats([
        { label: 'Imported today', value: (Math.floor(Math.random() * 80) + 340).toLocaleString() },
        { label: 'Profit today',   value: `$${(Math.floor(Math.random() * 3000) + 7500).toLocaleString()}` },
        { label: 'Active sellers', value: getSellerCount() },
      ]);
    }, 8000);

    return () => { clearInterval(iv); clearInterval(statsIv); };
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
      localStorage.setItem('onshipy_token', data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server.'); setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Onshipy — Sign in</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Sign in to Onshipy — sell anything from anywhere." />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; background: #050509; font-family: 'Sora', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes gridMove { from{transform:translateY(0)} to{transform:translateY(48px)} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes countUp  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .page { display:flex; flex-direction:column; min-height:100vh; }

        /* ── Left panel (brand / social-proof) ── */
        .left {
          display:flex; flex-direction:column; position:relative; overflow:hidden;
          background:#050509; padding:24px 20px 20px; gap:0;
        }
        .left-logo   { font-size:18px; font-weight:800; color:#fff; margin-bottom:18px; }
        .left-copy   { font-size:22px; font-weight:800; color:#fff; line-height:1.15; letter-spacing:-0.8px; margin-bottom:6px; }
        .left-sub    { font-size:13px; color:rgba(255,255,255,0.38); line-height:1.7; margin-bottom:18px; }
        .stats-row   { display:flex; gap:0; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.07); margin-bottom:18px; }
        .stat-cell   { flex:1; padding:10px 12px; background:rgba(255,255,255,0.03); border-right:1px solid rgba(255,255,255,0.07); }
        .stat-cell:last-child { border-right:none; }
        .stat-val    { font-size:16px; font-weight:800; color:#fff; animation:countUp .4s ease; }
        .stat-lbl    { font-size:9px; color:rgba(255,255,255,0.3); margin-top:2px; line-height:1.3; }
        .notif-feed  { display:flex; flex-direction:column; gap:6px; }
        .notif       { display:flex; align-items:center; gap:9px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:9px; padding:9px 11px; animation:slideIn .4s cubic-bezier(.34,1.56,.64,1); }
        .notif-icon  { width:28px; height:28px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:13px; }
        .live-badge  { font-size:10px; color:rgba(255,255,255,0.25); text-transform:uppercase; letter-spacing:.09em; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
        .pulse-dot   { width:6px; height:6px; border-radius:50%; background:#22c55e; display:inline-block; animation:pulse 1.8s infinite; }

        /* ── Right panel (form) ── */
        .right {
          display:flex; align-items:center; justify-content:center;
          padding:28px 20px 40px; background:#0a0a0f;
          border-top:1px solid rgba(255,255,255,0.06);
        }
        .form-wrap { width:100%; max-width:380px; }
        .form-logo  { font-size:18px; font-weight:800; color:#fff; margin-bottom:24px; display:none; }

        .inp { width:100%; padding:11px 14px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:9px; font-size:14px; outline:none; color:#fff; font-family:'Sora',sans-serif; transition:border-color .2s,background .2s; }
        .inp::placeholder { color:rgba(255,255,255,0.2); }
        .inp:focus { border-color:rgba(255,255,255,0.28); background:rgba(255,255,255,0.08); }
        .sub-btn { width:100%; padding:12px; background:#fff; color:#050509; border:none; border-radius:9px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Sora',sans-serif; transition:opacity .15s,transform .15s; }
        .sub-btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
        .sub-btn:disabled { opacity:.35; cursor:not-allowed; }
        .g-btn { width:100%; padding:11px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:9px; color:#fff; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-family:'Sora',sans-serif; transition:background .15s; }
        .g-btn:hover { background:rgba(255,255,255,0.09); }

        /* Desktop: side-by-side */
        @media (min-width:860px) {
          .page       { flex-direction:row; }
          .left       { flex:1; padding:44px 48px; justify-content:space-between; gap:0; }
          .left-logo  { font-size:20px; }
          .left-copy  { font-size:40px; letter-spacing:-1.5px; margin-bottom:12px; }
          .left-sub   { font-size:15px; margin-bottom:36px; }
          .stats-row  { margin-bottom:40px; }
          .stat-val   { font-size:22px; }
          .stat-lbl   { font-size:11px; }
          .stat-cell  { padding:14px 16px; }
          .right      { width:420px; flex-shrink:0; padding:44px 48px; border-top:none; border-left:1px solid rgba(255,255,255,0.06); }
          .form-logo  { display:block; }
        }
      `}</style>

      <div className="page">

        {/* ── LEFT PANEL ── */}
        <div className="left">
          {/* Moving grid */}
          <div style={{ position:'absolute', inset:0, zIndex:0, backgroundImage:`linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`, backgroundSize:'48px 48px', animation:'gridMove 12s linear infinite' }}/>
          <div style={{ position:'absolute', top:'30%', left:'40%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,83,0.05) 0%,transparent 70%)', zIndex:0 }}/>

          {/* Logo */}
          <div className="left-logo" style={{ position:'relative', zIndex:1 }}>Onshipy</div>

          {/* Copy */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="left-copy">
              Sell anything.<br/>
              <span style={{ color:'rgba(255,255,255,0.28)' }}>From anywhere.</span>
            </div>
            <p className="left-sub">
              Import from Nike, ASOS, Amazon and 1,000+ stores. Set your price. We purchase and ship automatically.
            </p>

            {/* Stats */}
            <div className="stats-row">
              {stats.map((s, i) => (
                <div key={i} className="stat-cell">
                  <div className="stat-val" key={s.value}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Live feed */}
            <div className="live-badge">
              <span className="pulse-dot"/>
              Live activity
            </div>
            <div className="notif-feed">
              {notifs.slice(0, 3).map(n => (
                <div key={n.id} className="notif">
                  <div className="notif-icon" style={{ background:`linear-gradient(135deg,${n.event.color}33,${n.event.color}11)`, border:`1px solid ${n.event.color}44` }}>
                    {n.event.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:5 }}>
                      <span>{n.seller.flag}</span>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.seller.name}</span>
                      {n.event.type === 'profit' && <span style={{ color:'#22c55e', fontWeight:700 }}>+${n.event.profit}</span>}
                    </div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {n.event.text} · {n.seller.city}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position:'relative', zIndex:1 }}/>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div className="right">
          <div className="form-wrap">

            <div className="form-logo">Onshipy</div>

            <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:4, letterSpacing:'-0.5px' }}>Welcome back</h1>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:24 }}>Sign in to your account</p>

            <button className="g-btn" onClick={() => window.location.href = `${API_BASE}/api/auth/google`} style={{ marginBottom:16 }}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)' }}>or email</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Email</label>
                <input className="inp" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
              </div>

              <div style={{ marginBottom:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <label style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Password</label>
                  <a href="#" style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Forgot?</a>
                </div>
                <input className="inp" type="password" required placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>
              </div>

              {error && (
                <div style={{ padding:'9px 13px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:8, marginBottom:12, fontSize:13, color:'#f87171' }}>
                  {error}
                </div>
              )}

              <button className="sub-btn" type="submit" disabled={loading} style={{ marginTop:14 }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'rgba(255,255,255,0.28)' }}>
              No account?{' '}
              <Link href="/register" style={{ color:'#fff', fontWeight:700, textDecoration:'none' }}>Create one free</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
