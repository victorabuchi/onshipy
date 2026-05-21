import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Realistic activity feed ─────────────────────────────────────────────────
const ACTIVITIES = [
  { user: 'Cole M.',   country: 'US', action: 'imported', item: 'Nike Air Max 270',       price: '$119',  profit: null,    time: '2s ago'  },
  { user: 'Jessie K.', country: 'GB', action: 'sale',     item: 'Adidas Ultraboost 23',   price: '$185',  profit: '+$62',  time: '14s ago' },
  { user: 'Amara T.',  country: 'NG', action: 'imported', item: 'Gucci GG Belt',           price: '$420',  profit: null,    time: '31s ago' },
  { user: 'Riku S.',   country: 'JP', action: 'sale',     item: 'Zara Linen Blazer',       price: '$149',  profit: '+$51',  time: '48s ago' },
  { user: 'Sofia R.',  country: 'ES', action: 'sale',     item: 'New Balance 550',         price: '$110',  profit: '+$38',  time: '1m ago'  },
  { user: 'Liam O.',   country: 'CA', action: 'imported', item: 'Apple AirPods Pro 2',     price: '$249',  profit: null,    time: '1m ago'  },
  { user: 'Yuki N.',   country: 'JP', action: 'sale',     item: 'ASOS Ribbed Dress',       price: '$79',   profit: '+$27',  time: '2m ago'  },
  { user: 'Diego M.',  country: 'BR', action: 'sale',     item: 'Jordan 1 Retro High OG',  price: '$280',  profit: '+$94',  time: '2m ago'  },
  { user: 'Priya L.',  country: 'IN', action: 'imported', item: 'Balenciaga Triple S',     price: '$895',  profit: null,    time: '3m ago'  },
  { user: 'Noah B.',   country: 'ZA', action: 'sale',     item: 'Puma Suede Classic',      price: '$89',   profit: '+$29',  time: '3m ago'  },
  { user: 'Lea V.',    country: 'DE', action: 'imported', item: 'Supreme Box Logo Tee',    price: '$198',  profit: null,    time: '4m ago'  },
  { user: 'Marcus J.', country: 'US', action: 'sale',     item: 'Off-White Zip Hoodie',    price: '$450',  profit: '+$148', time: '4m ago'  },
];

const COUNTRY_FLAGS = { US:'🇺🇸', GB:'🇬🇧', NG:'🇳🇬', JP:'🇯🇵', ES:'🇪🇸', CA:'🇨🇦', BR:'🇧🇷', IN:'🇮🇳', ZA:'🇿🇦', DE:'🇩🇪', FI:'🇫🇮' };

// ── Demo steps ───────────────────────────────────────────────────────────────
const DEMO_STEPS = [
  { id: 0, label: 'Copy any product link',      sublabel: 'From Nike, ASOS, Amazon, Zara & 1000+ stores', visual: 'copy'   },
  { id: 1, label: 'Import in one click',        sublabel: 'Onshipy scrapes title, price, images instantly', visual: 'import' },
  { id: 2, label: 'Set your selling price',     sublabel: 'Choose your markup — see profit in real time',   visual: 'price'  },
  { id: 3, label: 'Push to your store',         sublabel: 'One click to Shopify, WooCommerce & more',       visual: 'push'   },
  { id: 4, label: 'Customer buys. You profit.', sublabel: 'We auto-purchase & ship. Zero effort.',          visual: 'profit' },
];

// ── Country codes for phone picker ───────────────────────────────────────────
const COUNTRY_CODES = [
  { code: 'US', dial: '+1',  label: 'US +1'  },
  { code: 'GB', dial: '+44', label: 'GB +44' },
  { code: 'CA', dial: '+1',  label: 'CA +1'  },
  { code: 'NG', dial: '+234',label: 'NG +234'},
  { code: 'GH', dial: '+233',label: 'GH +233'},
  { code: 'ZA', dial: '+27', label: 'ZA +27' },
  { code: 'AU', dial: '+61', label: 'AU +61' },
  { code: 'DE', dial: '+49', label: 'DE +49' },
  { code: 'FR', dial: '+33', label: 'FR +33' },
  { code: 'IN', dial: '+91', label: 'IN +91' },
  { code: 'JP', dial: '+81', label: 'JP +81' },
  { code: 'BR', dial: '+55', label: 'BR +55' },
  { code: 'MX', dial: '+52', label: 'MX +52' },
  { code: 'AE', dial: '+971',label: 'AE +971'},
];

