import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Large name + country pool — shuffled, never repeats back-to-back ──────────
const SELLER_POOL = [
  { name: 'Cole M.', flag: '🇺🇸', city: 'New York' },
  { name: 'Jessie K.', flag: '🇬🇧', city: 'London' },
  { name: 'Amara T.', flag: '🇳🇬', city: 'Lagos' },
  { name: 'Riku S.', flag: '🇫🇮', city: 'Helsinki' },
  { name: 'Sofia R.', flag: '🇪🇸', city: 'Madrid' },
  { name: 'Liam O.', flag: '🇨🇦', city: 'Toronto' },
  { name: 'Yuki N.', flag: '🇯🇵', city: 'Tokyo' },
  { name: 'Diego M.', flag: '🇧🇷', city: 'São Paulo' },
  { name: 'Priya L.', flag: '🇮🇳', city: 'Mumbai' },
  { name: 'Noah B.', flag: '🇿🇦', city: 'Cape Town' },
  { name: 'Lea V.', flag: '🇩🇪', city: 'Berlin' },
  { name: 'Marcus J.', flag: '🇺🇸', city: 'Atlanta' },
  { name: 'Chloe F.', flag: '🇫🇷', city: 'Paris' },
  { name: 'Tariq A.', flag: '🇦🇪', city: 'Dubai' },
  { name: 'Mei W.', flag: '🇨🇳', city: 'Shanghai' },
  { name: 'Ivan P.', flag: '🇵🇱', city: 'Warsaw' },
  { name: 'Fatima H.', flag: '🇲🇦', city: 'Casablanca' },
  { name: 'Oscar L.', flag: '🇸🇪', city: 'Stockholm' },
  { name: 'Nia G.', flag: '🇬🇭', city: 'Accra' },
  { name: 'Ben C.', flag: '🇦🇺', city: 'Sydney' },
  { name: 'Elena D.', flag: '🇮🇹', city: 'Milan' },
  { name: 'Kevin O.', flag: '🇰🇷', city: 'Seoul' },
  { name: 'Zara M.', flag: '🇵🇰', city: 'Karachi' },
  { name: 'Lucas B.', flag: '🇧🇪', city: 'Brussels' },
  { name: 'Aisha K.', flag: '🇰🇪', city: 'Nairobi' },
  { name: 'Tom H.', flag: '🇳🇱', city: 'Amsterdam' },
  { name: 'Valentina C.', flag: '🇨🇴', city: 'Bogotá' },
  { name: 'Kwame A.', flag: '🇬🇭', city: 'Kumasi' },
  { name: 'Sara J.', flag: '🇩🇰', city: 'Copenhagen' },
  { name: 'Raj P.', flag: '🇮🇳', city: 'Bangalore' },
  { name: 'Mia T.', flag: '🇸🇬', city: 'Singapore' },
  { name: 'Chris N.', flag: '🇺🇸', city: 'Chicago' },
  { name: 'Ines F.', flag: '🇵🇹', city: 'Lisbon' },
  { name: 'Emeka O.', flag: '🇳🇬', city: 'Abuja' },
  { name: 'Hannah S.', flag: '🇿🇦', city: 'Johannesburg' },
  { name: 'Ali R.', flag: '🇹🇷', city: 'Istanbul' },
  { name: 'Nora L.', flag: '🇳🇴', city: 'Oslo' },
  { name: 'James W.', flag: '🇬🇧', city: 'Manchester' },
  { name: 'Yara B.', flag: '🇪🇬', city: 'Cairo' },
  { name: 'Felix M.', flag: '🇨🇭', city: 'Zurich' },
];

const PRODUCTS = [
  'Nike Air Max 270', 'Adidas Ultraboost 22', 'Zara Linen Blazer',
  'Apple AirPods Pro', 'ASOS Floral Dress', 'Gucci GG Belt',
  'Jordan 1 Retro High', 'New Balance 550', 'H&M Denim Jacket',
  'Levi\'s 501 Jeans', 'Puma Suede Classic', 'Converse Chuck Taylor',
  'Ralph Lauren Polo Shirt', 'Ray-Ban Aviators', 'Coach Leather Bag',
  'Reebok Classic Leather', 'Tommy Hilfiger Hoodie', 'Calvin Klein Tee',
  'Vans Old Skool', 'Timberland 6-inch Boots', 'Fila Disruptor',
  'Balenciaga Triple S', 'Off-White Belt', 'Stone Island Jacket',
];

