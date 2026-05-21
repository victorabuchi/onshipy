import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AuthNav from '../components/AuthNav';

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
  { label: 'Paste any product URL',      sub: 'From Nike, ASOS, Amazon, Zara and 900 more brands' },
  { label: 'Product imported instantly', sub: 'Title, price and images pulled in seconds'          },
  { label: 'Set your selling price',     sub: 'See your profit in real time before you list it'   },
  { label: 'Push to your Shopify store', sub: 'One click publishes the listing to your store'     },
  { label: 'Customer buys. You profit.', sub: 'We handle the purchase and shipping automatically' },
];

export default function Register() {
  const [feed, setFeed]   = useState([]);
  const [step, setStep]   = useState(0);
  const [vis, setVis]     = useState(true);

  useEffect(() => {
    const q = [...ACTIVITIES].sort(() => Math.random() - 0.5);
    let i = 0;
    const push = () => { setFeed(prev => [{ ...q[i % q.length], id: Date.now() }, ...prev].slice(0, 4)); i++; };
    push();
    const feedIv = setInterval(push, 3200);
    return () => clearInterval(feedIv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setVis(false);
      setTimeout(() => { setStep(s => (s + 1) % STEPS.length); setVis(true); }, 350);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

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

        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gridPan { from{background-position:0 0} to{background-position:0 48px} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .rg-page  { display:flex; flex-direction:column; min-height:100vh; background:#1a1a1a; }
        .rg-body  { flex:1; display:flex; justify-content:center; align-items:flex-start; padding:48px 24px 40px; position:relative; overflow:hidden; }
        .rg-grid  { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px); background-size:48px 48px; animation:gridPan 10s linear infinite; }
        .rg-ga    { position:absolute; top:0%; left:15%; width:420px; height:420px; border-radius:50%; background:radial-gradient(circle,rgba(0,128,96,0.1) 0%,transparent 70%); pointer-events:none; }
        .rg-gb    { position:absolute; bottom:5%; right:8%; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%); pointer-events:none; }

        .rg-inner { max-width:680px; width:100%; position:relative; z-index:1; }
        .rg-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; background:rgba(0,128,96,0.12); border:1px solid rgba(0,128,96,0.25); border-radius:20px; font-size:11px; color:rgba(0,184,108,0.9); font-weight:600; margin-bottom:20px; }
        .rg-title { font-size:40px; font-weight:800; color:#fff; line-height:1.1; letter-spacing:-1.2px; margin-bottom:12px; }
        .rg-sub   { font-size:15px; color:rgba(255,255,255,0.38); line-height:1.7; margin-bottom:32px; max-width:460px; }

        .demo-card  { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:24px; margin-bottom:28px; }
        .step-badge { display:inline-flex; align-items:center; gap:6px; padding:3px 10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:20px; font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:.07em; margin-bottom:12px; }
        .step-title { font-size:20px; font-weight:800; color:#fff; line-height:1.2; letter-spacing:-0.4px; margin-bottom:4px; }
        .step-sub   { font-size:13px; color:rgba(255,255,255,0.4); line-height:1.6; margin-bottom:16px; }
        .step-dots  { display:flex; gap:6px; }
        .dot        { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,0.18); transition:all .3s; cursor:pointer; }
        .dot.on     { background:#fff; width:18px; border-radius:3px; }

        .brands-row { display:flex; gap:6px; flex-wrap:wrap; }
        .brand-chip { padding:'3px 10px'; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:20px; font-size:10px; color:rgba(255,255,255,0.35); }

        .cta-row   { display:flex; gap:10px; margin-bottom:36px; }
        .cta-green { padding:12px 28px; background:#008060; color:#fff; font-size:14px; font-weight:700; border:none; border-radius:24px; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-flex; align-items:center; gap:7px; transition:opacity .15s; }
        .cta-green:hover { opacity:.88; }
        .cta-ghost { padding:12px 24px; background:rgba(255,255,255,0.06); color:#fff; font-size:14px; font-weight:600; border:1px solid rgba(255,255,255,0.12); border-radius:24px; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-flex; align-items:center; transition:background .15s; }
        .cta-ghost:hover { background:rgba(255,255,255,0.1); }

        .feed-label { font-size:9px; font-weight:600; color:rgba(255,255,255,0.25); text-transform:uppercase; letter-spacing:.1em; display:flex; align-items:center; gap:6px; margin-bottom:10px; }
        .pdot       { width:6px; height:6px; border-radius:50%; background:#00b86c; flex-shrink:0; animation:pulse 1.8s infinite; }
        .feed-list  { display:flex; flex-direction:column; gap:6px; }
        .feed-row   { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:10px 13px; animation:fadeUp .3s ease; }
      `}</style>

      <div className="rg-page">
        <AuthNav startHref="/sign-up" />

        <div className="rg-body">
          <div className="rg-grid" />
          <div className="rg-ga" />
          <div className="rg-gb" />

          <div className="rg-inner">
            <div className="rg-badge">
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#00b86c', animation:'pulse 2s infinite', flexShrink:0 }}/>
              Free to start · No credit card required
            </div>

            <div className="rg-title">
              Your dropshipping<br />
              <span style={{ color:'rgba(255,255,255,0.25)' }}>business starts here.</span>
            </div>
            <p className="rg-sub">
              Import products from 1,000+ stores, set your price, and sell on Shopify. We handle the purchasing and shipping automatically.
            </p>

            {/* Step demo */}
            <div className="demo-card">
              <div style={{ opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(-5px)', transition:'all .35s ease' }}>
                <div className="step-badge">
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#00b86c', animation:'pulse 2s infinite', flexShrink:0 }}/>
                  Step {step + 1} of {STEPS.length}
                </div>
                <div className="step-title">{STEPS[step].label}</div>
                <div className="step-sub">{STEPS[step].sub}</div>
              </div>

              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['nike.com','asos.com','amazon.com','zara.com','gucci.com','+900 brands'].map((s, i) => (
                  <span key={i} style={{ padding:'3px 10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, fontSize:10, color:'rgba(255,255,255,0.35)' }}>{s}</span>
                ))}
              </div>

              <div className="step-dots" style={{ marginTop:16 }}>
                {STEPS.map((_,i) => <div key={i} className={`dot${step===i?' on':''}`} onClick={() => setStep(i)} />)}
              </div>
            </div>

            <div className="cta-row">
              <Link href="/sign-up" className="cta-green">
                Start for free
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/sign-in" className="cta-ghost">Already have an account?</Link>
            </div>

            <div className="feed-label"><span className="pdot"/> Live activity</div>
            <div className="feed-list">
              {feed.map(n => (
                <div key={n.id} className="feed-row">
                  <div style={{ position:'relative', width:32, height:32, borderRadius:'50%', flexShrink:0, background:'rgba(255,255,255,0.1)', border:'1.5px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.7)', lineHeight:1, userSelect:'none', zIndex:0 }}>{n.name.split(' ').map(w=>w[0]).join('')}</span>
                    <img style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover', zIndex:1 }} src={`https://i.pravatar.cc/40?img=${n.img}`} alt={n.name} onError={e => { e.currentTarget.style.opacity='0'; }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#fff', flexShrink:0 }}>{n.name}</span>
                      <span style={{ fontSize:12 }}>{FLAGS[n.country] || ''}</span>
                      <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(255,255,255,0.22)', flexShrink:0 }}>{n.time}</span>
                    </div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
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
      </div>
    </>
  );
}
