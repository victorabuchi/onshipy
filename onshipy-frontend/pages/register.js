import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Live activity notifications ───────────────────────────────────────────────
const ACTIVITIES = [
  { user: 'Cole M.', action: 'imported', item: 'Nike Air Max 270', profit: null, flag: '🇺🇸', time: '2s ago' },
  { user: 'Jessie K.', action: 'profit', item: null, profit: '+$350', flag: '🇬🇧', time: '5s ago' },
  { user: 'Amara T.', action: 'imported', item: 'Adidas Ultraboost 22', profit: null, flag: '🇳🇬', time: '8s ago' },
  { user: 'Riku S.', action: 'sold', item: 'Zara Linen Blazer', profit: '+$94', flag: '🇫🇮', time: '12s ago' },
  { user: 'Sofia R.', action: 'profit', item: null, profit: '+$212', flag: '🇪🇸', time: '15s ago' },
  { user: 'Liam O.', action: 'imported', item: 'Apple AirPods Pro', profit: null, flag: '🇨🇦', time: '18s ago' },
  { user: 'Yuki N.', action: 'sold', item: 'ASOS Floral Dress', profit: '+$67', flag: '🇯🇵', time: '22s ago' },
  { user: 'Diego M.', action: 'profit', item: null, profit: '+$489', flag: '🇧🇷', time: '30s ago' },
  { user: 'Priya L.', action: 'imported', item: 'Gucci GG Belt', profit: null, flag: '🇮🇳', time: '35s ago' },
  { user: 'Noah B.', action: 'sold', item: 'New Balance 550', profit: '+$130', flag: '🇿🇦', time: '41s ago' },
  { user: 'Lea V.', action: 'profit', item: null, profit: '+$78', flag: '🇩🇪', time: '45s ago' },
  { user: 'Marcus J.', action: 'imported', item: 'Jordan 1 Retro High', profit: null, flag: '🇺🇸', time: '50s ago' },
];

// ── Demo steps for the animated flow ─────────────────────────────────────────
const DEMO_STEPS = [
  {
    id: 0,
    label: 'Copy any product link',
    sublabel: 'From Nike, ASOS, Amazon, Zara & 1000+ stores',
    visual: 'copy',
  },
  {
    id: 1,
    label: 'Import in one click',
    sublabel: 'Onshipy scrapes title, price, images instantly',
    visual: 'import',
  },
  {
    id: 2,
    label: 'Set your selling price',
    sublabel: 'Choose your markup — see profit in real time',
    visual: 'price',
  },
  {
    id: 3,
    label: 'Push to your store',
    sublabel: 'One click to Shopify, WooCommerce & more',
    visual: 'push',
  },
  {
    id: 4,
    label: 'Customer buys. You profit.',
    sublabel: 'We auto-purchase & ship. Zero effort.',
    visual: 'profit',
  },
];

