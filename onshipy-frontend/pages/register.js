import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ACTIVITIES = [
  { user: 'Cole M.',   action: 'imported', item: 'Nike Air Max 270',    profit: null,   flag: '🇺🇸' },
  { user: 'Jessie K.', action: 'profit',   item: null,                  profit: '+$350', flag: '🇬🇧' },
  { user: 'Amara T.',  action: 'imported', item: 'Adidas Ultraboost 22',profit: null,   flag: '🇳🇬' },
  { user: 'Riku S.',   action: 'sold',     item: 'Zara Linen Blazer',   profit: '+$94', flag: '🇫🇮' },
  { user: 'Sofia R.',  action: 'profit',   item: null,                  profit: '+$212', flag: '🇪🇸' },
  { user: 'Liam O.',   action: 'imported', item: 'Apple AirPods Pro',   profit: null,   flag: '🇨🇦' },
  { user: 'Yuki N.',   action: 'sold',     item: 'ASOS Floral Dress',   profit: '+$67', flag: '🇯🇵' },
  { user: 'Diego M.',  action: 'profit',   item: null,                  profit: '+$489', flag: '🇧🇷' },
  { user: 'Priya L.',  action: 'imported', item: 'Gucci GG Belt',       profit: null,   flag: '🇮🇳' },
  { user: 'Noah B.',   action: 'sold',     item: 'New Balance 550',     profit: '+$130', flag: '🇿🇦' },
  { user: 'Lea V.',    action: 'profit',   item: null,                  profit: '+$78', flag: '🇩🇪' },
  { user: 'Marcus J.', action: 'imported', item: 'Jordan 1 Retro High', profit: null,   flag: '🇺🇸' },
];

const DEMO_STEPS = [
  { id: 0, label: 'Copy any product link',   sublabel: 'From Nike, ASOS, Amazon, Zara & 1000+ stores', visual: 'copy'   },
  { id: 1, label: 'Import in one click',     sublabel: 'Onshipy scrapes title, price, images instantly', visual: 'import' },
  { id: 2, label: 'Set your selling price',  sublabel: 'Choose your markup — see profit in real time',   visual: 'price'  },
  { id: 3, label: 'Push to your store',      sublabel: 'One click to Shopify, WooCommerce & more',       visual: 'push'   },
  { id: 4, label: 'Customer buys. You profit.', sublabel: 'We auto-purchase & ship. Zero effort.',       visual: 'profit' },
];