function DemoVisual({ step }) {
  const [typed, setTyped]         = useState('');
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
    <div style={{ width:'100%' }}>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.1em' }}>Product URL</div>
      <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
        <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        <span style={{ fontSize:12, color:'#fff', flex:1, fontFamily:'monospace' }}>{typed}<span style={{ opacity:0.5 }}>|</span></span>
        {showCheck && <div style={{ width:20, height:20, borderRadius:'50%', background:'#00c853', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>}
      </div>
      <div style={{ marginTop:10, display:'flex', gap:5, flexWrap:'wrap' }}>
        {['nike.com','asos.com','amazon.com','zara.com','+1000 stores'].map((s,i) => (
          <span key={i} style={{ padding:'3px 9px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, fontSize:10, color:'rgba(255,255,255,0.45)' }}>{s}</span>
        ))}
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ width:64, height:64, borderRadius:10, flexShrink:0, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          <img src="/nike-shoe.svg" alt="Nike shoe" style={{ width:52, height:52, objectFit:'contain' }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="font-size:28px">👟</span>'; }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:'#fff', marginBottom:3 }}>Nike Air Max 270</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:8 }}>nike.com · 8 images scraped</div>
          <div style={{ display:'flex', gap:6 }}>
            {[{ label:'Source price', val:'€120', color:'rgba(255,255,255,0.7)' },{ label:'Status', val:'Imported', color:'#69f0ae' }].map((m,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.05)', borderRadius:7, padding:'6px 9px' }}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginBottom:2 }}>{m.label}</div>
                <div style={{ fontSize:12, fontWeight:600, color:m.color }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        {[{ label:'You pay', val:'€120', sub:'source price' },{ label:'Customer pays', val:'€185', sub:'your listing' }].map((c,i) => (
          <div key={i} style={{ flex:1, background:'rgba(255,255,255,0.05)', borderRadius:9, padding:'10px 12px' }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:'#fff' }}>{c.val}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(0,200,83,0.08)', border:'1px solid rgba(0,200,83,0.25)', borderRadius:9, padding:'11px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:2 }}>Your profit per sale</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#69f0ae' }}>+€65</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#69f0ae' }}>35%</div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>margin</div>
        </div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div style={{ width:'100%' }}>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Sales channels</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {[
          { name:'Shopify',     color:'#95BF47', connected:true  },
          { name:'WooCommerce', color:'#7F54B3', connected:false },
          { name:'Etsy',        color:'#F45800', connected:false },
        ].map((s,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'9px 12px', border:i===0?'1px solid rgba(149,191,71,0.3)':'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:s.color }}/>
              <span style={{ fontSize:12, color:'#fff', fontWeight:500 }}>{s.name}</span>
            </div>
            <span style={{ fontSize:10, color:s.connected?'#95BF47':'rgba(255,255,255,0.25)', fontWeight:s.connected?600:400 }}>
              {s.connected ? 'Connected' : 'Coming soon'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 4) return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(0,200,83,0.06)', border:'1px solid rgba(0,200,83,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:'rgba(0,200,83,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="#69f0ae"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm4.78 6.97-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L8.75 11.94l4.97-4.97a.75.75 0 0 1 1.06 1.06Z"/></svg>
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>Order received & fulfilled</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:1 }}>Auto-purchased and shipped. You did nothing.</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7 }}>
        {[{ label:'You paid', val:'€120', color:'rgba(255,255,255,0.7)' },{ label:'Customer paid', val:'€185', color:'rgba(255,255,255,0.7)' },{ label:'Your profit', val:'+€65', color:'#69f0ae' }].map((s,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'9px 8px', border:i===2?'1px solid rgba(0,200,83,0.2)':'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginBottom:3 }}>{s.label}</div>
            <div style={{ fontSize:13, fontWeight:700, color:s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}

export default function Register() {
  const router = useRouter();
  const [tab, setTab]             = useState('signup'); // 'login' | 'signup'
  const [form, setForm]           = useState({ full_name:'', email:'', password:'', confirmPassword:'', store_name:'', phone:'' });
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0]);
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [demoStep, setDemoStep]   = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [notifs, setNotifs]       = useState([]);

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
    const show = () => {
      const item = queue[idx % queue.length]; idx++;
      setNotifs(prev => [{ ...item, id: Date.now() }, ...prev].slice(0, 3));
    };
    show();
    const iv = setInterval(show, 3200);
    return () => clearInterval(iv);
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!agreedToTerms) { setError('Please agree to the Terms of Service and Privacy Policy.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          full_name:  form.full_name,
          email:      form.email,
          password:   form.password,
          store_name: form.store_name || form.full_name + "'s Store",
          phone:      countryCode.dial + form.phone,
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
        <title>Create account - Onshipy</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { width:100%; min-height:100vh; background:#050509; font-family:'Sora',sans-serif; -webkit-font-smoothing:antialiased; }

        @keyframes gridMove { from{transform:translateY(0)} to{transform:translateY(40px)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .page { display:flex; flex-direction:column; min-height:100vh; }

        /* ── Left panel ── */
        .left {
          display:flex; flex-direction:column; position:relative;
          overflow:hidden; background:#050509; padding:24px 20px 20px;
        }
        .left-logo   { font-size:18px; font-weight:800; color:#fff; margin-bottom:18px; position:relative; z-index:1; letter-spacing:-0.5px; }
        .step-badge  { display:inline-flex; align-items:center; gap:7px; padding:4px 11px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:20px; font-size:10px; color:rgba(255,255,255,0.45); text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; }
        .step-title  { font-size:20px; font-weight:800; color:#fff; line-height:1.2; margin-bottom:4px; letter-spacing:-0.5px; }
        .step-sub    { font-size:12px; color:rgba(255,255,255,0.42); margin-bottom:14px; line-height:1.5; }
        .demo-card   { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; margin-bottom:14px; }
        .step-dots   { display:flex; gap:5px; margin-bottom:18px; }
        .step-dot    { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,0.18); transition:all .3s; cursor:pointer; }
        .step-dot.active { background:#fff; width:20px; border-radius:4px; }

        /* ── Realistic activity feed ── */
        .live-label { font-size:10px; color:rgba(255,255,255,0.28); text-transform:uppercase; letter-spacing:.09em; display:flex; align-items:center; gap:6px; margin-bottom:8px; }
        .pulse-dot  { width:6px; height:6px; border-radius:50%; background:#00c853; display:inline-block; animation:pulse 1.5s infinite; flex-shrink:0; }
        .notif-list { display:flex; flex-direction:column; gap:5px; }
        .notif-row  { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:9px; padding:9px 12px; animation:slideUp .35s ease; }

        /* ── Right panel (form) ── */
        .right {
          display:flex; align-items:flex-start; justify-content:center;
          padding:24px 20px 40px; background:#0a0a0f;
          border-top:1px solid rgba(255,255,255,0.06);
        }
        .form-box  { width:100%; max-width:400px; }
        .form-logo { font-size:18px; font-weight:800; color:#fff; margin-bottom:22px; display:none; letter-spacing:-0.5px; }

        /* tabs */
        .tab-bar { display:flex; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:22px; }
        .tab-btn { flex:1; padding:10px 0; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; font-family:'Sora',sans-serif; font-size:13px; font-weight:600; color:rgba(255,255,255,0.35); transition:color .15s,border-color .15s; margin-bottom:-1px; }
        .tab-btn.active { color:#fff; border-bottom-color:#fff; }

        /* section label */
        .sec-label { font-size:9px; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:.1em; margin-bottom:10px; padding:0 1px; display:flex; align-items:center; gap:7px; }
        .sec-label::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.07); }

        /* inputs */
        .inp { width:100%; padding:10px 12px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; font-size:13px; outline:none; color:#fff; font-family:'Sora',sans-serif; transition:border-color .2s,background .2s; }
        .inp::placeholder { color:rgba(255,255,255,0.2); }
        .inp:focus { border-color:rgba(255,255,255,0.25); background:rgba(255,255,255,0.07); }
        .lbl { font-size:10px; font-weight:600; color:rgba(255,255,255,0.4); display:flex; align-items:center; gap:5px; margin-bottom:5px; letter-spacing:.03em; }
        .field { margin-bottom:10px; }

        /* phone row */
        .phone-row { display:flex; gap:6px; }
        .cc-select { padding:10px 8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; font-size:12px; color:#fff; font-family:'Sora',sans-serif; outline:none; cursor:pointer; flex-shrink:0; width:88px; appearance:none; -webkit-appearance:none; }
        .cc-select option { background:#1a1a2e; color:#fff; }

        /* password wrapper */
        .pass-wrap { position:relative; }
        .pass-wrap .inp { padding-right:38px; }
        .pass-eye { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.3); display:flex; padding:4px; }
        .pass-eye:hover { color:rgba(255,255,255,0.6); }

        /* terms */
        .terms-row { display:flex; align-items:flex-start; gap:9px; margin:14px 0; }
        .terms-check { width:16px; height:16px; border-radius:4px; border:1.5px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.04); cursor:pointer; flex-shrink:0; margin-top:1px; display:flex; align-items:center; justify-content:center; transition:border-color .15s,background .15s; }
        .terms-check.checked { background:rgba(255,255,255,0.9); border-color:rgba(255,255,255,0.9); }

        .sub-btn { width:100%; padding:12px; background:#fff; color:#050509; border:none; border-radius:9px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Sora',sans-serif; transition:opacity .15s,transform .15s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .sub-btn:hover:not(:disabled) { opacity:.92; transform:translateY(-1px); }
        .sub-btn:disabled { opacity:.35; cursor:not-allowed; }
        .g-btn { width:100%; padding:11px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.11); border-radius:9px; color:#fff; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; font-family:'Sora',sans-serif; transition:background .15s; }
        .g-btn:hover { background:rgba(255,255,255,0.09); }

        /* Desktop */
        @media (min-width:900px) {
          .page       { flex-direction:row; }
          .left       { flex:1; padding:48px; justify-content:space-between; }
          .left-logo  { font-size:22px; }
          .step-title { font-size:26px; margin-bottom:6px; }
          .step-sub   { font-size:13px; margin-bottom:20px; }
          .demo-card  { padding:20px; margin-bottom:24px; }
          .right      { width:460px; flex-shrink:0; padding:48px 52px; border-top:none; border-left:1px solid rgba(255,255,255,0.06); align-items:center; }
          .form-logo  { display:block; }
        }

        @media (max-width:899px) {
          .left { min-height:auto; }
        }
      `}</style>

      <div className="page">

        {/* ── LEFT PANEL ── */}
        <div className="left">
          {/* bg effects */}
          <div style={{ position:'absolute', inset:0, zIndex:0, backgroundImage:`linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`, backgroundSize:'48px 48px', animation:'gridMove 8s linear infinite' }}/>
          <div style={{ position:'absolute', top:'8%', left:'15%', width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,255,255,0.035) 0%,transparent 70%)', zIndex:0, pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:'18%', right:'8%', width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,83,0.07) 0%,transparent 70%)', zIndex:0, pointerEvents:'none' }}/>

          <div className="left-logo">Onshipy</div>

          {/* Demo section */}
          <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ opacity:stepVisible?1:0, transform:stepVisible?'translateY(0)':'translateY(-8px)', transition:'all 0.4s ease' }}>
              <div className="step-badge">
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#fff', animation:'pulse 2s infinite', flexShrink:0 }}/>
                Step {demoStep + 1} of {DEMO_STEPS.length}
              </div>
              <div className="step-title">{DEMO_STEPS[demoStep].label}</div>
              <div className="step-sub">{DEMO_STEPS[demoStep].sublabel}</div>
            </div>

            <div className="demo-card" style={{ opacity:stepVisible?1:0, transform:stepVisible?'translateY(0) scale(1)':'translateY(8px) scale(0.98)', transition:'all 0.4s ease' }}>
              <DemoVisual step={demoStep} />
            </div>

            <div className="step-dots">
              {DEMO_STEPS.map((_,i) => (
                <div key={i} className={`step-dot${demoStep===i?' active':''}`} onClick={() => setDemoStep(i)} />
              ))}
            </div>
          </div>

          {/* Realistic live activity feed */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div className="live-label">
              <span className="pulse-dot"/> Live activity
            </div>
            <div className="notif-list">
              {notifs.map(n => (
                <div key={n.id} className="notif-row">
                  {/* Avatar circle with initials */}
                  <div style={{ width:30, height:30, borderRadius:'50%', background: n.action==='sale' ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.07)', border: n.action==='sale' ? '1px solid rgba(0,200,83,0.25)' : '1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:10, fontWeight:700, color: n.action==='sale' ? '#69f0ae' : 'rgba(255,255,255,0.7)' }}>
                    {n.user.split(' ').map(w=>w[0]).join('')}
                  </div>
                  {/* Content */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#fff' }}>{n.user}</span>
                      <span style={{ fontSize:11 }}>{COUNTRY_FLAGS[n.country] || ''}</span>
                      <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,0.25)', flexShrink:0 }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {n.action === 'sale'
                        ? <><span style={{ color:'#69f0ae', fontWeight:600 }}>{n.profit}</span> · sold {n.item}</>
                        : <>Imported {n.item} · <span style={{ color:'rgba(255,255,255,0.55)' }}>{n.price}</span></>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div className="right">
          <div className="form-box">

            <div className="form-logo">Onshipy</div>

            {/* LOGIN / SIGN UP tabs */}
            <div className="tab-bar">
              <button className={`tab-btn${tab==='login'?' active':''}`} onClick={() => router.push('/login')}>Login</button>
              <button className={`tab-btn${tab==='signup'?' active':''}`} onClick={() => setTab('signup')}>Sign Up</button>
            </div>

            {/* Google SSO */}
            <button className="g-btn" onClick={() => window.location.href = `${API_BASE}/api/auth/google`} style={{ marginBottom:18 }}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'14px 0 18px' }}>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.22)' }}>or with email</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.07)' }}/>
            </div>

            <form onSubmit={handleSubmit}>

              {/* ── ACCOUNT section ── */}
              <div className="sec-label">Account</div>

              <div className="field">
                <label className="lbl">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>
                  Full name
                </label>
                <input className="inp" required placeholder="Your full name" value={form.full_name}
                  onChange={e => setForm({...form, full_name:e.target.value})} />
              </div>

              <div className="field">
                <label className="lbl">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                  Email address
                </label>
                <input className="inp" type="email" required placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})} />
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.22)', marginTop:4 }}>OTP verification will be sent to this address</div>
              </div>

              {/* ── PHONE section ── */}
              <div className="sec-label" style={{ marginTop:16 }}>Phone</div>

              <div className="field">
                <label className="lbl">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6.6 10.8a15.05 15.05 0 006.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.36.03.74-.26 1.03l-2.21 2.2z"/></svg>
                  Phone number
                </label>
                <div className="phone-row">
                  <select className="cc-select" value={countryCode.code}
                    onChange={e => setCountryCode(COUNTRY_CODES.find(c=>c.code===e.target.value) || COUNTRY_CODES[0])}>
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                  <input className="inp" type="tel" placeholder="8012345678" value={form.phone}
                    onChange={e => setForm({...form, phone:e.target.value.replace(/\D/g,'')})} style={{ flex:1 }} />
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.22)', marginTop:4 }}>
                  {countryCode.dial === '+1' ? 'United States / Canada (+1)' : `${countryCode.code} (${countryCode.dial})`} — required for payments
                </div>
              </div>

              {/* ── SECURITY section ── */}
              <div className="sec-label" style={{ marginTop:16 }}>Security</div>

              <div className="field">
                <label className="lbl">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Password
                </label>
                <div className="pass-wrap">
                  <input className="inp" type={showPass?'text':'password'} required minLength={8} placeholder="Min. 8 characters" value={form.password}
                    onChange={e => setForm({...form, password:e.target.value})} />
                  <button type="button" className="pass-eye" onClick={() => setShowPass(v=>!v)}>
                    {showPass
                      ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="lbl">
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Confirm password
                </label>
                <div className="pass-wrap">
                  <input className="inp" type={showConfirm?'text':'password'} required placeholder="Repeat password" value={form.confirmPassword}
                    onChange={e => setForm({...form, confirmPassword:e.target.value})} />
                  <button type="button" className="pass-eye" onClick={() => setShowConfirm(v=>!v)}>
                    {showConfirm
                      ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="terms-row">
                <div className={`terms-check${agreedToTerms?' checked':''}`} onClick={() => setAgreedToTerms(v=>!v)}>
                  {agreedToTerms && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#050509" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.5 }}>
                  I agree to the{' '}
                  <a href="#" style={{ color:'rgba(255,255,255,0.65)', textDecoration:'underline' }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" style={{ color:'rgba(255,255,255,0.65)', textDecoration:'underline' }}>Privacy Policy</a>
                </span>
              </div>

              {error && (
                <div style={{ padding:'9px 13px', background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:8, marginBottom:12, fontSize:12, color:'#f87171' }}>
                  {error}
                </div>
              )}

              <button className="sub-btn" type="submit" disabled={loading}>
                {loading
                  ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:'gridMove 0.8s linear infinite' }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg> Creating account…</>
                  : <>→ Create account</>
                }
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:14, fontSize:12, color:'rgba(255,255,255,0.28)' }}>
              Free plan · No credit card required
            </p>

            <p style={{ textAlign:'center', marginTop:10, fontSize:12, color:'rgba(255,255,255,0.28)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color:'rgba(255,255,255,0.7)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  );
}
