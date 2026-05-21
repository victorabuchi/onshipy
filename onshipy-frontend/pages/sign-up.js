import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import AuthNav from '../components/AuthNav';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const ACTIVITIES = [
  { name: 'Marcus J.',  country: 'US', action: 'sale',      item: "Nike Air Force 1 '07",       profit: '+€80',  price: null,    time: '2s ago',  img: 15 },
  { name: 'Amara T.',   country: 'NG', action: 'import',    item: 'Gucci GG Marmont Belt',       profit: null,    price: '€380',  time: '18s ago', img: 44 },
  { name: 'Yuki N.',    country: 'JP', action: 'sale',      item: 'Jordan 1 Retro High OG',      profit: '+€95',  price: null,    time: '35s ago', img: 22 },
  { name: 'Sofia R.',   country: 'ES', action: 'shopify',   item: null,                          profit: null,    price: null,    time: '51s ago', img: 33 },
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

const FLAGS = { US:'🇺🇸', GB:'🇬🇧', NG:'🇳🇬', JP:'🇯🇵', ES:'🇪🇸', CA:'🇨🇦', BR:'🇧🇷', IN:'🇮🇳', ZA:'🇿🇦', DE:'🇩🇪', FI:'🇫🇮', GH:'🇬🇭', AE:'🇦🇪' };

const STEPS = [
  { label: 'Paste any product URL',      sub: 'From Nike, ASOS, Amazon, Zara and 900 more brands', visual: 'copy'   },
  { label: 'Product imported instantly', sub: 'Title, price and images pulled in seconds',          visual: 'import' },
  { label: 'Set your selling price',     sub: 'See your profit in real time before you list it',   visual: 'price'  },
  { label: 'Push to your Shopify store', sub: 'One click publishes the listing to your store',     visual: 'push'   },
  { label: 'Customer buys. You profit.', sub: 'We handle the purchase and shipping automatically', visual: 'profit' },
];

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

function DemoVisual({ step }) {
  const [typed, setTyped]   = useState('');
  const [showOk, setShowOk] = useState(false);
  const url = 'https://nike.com/t/air-force-1-07';

  useEffect(() => {
    setTyped(''); setShowOk(false);
    if (step !== 0) return;
    let i = 0;
    const iv = setInterval(() => {
      setTyped(url.slice(0, i + 1)); i++;
      if (i >= url.length) { clearInterval(iv); setTimeout(() => setShowOk(true), 350); }
    }, 38);
    return () => clearInterval(iv);
  }, [step]);

  const dimText = 'rgba(255,255,255,0.38)';
  const dimBg   = 'rgba(255,255,255,0.05)';
  const dimBd   = 'rgba(255,255,255,0.08)';

  if (step === 0) return (
    <div style={{ width:'100%' }}>
      <div style={{ fontSize:9, color:dimText, marginBottom:5, textTransform:'uppercase', letterSpacing:'0.1em' }}>Product URL</div>
      <div style={{ background:dimBg, border:`1px solid ${dimBd}`, borderRadius:9, padding:'9px 12px', display:'flex', alignItems:'center', gap:8 }}>
        <svg width="13" height="13" fill="none" stroke={dimText} strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        <span style={{ fontSize:12, color:'#fff', flex:1, fontFamily:'monospace', letterSpacing:-0.3 }}>{typed}<span style={{ opacity:0.4 }}>|</span></span>
        {showOk && <div style={{ width:18, height:18, borderRadius:'50%', background:'#00b86c', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>}
      </div>
      <div style={{ marginTop:9, display:'flex', gap:5, flexWrap:'wrap' }}>
        {['nike.com','asos.com','amazon.com','zara.com','+900 brands'].map((s,i) => (
          <span key={i} style={{ padding:'2px 8px', background:dimBg, border:`1px solid ${dimBd}`, borderRadius:20, fontSize:9, color:dimText }}>{s}</span>
        ))}
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={{ flex:1 }}>
      <div style={{ fontWeight:700, fontSize:13, color:'#fff', marginBottom:2 }}>Nike Air Force 1 &apos;07 Men&apos;s Shoes</div>
      <div style={{ fontSize:10, color:dimText, marginBottom:10 }}>nike.com · 9 images scraped</div>
      <div style={{ display:'flex', gap:6 }}>
        {[{ l:'Source price', v:'€119.99', c:'rgba(255,255,255,0.75)' },{ l:'Status', v:'Imported', c:'#69f0ae' }].map((m,i) => (
          <div key={i} style={{ background:dimBg, borderRadius:7, padding:'8px 11px', border:`1px solid ${dimBd}` }}>
            <div style={{ fontSize:9, color:dimText, marginBottom:2 }}>{m.l}</div>
            <div style={{ fontSize:12, fontWeight:600, color:m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 2) return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        {[{ l:'You pay', v:'€119.99', sub:'source price' },{ l:'Customer pays', v:'€200.00', sub:'your listing price' }].map((c,i) => (
          <div key={i} style={{ flex:1, background:dimBg, borderRadius:9, padding:'10px 12px', border:`1px solid ${dimBd}` }}>
            <div style={{ fontSize:9, color:dimText, marginBottom:3 }}>{c.l}</div>
            <div style={{ fontSize:18, fontWeight:700, color:'#fff' }}>{c.v}</div>
            <div style={{ fontSize:8, color:dimText, marginTop:2 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(0,184,108,0.09)', border:'1px solid rgba(0,184,108,0.25)', borderRadius:9, padding:'11px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div><div style={{ fontSize:9, color:dimText, marginBottom:2 }}>Your profit per sale</div><div style={{ fontSize:22, fontWeight:800, color:'#69f0ae' }}>+€80.01</div></div>
        <div style={{ textAlign:'right' }}><div style={{ fontSize:17, fontWeight:700, color:'#69f0ae' }}>40%</div><div style={{ fontSize:9, color:dimText }}>margin</div></div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(0,184,108,0.07)', border:'1px solid rgba(0,184,108,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:9 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:'rgba(0,184,108,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="#69f0ae"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm4.78 6.97-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L8.75 11.94l4.97-4.97a.75.75 0 0 1 1.06 1.06Z"/></svg>
        </div>
        <div><div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>Pushed to Shopify</div><div style={{ fontSize:9, color:dimText, marginTop:1 }}>Nike Air Force 1 &apos;07 is now live on your store</div></div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {[{ name:'Shopify', color:'#95BF47', ok:true },{ name:'WooCommerce', color:'#7F54B3', ok:false },{ name:'Etsy', color:'#F45800', ok:false }].map((s,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:dimBg, borderRadius:8, padding:'8px 12px', border:i===0?'1px solid rgba(149,191,71,0.3)':`1px solid ${dimBd}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:7, height:7, borderRadius:'50%', background:s.color }}/><span style={{ fontSize:11, color:'#fff', fontWeight:500 }}>{s.name}</span></div>
            <span style={{ fontSize:9, color:s.ok?'#95BF47':dimText, fontWeight:s.ok?600:400 }}>{s.ok?'Connected':'Coming soon'}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 4) return (
    <div style={{ width:'100%' }}>
      <div style={{ fontSize:10, color:dimText, marginBottom:7 }}>Order #4821 received and fulfilled</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:7, marginBottom:9 }}>
        {[{ l:'You paid', v:'€119.99', c:'rgba(255,255,255,0.7)' },{ l:'Customer paid', v:'€200.00', c:'rgba(255,255,255,0.7)' },{ l:'Your profit', v:'+€80.01', c:'#69f0ae' }].map((s,i) => (
          <div key={i} style={{ background:i===2?'rgba(0,184,108,0.08)':dimBg, borderRadius:8, padding:'9px 8px', border:i===2?'1px solid rgba(0,184,108,0.22)':`1px solid rgba(255,255,255,0.06)` }}>
            <div style={{ fontSize:8, color:dimText, marginBottom:3 }}>{s.l}</div>
            <div style={{ fontSize:12, fontWeight:700, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:dimBg, borderRadius:8, padding:'8px 12px', border:`1px solid ${dimBd}`, fontSize:10, color:dimText }}>Purchased automatically from nike.com · Shipping to customer</div>
    </div>
  );

  return null;
}

function EyeIcon({ open }) {
  return open
    ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

export default function SignUp() {
  const router = useRouter();
  const [form, setForm]       = useState({ full_name:'', email:'', password:'', confirm:'', phone:'' });
  const [dial, setDial]       = useState(DIAL_CODES[0]);
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(0);
  const [vis, setVis]         = useState(true);
  const [feed, setFeed]       = useState([]);

  useEffect(() => {
    const iv = setInterval(() => {
      setVis(false);
      setTimeout(() => { setStep(s => (s + 1) % STEPS.length); setVis(true); }, 380);
    }, 4200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const q = [...ACTIVITIES].sort(() => Math.random() - 0.5);
    let i = 0;
    const push = () => { setFeed(prev => [{ ...q[i % q.length], id: Date.now() }, ...prev].slice(0, 4)); i++; };
    push();
    const iv = setInterval(push, 3000);
    return () => clearInterval(iv);
  }, []);

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

  const ash   = '#f1f1f1';
  const green = '#008060';
  const text  = 'rgba(48,48,48,1)';
  const sub   = 'rgba(97,97,97,1)';
  const bd    = 'rgba(220,220,220,1)';

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

        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gridPan { from{background-position:0 0} to{background-position:0 48px} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .su-shell  { display:flex; flex-direction:column; min-height:100vh; }
        .su-panels { display:flex; flex:1; }

        .left { background:#1a1a1a; flex:1; display:flex; flex-direction:column; padding:32px 40px 28px; position:relative; overflow:hidden; }
        .left-grid { position:absolute; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px); background-size:48px 48px; animation:gridPan 10s linear infinite; }
        .left-glow-a { position:absolute; top:5%; left:10%; width:320px; height:320px; border-radius:50%; background:radial-gradient(circle,rgba(0,128,96,0.12) 0%,transparent 70%); pointer-events:none; z-index:0; }
        .left-glow-b { position:absolute; bottom:10%; right:5%; width:220px; height:220px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%); pointer-events:none; z-index:0; }

        .demo-area  { flex:1; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:1; margin:20px 0; }
        .step-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:20px; font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:.07em; margin-bottom:10px; }
        .step-title { font-size:22px; font-weight:800; color:#fff; line-height:1.2; letter-spacing:-0.5px; margin-bottom:5px; }
        .step-sub   { font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:16px; line-height:1.6; }
        .demo-card  { background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; margin-bottom:16px; }
        .step-dots  { display:flex; gap:5px; }
        .dot        { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.18); transition:all .3s; cursor:pointer; }
        .dot.on     { background:#fff; width:18px; border-radius:3px; }

        .feed-area  { position:relative; z-index:1; }
        .feed-label { font-size:9px; font-weight:600; color:rgba(255,255,255,0.25); text-transform:uppercase; letter-spacing:.1em; display:flex; align-items:center; gap:6px; margin-bottom:8px; }
        .pdot       { width:6px; height:6px; border-radius:50%; background:#00b86c; flex-shrink:0; animation:pulse 1.8s infinite; }
        .feed-list  { display:flex; flex-direction:column; gap:5px; }
        .feed-row   { display:flex; align-items:center; gap:9px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:9px; padding:8px 11px; animation:fadeUp .3s ease; }

        .right { width:480px; flex-shrink:0; background:${ash}; display:flex; align-items:flex-start; justify-content:center; padding:36px 40px 48px; overflow-y:auto; }
        .form-shell { width:100%; max-width:360px; }

        .tabs    { display:flex; border-bottom:2px solid rgba(0,0,0,0.07); margin-bottom:24px; }
        .tab-btn { flex:1; padding:9px 0; background:none; border:none; border-bottom:2px solid transparent; margin-bottom:-2px; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; color:${sub}; transition:color .15s, border-color .15s; }
        .tab-btn.on { color:${text}; border-bottom-color:${green}; }

        .sec { font-size:9px; font-weight:700; color:rgba(97,97,97,0.7); text-transform:uppercase; letter-spacing:.1em; margin:16px 0 10px; display:flex; align-items:center; gap:8px; }
        .sec::after { content:''; flex:1; height:1px; background:rgba(0,0,0,0.08); }

        .field { margin-bottom:10px; }
        .lbl   { font-size:11px; font-weight:500; color:${sub}; display:flex; align-items:center; gap:5px; margin-bottom:4px; }
        .inp   { width:100%; padding:9px 11px; background:#fff; border:1px solid ${bd}; border-radius:8px; font-size:13px; color:${text}; font-family:inherit; outline:none; transition:border-color .2s, box-shadow .2s; }
        .inp::placeholder { color:rgba(140,140,140,0.7); }
        .inp:focus { border-color:${green}; box-shadow:0 0 0 3px rgba(0,128,96,0.1); }
        .inp-note { font-size:10px; color:rgba(120,120,120,0.8); margin-top:3px; }

        .phone-row { display:flex; gap:6px; }
        .cc-sel    { padding:9px 8px; background:#fff; border:1px solid ${bd}; border-radius:8px; font-size:12px; color:${text}; font-family:inherit; outline:none; cursor:pointer; flex-shrink:0; width:90px; appearance:none; -webkit-appearance:none; transition:border-color .2s; }
        .cc-sel:focus { border-color:${green}; box-shadow:0 0 0 3px rgba(0,128,96,0.1); }

        .pw-wrap      { position:relative; }
        .pw-wrap .inp { padding-right:38px; }
        .pw-eye       { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(120,120,120,0.6); display:flex; padding:4px; transition:color .15s; }
        .pw-eye:hover { color:${sub}; }

        .check-row   { display:flex; align-items:flex-start; gap:9px; margin:14px 0; }
        .check-box   { width:16px; height:16px; border-radius:4px; border:1.5px solid ${bd}; background:#fff; cursor:pointer; flex-shrink:0; margin-top:1px; display:flex; align-items:center; justify-content:center; transition:border-color .15s, background .15s; }
        .check-box.on { background:${text}; border-color:${text}; }
        .check-label { font-size:11px; color:${sub}; line-height:1.55; }
        .check-label a { color:${green}; text-decoration:none; font-weight:500; }
        .check-label a:hover { text-decoration:underline; }

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
          .su-panels { flex-direction:column; }
          .left  { padding:24px 24px 20px; min-height:auto; }
          .step-title { font-size:18px; }
          .right { width:100%; padding:28px 20px 48px; }
        }
      `}</style>

      <div className="su-shell">
        <AuthNav />

        <div className="su-panels">

          {/* LEFT PANEL */}
          <div className="left">
            <div className="left-grid" />
            <div className="left-glow-a" />
            <div className="left-glow-b" />

            <div className="demo-area">
              <div style={{ opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(-6px)', transition:'all 0.38s ease' }}>
                <div className="step-badge">
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#00b86c', animation:'pulse 2s infinite', flexShrink:0 }}/>
                  Step {step + 1} of {STEPS.length}
                </div>
                <div className="step-title">{STEPS[step].label}</div>
                <div className="step-sub">{STEPS[step].sub}</div>
              </div>

              <div className="demo-card" style={{ opacity:vis?1:0, transform:vis?'translateY(0) scale(1)':'translateY(6px) scale(0.98)', transition:'all 0.38s ease' }}>
                <DemoVisual step={step} />
              </div>

              <div className="step-dots">
                {STEPS.map((_,i) => <div key={i} className={`dot${step===i?' on':''}`} onClick={() => setStep(i)} />)}
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
                <button className="tab-btn" onClick={() => router.push('/sign-in')}>Login</button>
                <button className="tab-btn on">Sign Up</button>
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

              <p style={{ textAlign:'center', marginTop:14, fontSize:11, color:'rgba(100,100,100,0.7)' }}>Free plan · No credit card required</p>
              <p style={{ textAlign:'center', marginTop:10, fontSize:12, color:sub }}>
                Already have an account?{' '}
                <Link href="/sign-in" style={{ color:green, fontWeight:600, textDecoration:'none' }}>Sign in</Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