// Shuffle array (Fisher-Yates)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Generate a random profit between ranges
const randProfit = () => {
  const amounts = [34, 47, 58, 72, 89, 95, 112, 130, 145, 178, 203, 245, 280, 312, 350, 389, 420, 467, 489];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

// Generate realistic fluctuating seller count
const getSellerCount = () => {
  const base = 2847;
  const fluctuation = Math.floor(Math.random() * 40) - 20; // ±20
  return (base + fluctuation).toLocaleString();
};

// Generate activity event
const makeEvent = (seller, product) => {
  const r = Math.random();
  if (r < 0.35) {
    return { type: 'import', text: `imported ${product}`, color: '#f97316', icon: '🔗' };
  } else if (r < 0.65) {
    const profit = randProfit();
    return { type: 'profit', text: `made +$${profit} profit`, color: '#22c55e', icon: '💰', profit };
  } else {
    const profit = randProfit();
    return { type: 'sold', text: `sold ${product} · +$${profit}`, color: '#3b82f6', icon: '🛍️', profit };
  }
};

const STATS = [
  { label: 'Products imported today', getValue: () => (Math.floor(Math.random() * 80) + 340).toLocaleString() },
  { label: 'Profit made today', getValue: () => `$${(Math.floor(Math.random() * 2000) + 8000).toLocaleString()}` },
  { label: 'Active sellers now', getValue: () => getSellerCount() },
];

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [sellerCount, setSellerCount] = useState('2,847');
  const [stats, setStats] = useState([
    { label: 'Products imported today', value: '412' },
    { label: 'Profit made today', value: '$9,241' },
    { label: 'Active sellers now', value: '2,847' },
  ]);

  // Shuffled queues — never repeat back-to-back
  const sellerQueue = useRef(shuffle(SELLER_POOL));
  const productQueue = useRef(shuffle(PRODUCTS));
  const sellerIdx = useRef(0);
  const productIdx = useRef(0);
  const lastSeller = useRef(null);

  const nextSeller = () => {
    // If we've exhausted the queue, reshuffle — but make sure first item ≠ last used
    if (sellerIdx.current >= sellerQueue.current.length) {
      let reshuffled = shuffle(SELLER_POOL);
      if (reshuffled[0].name === lastSeller.current?.name) {
        reshuffled = [...reshuffled.slice(1), reshuffled[0]];
      }
      sellerQueue.current = reshuffled;
      sellerIdx.current = 0;
    }
    const s = sellerQueue.current[sellerIdx.current++];
    lastSeller.current = s;
    return s;
  };

  const nextProduct = () => {
    if (productIdx.current >= productQueue.current.length) {
      productQueue.current = shuffle(PRODUCTS);
      productIdx.current = 0;
    }
    return productQueue.current[productIdx.current++];
  };

  useEffect(() => {
    if (router.query.error === 'google_failed') setError('Google sign in failed. Try again.');

    // Initial notifs
    const initial = Array.from({ length: 3 }, () => {
      const seller = nextSeller();
      const product = nextProduct();
      const event = makeEvent(seller, product);
      return { id: Math.random(), seller, event };
    });
    setNotifs(initial);

    // Pop new notif every 3.2s
    const iv = setInterval(() => {
      const seller = nextSeller();
      const product = nextProduct();
      const event = makeEvent(seller, product);
      setNotifs(prev => [{ id: Math.random(), seller, event }, ...prev].slice(0, 4));
    }, 3200);

    // Fluctuate stats every 8s
    const statsIv = setInterval(() => {
      setStats([
        { label: 'Products imported today', value: (Math.floor(Math.random() * 80) + 340).toLocaleString() },
        { label: 'Profit made today', value: `$${(Math.floor(Math.random() * 3000) + 7500).toLocaleString()}` },
        { label: 'Active sellers now', value: getSellerCount() },
      ]);
    }, 8000);

    return () => { clearInterval(iv); clearInterval(statsIv); };
  }, []);

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

  return (
    <>
      <Head>
        <title>Onshipy — Sign in</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Sign in to Onshipy — sell anything from anywhere." />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; background: #050509; font-family: 'Sora', sans-serif; }
        @keyframes gridMove { from{transform:translateY(0)} to{transform:translateY(48px)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes countUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .inp { width:100%; padding:11px 14px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:9px; font-size:14px; outline:none; color:#fff; font-family:'Sora',sans-serif; transition:border-color .2s,background .2s; }
        .inp::placeholder { color:rgba(255,255,255,0.2); }
        .inp:focus { border-color:rgba(255,255,255,0.28); background:rgba(255,255,255,0.08); }
        .page { display:flex; min-height:100vh; }
        .left { flex:1; position:relative; overflow:hidden; display:none; flex-direction:column; justify-content:space-between; padding:44px 48px; }
        .right { width:100%; display:flex; align-items:center; justify-content:center; padding:32px 24px; min-height:100vh; }
        .form-wrap { width:100%; max-width:380px; }
        .sub-btn { width:100%; padding:12px; background:#fff; color:#050509; border:none; border-radius:9px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Sora',sans-serif; transition:opacity .15s,transform .15s; }
        .sub-btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
        .sub-btn:disabled { opacity:.35; cursor:not-allowed; }
        .g-btn { width:100%; padding:11px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:9px; color:#fff; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-family:'Sora',sans-serif; transition:background .15s; }
        .g-btn:hover { background:rgba(255,255,255,0.09); }
        .notif { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 13px; animation:slideIn .4s cubic-bezier(.34,1.56,.64,1); }
        .stat-val { font-size:22px; font-weight:800; color:#fff; animation:countUp .4s ease; }
        @media(min-width:880px){ .left{display:flex;} .right{width:420px;flex-shrink:0;padding:44px 48px;border-left:1px solid rgba(255,255,255,0.06);} }
      `}</style>

      <div className="page">

        {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
        <div className="left" style={{ background: '#050509' }}>
          {/* Grid bg */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
            backgroundSize: '48px 48px',
            animation: 'gridMove 12s linear infinite',
          }} />
          <div style={{ position: 'absolute', top: '30%', left: '40%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,200,83,0.05) 0%,transparent 70%)', zIndex: 0 }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, fontSize: 20, fontWeight: 800, color: '#fff' }}>Onshipy</div>

          {/* Main copy */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>
              Sell anything.<br />
              <span style={{ color: 'rgba(255,255,255,0.28)' }}>From anywhere.</span>
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.8, marginBottom: 36, maxWidth: 380 }}>
              Import from Nike, ASOS, Amazon and 1,000+ stores. Set your price. We purchase and ship to your customers automatically.
            </p>

            {/* Live stats — fluctuate */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 40, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  flex: 1, padding: '14px 16px',
                  borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  background: 'rgba(255,255,255,0.03)'
                }}>
                  <div className="stat-val" key={s.value}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3, lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Live activity feed */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.8s infinite' }} />
                Live activity
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {notifs.map((n, i) => (
                  <div key={n.id} className="notif">
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${n.event.color}33, ${n.event.color}11)`,
                      border: `1px solid ${n.event.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15
                    }}>{n.event.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>{n.seller.flag}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.seller.name}</span>
                        {n.event.type === 'profit' && (
                          <span style={{ color: '#22c55e', fontWeight: 700, marginLeft: 2 }}>+${n.event.profit}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.event.text} · {n.seller.city}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: 'relative', zIndex: 1 }} />
        </div>

        {/* ── RIGHT PANEL — Login form ──────────────────────────────────────── */}
        <div className="right" style={{ background: '#0a0a0f' }}>
          <div className="form-wrap">

            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 32 }}>Onshipy</div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.5px' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
              Sign in to your account
            </p>

            {/* Google */}
            <button className="g-btn" onClick={() => window.location.href = `${API_BASE}/api/auth/google`} style={{ marginBottom: 18 }}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>or email</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
                <input className="inp" type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
                  <a href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Forgot password?</a>
                </div>
                <input className="inp" type="password" required placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>

              {error && (
                <div style={{ padding: '9px 13px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, marginBottom: 12, fontSize: 13, color: '#f87171' }}>
                  {error}
                </div>
              )}

              <button className="sub-btn" type="submit" disabled={loading} style={{ marginTop: 14 }}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
              No account?{' '}
              <Link href="/register" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}