function DemoVisual({ step }) {
  const [typed, setTyped]       = useState('');
  const [showCheck, setShowCheck] = useState(false);
  const url = 'https://nike.com/t/air-max-270';

  useEffect(() => {
    setTyped(''); setShowCheck(false);
    if (step !== 0) return;
    let i = 0;
    const iv = setInterval(() => {
      setTyped(url.slice(0, i + 1)); i++;
      if (i >= url.length) { clearInterval(iv); setTimeout(() => setShowCheck(true), 300); }
    }, 40);
    return () => clearInterval(iv);
  }, [step]);

  if (step === 0) return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Product URL</div>
      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>🔗</span>
        <span style={{ fontSize: 12, color: '#fff', flex: 1, fontFamily: 'monospace' }}>{typed}<span style={{ opacity: 0.5 }}>|</span></span>
        {showCheck && <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#00c853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['nike.com', 'asos.com', 'amazon.com', '+1000'].map((s, i) => (
          <span key={i} style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{s}</span>
        ))}
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 60, height: 60, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#1a1a2e,#16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👟</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 3 }}>Nike Air Max 270</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>nike.com · 8 images · 6 variants</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['EU 40','EU 41','EU 42'].map(s => (
              <span key={s} style={{ padding: '2px 7px', background: 'rgba(255,255,255,0.08)', borderRadius: 5, fontSize: 10, color: '#fff' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        {[{ label: 'Source', val: '€120', color: 'rgba(255,255,255,0.5)' }, { label: 'Images', val: '8', color: 'rgba(255,255,255,0.5)' }, { label: 'Status', val: '✓ Done', color: '#69f0ae' }].map((m, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 7, padding: '7px 9px' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 9, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>You pay</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>€120</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 18, color: 'rgba(255,255,255,0.25)' }}>·</div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 9, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Customer pays</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>€185</div>
        </div>
      </div>
      <div style={{ background: 'linear-gradient(135deg,rgba(0,200,83,0.15),rgba(105,240,174,0.08))', border: '1px solid rgba(0,200,83,0.3)', borderRadius: 9, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Your profit per sale</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#69f0ae' }}>+€65</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#69f0ae' }}>35%</div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Push to your store</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[{ name: 'Shopify', color: '#95BF47', status: 'Connected ✓' }, { name: 'WooCommerce', color: '#7F54B3', status: 'Coming soon' }, { name: 'Etsy', color: '#F45800', status: 'Coming soon' }].map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 7, padding: '9px 12px', border: i === 0 ? '1px solid rgba(149,191,71,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }}/>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{s.name}</span>
            </div>
            <span style={{ fontSize: 10, color: i === 0 ? '#95BF47' : 'rgba(255,255,255,0.3)' }}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 4) return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 6 }}>🎉</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Order received!</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Onshipy auto-purchased & shipped it. You did nothing.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
        {[{ label: 'You paid', val: '€120', color: '#fff' }, { label: 'Customer paid', val: '€185', color: '#fff' }, { label: 'Your profit', val: '+€65', color: '#69f0ae' }].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 7, padding: '9px 6px' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

export default function Register() {
  const router = useRouter();
  const [form, setForm]         = useState({ full_name: '', email: '', password: '', store_name: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [notifs, setNotifs]     = useState([]);

  useEffect(() => {
    const iv = setInterval(() => {
      setStepVisible(false);
      setTimeout(() => { setDemoStep(s => (s + 1) % DEMO_STEPS.length); setStepVisible(true); }, 400);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const queue = [...ACTIVITIES].sort(() => Math.random() - 0.5);
    let idx = 0;
    const iv = setInterval(() => {
      const item = queue[idx % queue.length]; idx++;
      setNotifs(prev => [{ ...item, id: Date.now() }, ...prev].slice(0, 3));
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      localStorage.setItem('onshipy_token', data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server.'); setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Onshipy — Create account</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; background: #050509; font-family: 'Sora', sans-serif; -webkit-font-smoothing: antialiased; }

        @keyframes gridMove  { from{transform:translateY(0)} to{transform:translateY(40px)} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes popIn     { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes slideIn   { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }

        .page { display:flex; flex-direction:column; min-height:100vh; }

        /* ── Left panel ── */
        .left {
          display:flex; flex-direction:column; position:relative;
          overflow:hidden; background:#050509; padding:24px 20px 18px;
        }
        .left-logo   { font-size:18px; font-weight:800; color:#fff; margin-bottom:16px; position:relative; z-index:1; }
        .step-badge  { display:inline-flex; align-items:center; gap:7px; padding:4px 11px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:20px; font-size:10px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; }
        .step-title  { font-size:20px; font-weight:800; color:#fff; line-height:1.2; margin-bottom:4px; letter-spacing:-0.5px; }
        .step-sub    { font-size:12px; color:rgba(255,255,255,0.45); margin-bottom:14px; }
        .demo-card   { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; margin-bottom:14px; }
        .step-dots   { display:flex; gap:5px; margin-bottom:16px; }
        .step-dot    { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,0.2); transition:all .3s; cursor:pointer; }
        .step-dot.active { background:#fff; width:20px; border-radius:4px; }
        .live-label  { font-size:10px; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:.09em; display:flex; align-items:center; gap:6px; margin-bottom:8px; }
        .pulse-dot   { width:6px; height:6px; border-radius:50%; background:#00c853; display:inline-block; animation:pulse 1.5s infinite; }
        .notif-list  { display:flex; flex-direction:column; gap:5px; }
        .notif       { display:flex; align-items:center; gap:9px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:9px; padding:8px 11px; animation:slideIn .4s cubic-bezier(.34,1.56,.64,1); }

        /* ── Right panel (form) ── */
        .right {
          display:flex; align-items:center; justify-content:center;
          padding:24px 20px 40px; background:#0a0a0f;
          border-top:1px solid rgba(255,255,255,0.06);
        }
        .form-box  { width:100%; max-width:400px; }
        .form-logo { font-size:18px; font-weight:800; color:#fff; margin-bottom:22px; display:none; }

        .inp { width:100%; padding:11px 13px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:9px; font-size:14px; outline:none; color:#fff; font-family:'Sora',sans-serif; transition:border-color .2s,background .2s; }
        .inp::placeholder { color:rgba(255,255,255,0.22); }
        .inp:focus { border-color:rgba(255,255,255,0.28); background:rgba(255,255,255,0.08); }
        .lbl { font-size:10px; font-weight:600; color:rgba(255,255,255,0.45); display:block; margin-bottom:5px; text-transform:uppercase; letter-spacing:.05em; }
        .sub-btn { width:100%; padding:12px; background:#fff; color:#050509; border:none; border-radius:9px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Sora',sans-serif; transition:opacity .15s,transform .15s; }
        .sub-btn:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); }
        .sub-btn:disabled { opacity:.4; cursor:not-allowed; }
        .g-btn { width:100%; padding:11px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:9px; color:#fff; font-size:14px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-family:'Sora',sans-serif; transition:background .15s; }
        .g-btn:hover { background:rgba(255,255,255,0.1); }

        /* Mobile: single-column name grid */
        .name-grid { display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:10px; }

        /* Desktop overrides */
        @media (min-width:900px) {
          .page      { flex-direction:row; }
          .left      { flex:1; padding:48px; justify-content:space-between; }
          .left-logo { font-size:22px; }
          .step-title { font-size:26px; margin-bottom:6px; }
          .step-sub  { font-size:14px; margin-bottom:20px; }
          .demo-card { padding:20px; margin-bottom:24px; }
          .right     { width:460px; flex-shrink:0; padding:48px 52px; border-top:none; border-left:1px solid rgba(255,255,255,0.06); }
          .form-logo { display:block; }
          .name-grid { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className="page">

        {/* ── LEFT PANEL ── */}
        <div className="left">
          {/* Grid bg */}
          <div style={{ position:'absolute', inset:0, zIndex:0, backgroundImage:`linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`, backgroundSize:'48px 48px', animation:'gridMove 8s linear infinite' }}/>
          <div style={{ position:'absolute', top:'10%', left:'20%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%)', zIndex:0 }}/>
          <div style={{ position:'absolute', bottom:'15%', right:'10%', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,83,0.08) 0%,transparent 70%)', zIndex:0 }}/>

          <div className="left-logo">Onshipy</div>

          {/* Demo section */}
          <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ opacity: stepVisible ? 1 : 0, transform: stepVisible ? 'translateY(0)' : 'translateY(-8px)', transition:'all 0.4s ease' }}>
              <div className="step-badge">
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#fff', animation:'pulse 2s infinite' }}/>
                Step {demoStep + 1} of {DEMO_STEPS.length}
              </div>
              <div className="step-title">{DEMO_STEPS[demoStep].label}</div>
              <div className="step-sub">{DEMO_STEPS[demoStep].sublabel}</div>
            </div>

            <div className="demo-card" style={{ opacity: stepVisible ? 1 : 0, transform: stepVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)', transition:'all 0.4s ease' }}>
              <DemoVisual step={demoStep} />
            </div>

            <div className="step-dots">
              {DEMO_STEPS.map((_, i) => (
                <div key={i} className={`step-dot${demoStep === i ? ' active' : ''}`} onClick={() => setDemoStep(i)}/>
              ))}
            </div>
          </div>

          {/* Live notifications */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="live-label">
              <span className="pulse-dot"/> Live activity
            </div>
            <div className="notif-list">
              {notifs.slice(0, 3).map(n => {
                const isProfit = n.action === 'profit';
                const isSold   = n.action === 'sold';
                const bg = isProfit
                  ? 'linear-gradient(135deg,#00c853,#69f0ae)'
                  : isSold
                  ? 'linear-gradient(135deg,#2979ff,#82b1ff)'
                  : 'linear-gradient(135deg,#ff6d00,#ffab40)';
                return (
                  <div key={n.id} className="notif">
                    <div style={{ width:28, height:28, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>
                      {isProfit ? '💰' : isSold ? '🛍️' : '🔗'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:5 }}>
                        <span>{n.flag}</span>
                        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.user}</span>
                        {isProfit && <span style={{ color:'#69f0ae', fontWeight:700 }}>{n.profit}</span>}
                      </div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.45)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {isProfit ? 'profit made' : isSold ? `sold ${n.item} ${n.profit}` : `imported ${n.item}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div className="right">
          <div className="form-box">

            <div className="form-logo">Onshipy</div>

            <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:5, letterSpacing:'-0.5px' }}>Start for free</h1>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:22 }}>Sell anything from anywhere. No inventory needed.</p>

            <button className="g-btn" onClick={() => window.location.href = `${API_BASE}/api/auth/google`} style={{ marginBottom:18 }}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }}/>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>or with email</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }}/>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="name-grid">
                <div>
                  <label className="lbl">Full name</label>
                  <input className="inp" required placeholder="Your name" value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}/>
                </div>
                <div>
                  <label className="lbl">Store name</label>
                  <input className="inp" required placeholder="My Store" value={form.store_name}
                    onChange={e => setForm({ ...form, store_name: e.target.value })}/>
                </div>
              </div>

              <div style={{ marginBottom:10 }}>
                <label className="lbl">Email</label>
                <input className="inp" type="email" required placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}/>
              </div>

              <div style={{ marginBottom:18 }}>
                <label className="lbl">Password</label>
                <input className="inp" type="password" required placeholder="Min 8 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}/>
              </div>

              {error && (
                <div style={{ padding:'9px 13px', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.3)', borderRadius:8, marginBottom:14, fontSize:13, color:'#f87171' }}>
                  {error}
                </div>
              )}

              <button className="sub-btn" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create free account'}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'rgba(255,255,255,0.3)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color:'#fff', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
            </p>

            <p style={{ fontSize:10, color:'rgba(255,255,255,0.18)', textAlign:'center', marginTop:16, lineHeight:1.6 }}>
              By signing up you agree to our{' '}
              <a href="#" style={{ color:'rgba(255,255,255,0.32)' }}>Terms</a> &{' '}
              <a href="#" style={{ color:'rgba(255,255,255,0.32)' }}>Privacy Policy</a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