// ── Notification pill ─────────────────────────────────────────────────────────
function NotifPill({ item, visible }) {
  const isProfit = item.action === 'profit';
  const isSold = item.action === 'sold';
  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(12px)',
      borderRadius: 12, padding: '10px 14px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-30px)',
      transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      minWidth: 260, maxWidth: 300,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: isProfit ? 'linear-gradient(135deg,#00c853,#69f0ae)' :
                    isSold ? 'linear-gradient(135deg,#2979ff,#82b1ff)' :
                    'linear-gradient(135deg,#ff6d00,#ffab40)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0, fontWeight: 700,
      }}>
        {isProfit ? '💰' : isSold ? '🛍️' : '🔗'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>{item.flag}</span>
          <span>{item.user}</span>
          {isProfit && (
            <span style={{ color: '#69f0ae', fontWeight: 700 }}>{item.profit}</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isProfit ? 'profit made' : isSold ? `sold ${item.item} ${item.profit}` : `imported ${item.item}`}
        </div>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{item.time}</div>
      {isProfit && (
        <div style={{
          position: 'absolute', top: -1, left: -1, right: -1, bottom: -1,
          borderRadius: 12, border: '1px solid rgba(105,240,174,0.3)',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

// ── Demo visual components ────────────────────────────────────────────────────
function DemoVisual({ step }) {
  const [typed, setTyped] = useState('');
  const [showCheck, setShowCheck] = useState(false);
  const url = 'https://nike.com/t/air-max-270';

  useEffect(() => {
    setTyped('');
    setShowCheck(false);
    if (step === 0) {
      let i = 0;
      const iv = setInterval(() => {
        setTyped(url.slice(0, i + 1));
        i++;
        if (i >= url.length) {
          clearInterval(iv);
          setTimeout(() => setShowCheck(true), 300);
        }
      }, 40);
      return () => clearInterval(iv);
    }
  }, [step]);

  if (step === 0) return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Product URL</div>
      <div style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10
      }}>
        <span style={{ fontSize: 16 }}>🔗</span>
        <span style={{ fontSize: 13, color: '#fff', flex: 1, fontFamily: 'monospace', letterSpacing: '-0.3px' }}>
          {typed}<span style={{ opacity: 0.5, animation: 'blink 1s infinite' }}>|</span>
        </span>
        {showCheck && (
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#00c853',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            animation: 'popIn 0.3s ease'
          }}>✓</div>
        )}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['nike.com', 'asos.com', 'amazon.com', 'zara.com', '+1000 more'].map((s, i) => (
          <span key={i} style={{
            padding: '4px 10px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
            fontSize: 11, color: 'rgba(255,255,255,0.5)'
          }}>{s}</span>
        ))}
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
          background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
        }}>👟</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>Nike Air Max 270</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>nike.com · 8 images · 6 variants</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['EU 40','EU 41','EU 42','EU 43'].map(s => (
              <span key={s} style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11, color: '#fff' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
        {[
          { label: 'Source price', val: '€120.00', color: 'rgba(255,255,255,0.5)' },
          { label: 'Images', val: '8', color: 'rgba(255,255,255,0.5)' },
          { label: 'Status', val: '✓ Imported', color: '#69f0ae' },
        ].map((m, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>You pay</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>€120</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 20 }}>→</div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Customer pays</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>€185</div>
        </div>
      </div>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,200,83,0.15), rgba(105,240,174,0.08))',
        border: '1px solid rgba(0,200,83,0.3)', borderRadius: 10, padding: '14px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Your profit per sale</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#69f0ae' }}>+€65</div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#69f0ae' }}>35%</div>
          <div>margin</div>
        </div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Push to your store</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'Shopify', color: '#95BF47', status: 'Connected ✓' },
          { name: 'WooCommerce', color: '#7F54B3', status: 'Coming soon' },
          { name: 'Etsy', color: '#F45800', status: 'Coming soon' },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px',
            border: i === 0 ? '1px solid rgba(149,191,71,0.4)' : '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{s.name}</span>
            </div>
            <span style={{ fontSize: 11, color: i === 0 ? '#95BF47' : 'rgba(255,255,255,0.3)' }}>{s.status}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, background: '#95BF47', borderRadius: 8, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
        Push Nike Air Max 270 →
      </div>
    </div>
  );

  if (step === 4) return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Order received!</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Onshipy auto-purchased & shipped it. You did nothing.</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8
      }}>
        {[
          { label: 'You paid', val: '€120', color: '#fff' },
          { label: 'Customer paid', val: '€185', color: '#fff' },
          { label: 'Your profit', val: '+€65', color: '#69f0ae' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 8px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

// ── Main register page ────────────────────────────────────────────────────────
export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', store_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo animation
  const [demoStep, setDemoStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);

  // Live notifications
  const [notifs, setNotifs] = useState([]);
  const [notifQueue, setNotifQueue] = useState([...ACTIVITIES]);
  const notifRef = useRef(null);

  // Cycle demo steps
  useEffect(() => {
    const iv = setInterval(() => {
      setStepVisible(false);
      setTimeout(() => {
        setDemoStep(s => (s + 1) % DEMO_STEPS.length);
        setStepVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  // Pop notifications
  useEffect(() => {
    const pop = () => {
      const queue = [...ACTIVITIES].sort(() => Math.random() - 0.5);
      let idx = 0;
      const iv = setInterval(() => {
        const item = queue[idx % queue.length];
        idx++;
        setNotifs(prev => {
          const next = [{ ...item, id: Date.now() }, ...prev].slice(0, 4);
          return next;
        });
      }, 2800);
      return iv;
    };
    const iv = pop();
    return () => clearInterval(iv);
  }, []);

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
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      localStorage.setItem('onshipy_token', data.token);
      localStorage.setItem('onshipy_seller', JSON.stringify(data.seller));
      router.push('/dashboard');
    } catch { setError('Cannot connect to server.'); setLoading(false); }
  };

  const handleGoogle = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100vh; background: #050509; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes popIn { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes floatUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes gridMove { from{transform:translateY(0)} to{transform:translateY(40px)} }
        .inp {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; font-size: 14px; outline: none;
          color: #fff; font-family: 'Sora', sans-serif;
          transition: border-color 0.2s, background 0.2s;
        }
        .inp::placeholder { color: rgba(255,255,255,0.25); }
        .inp:focus { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.08); }
        .page { display: flex; min-height: 100vh; font-family: 'Sora', sans-serif; }
        .left { flex: 1; position: relative; overflow: hidden; display: none; padding: 48px; flex-direction: column; justify-content: space-between; }
        .right { width: 100%; display: flex; align-items: center; justify-content: center; padding: 32px 24px; min-height: 100vh; }
        .form-box { width: 100%; max-width: 400px; }
        .sub-btn { width: 100%; padding: 13px; background: #fff; color: #050509; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Sora',sans-serif; transition: opacity 0.15s, transform 0.15s; }
        .sub-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .sub-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .g-btn { width: 100%; padding: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-family: 'Sora',sans-serif; transition: background 0.15s; }
        .g-btn:hover { background: rgba(255,255,255,0.1); }
        .step-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.2); transition: all 0.3s; cursor: pointer; }
        .step-dot.active { background: #fff; width: 24px; border-radius: 4px; }
        @media (min-width: 900px) {
          .left { display: flex; }
          .right { width: 460px; flex-shrink: 0; padding: 48px 52px; }
        }
        @media (max-width: 480px) {
          .right { align-items: flex-start; padding-top: 40px; }
        }
      `}</style>

      <div className="page">

        {/* ── LEFT — Demo + notifications ──────────────────────────────────── */}
        <div className="left" style={{ background: '#050509' }}>

          {/* Animated grid background */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            animation: 'gridMove 8s linear infinite',
          }} />

          {/* Glow blobs */}
          <div style={{ position: 'absolute', top: '10%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,83,0.08) 0%, transparent 70%)', zIndex: 0 }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Onshipy</div>
          </div>

          {/* Center demo card */}
          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>

            {/* Step label */}
            <div style={{
              opacity: stepVisible ? 1 : 0,
              transform: stepVisible ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.4s ease',
              marginBottom: 24,
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 12px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
                fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 12,
                textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 2s infinite' }} />
                Step {demoStep + 1} of {DEMO_STEPS.length}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
                {DEMO_STEPS[demoStep].label}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
                {DEMO_STEPS[demoStep].sublabel}
              </div>
            </div>

            {/* Demo visual */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 20,
              opacity: stepVisible ? 1 : 0,
              transform: stepVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
              transition: 'all 0.4s ease',
              marginBottom: 24,
            }}>
              <DemoVisual step={demoStep} />
            </div>

            {/* Step dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              {DEMO_STEPS.map((_, i) => (
                <div key={i} className={`step-dot${demoStep === i ? ' active' : ''}`}
                  onClick={() => setDemoStep(i)} />
              ))}
            </div>
          </div>

          {/* Live notifications */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c853', animation: 'pulse 1.5s infinite' }} />
              Live activity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {notifs.slice(0, 3).map((n, i) => (
                <NotifPill key={n.id} item={n} visible={true} />
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT — Register form ─────────────────────────────────────────── */}
        <div className="right" style={{ background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="form-box">

            {/* Mobile logo */}
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 28, display: 'block' }}>
              Onshipy
            </div>

            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>
                Start for free
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                Sell anything from anywhere. No inventory needed.
              </p>
            </div>

            {/* Google */}
            <button className="g-btn" onClick={handleGoogle} style={{ marginBottom: 20 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full name</label>
                  <input className="inp" required placeholder="Victor Abuchi" value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store name</label>
                  <input className="inp" required placeholder="My Store" value={form.store_name}
                    onChange={e => setForm({ ...form, store_name: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                <input className="inp" type="email" required placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <input className="inp" type="password" required placeholder="Min 8 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', background: 'rgba(220,38,38,0.1)',
                  border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8,
                  marginBottom: 14, fontSize: 13, color: '#f87171'
                }}>{error}</div>
              )}

              <button className="sub-btn" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create free account →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
              By signing up you agree to our{' '}
              <a href="#" style={{ color: 'rgba(255,255,255,0.35)' }}>Terms</a> &{' '}
              <a href="#" style={{ color: 'rgba(255,255,255,0.35)' }}>Privacy Policy</a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}