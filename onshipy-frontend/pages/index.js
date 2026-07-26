import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import AuthNav from '../components/AuthNav';
import AuthFooter from '../components/AuthFooter';

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

const STATS0 = [
  { label: 'Products imported', value: '412'    },
  { label: 'Profit generated',  value: '€9,241' },
  { label: 'Active sellers',    value: '2,847'  },
];

function actionLine(n) {
  if (n.action === 'sale')      return <><span style={{ color:'#00b86c', fontWeight:700 }}>{n.profit} profit</span> · sold {n.item}</>;
  if (n.action === 'import')    return <>Imported {n.item} · <span style={{ color:'rgba(255,255,255,0.55)' }}>{n.price}</span></>;
  if (n.action === 'shopify')   return <span style={{ color:'rgba(255,255,255,0.55)' }}>Connected Shopify store</span>;
  if (n.action === 'milestone') return <><span style={{ color:'#00b86c', fontWeight:700 }}>{n.profit}</span> milestone reached</>;
  return null;
}

export default function Home() {
  const [feed, setFeed]   = useState([]);
  const [stats, setStats] = useState(STATS0);

  useEffect(() => {
    const q = [...ACTIVITIES].sort(() => Math.random() - 0.5);
    let i = 0;
    const push = () => { setFeed(prev => [{ ...q[i % q.length], id: Date.now() + i }, ...prev].slice(0, 6)); i++; };
    push();
    const iv = setInterval(push, 2800);

    const sIv = setInterval(() => {
      setStats([
        { label: 'Products imported', value: (Math.floor(Math.random() * 80) + 380).toLocaleString() },
        { label: 'Profit generated',  value: `€${(Math.floor(Math.random() * 3000) + 8000).toLocaleString()}` },
        { label: 'Active sellers',    value: (2847 + Math.floor(Math.random() * 40) - 20).toLocaleString() },
      ]);
    }, 6000);

    return () => { clearInterval(iv); clearInterval(sIv); };
  }, []);

  return (
    <>
      <Head>
        <title>Onshipy — Sell anything. From anywhere.</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Import from Nike, ASOS, Amazon and 1,000+ stores. Set your price. We handle the purchase and shipping automatically." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { width:100%; min-height:100vh; overflow-x:hidden; background:#1a1a1a; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gridPan { from{background-position:0 0} to{background-position:0 48px} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes countUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }

        .home-shell { display:flex; flex-direction:column; min-height:100vh; }

        /* HERO */
        .hero { position:relative; overflow:hidden; display:flex; flex-direction:column; background:#1a1a1a; }
        .hero-grid { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px); background-size:48px 48px; animation:gridPan 12s linear infinite; }
        .hero-glow-a { position:absolute; top:-60px; left:8%; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(0,128,96,0.14) 0%,transparent 65%); pointer-events:none; }
        .hero-glow-b { position:absolute; bottom:-80px; right:10%; width:360px; height:360px; border-radius:50%; background:radial-gradient(circle,rgba(0,184,124,0.07) 0%,transparent 65%); pointer-events:none; }

        .hero-inner { position:relative; z-index:1; display:flex; align-items:center; gap:64px; max-width:1200px; width:100%; margin:0 auto; padding:72px 48px 64px; }

        /* Left: headline + CTA */
        .hero-left { flex:1; }
        .hero-title { font-size:56px; font-weight:900; color:#fff; line-height:1.08; letter-spacing:-2px; margin-bottom:16px; }
        .hero-title span { color:rgba(255,255,255,0.28); }
        .hero-sub { font-size:16px; color:rgba(255,255,255,0.45); line-height:1.7; margin-bottom:32px; max-width:480px; }
        .cta-row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:40px; }
        .btn-primary { padding:14px 28px; background:#fff; color:#1a1a1a; border-radius:26px; font-size:15px; font-weight:700; text-decoration:none; transition:opacity .15s; letter-spacing:-0.2px; }
        .btn-primary:hover { opacity:.88; }
        .btn-secondary { padding:13px 24px; background:transparent; color:rgba(255,255,255,0.65); border:1px solid rgba(255,255,255,0.15); border-radius:26px; font-size:15px; font-weight:600; text-decoration:none; transition:color .15s, border-color .15s; }
        .btn-secondary:hover { color:#fff; border-color:rgba(255,255,255,0.35); }

        /* Stats */
        .stats-row { display:flex; gap:0; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.07); max-width:420px; }
        .stat-cell { flex:1; padding:13px 16px; background:rgba(255,255,255,0.03); border-right:1px solid rgba(255,255,255,0.07); }
        .stat-cell:last-child { border-right:none; }
        .stat-val { font-size:17px; font-weight:800; color:#fff; animation:countUp .4s ease; }
        .stat-lbl { font-size:9px; color:rgba(255,255,255,0.3); margin-top:3px; text-transform:uppercase; letter-spacing:.05em; }

        /* Right: live feed */
        .hero-right { width:380px; flex-shrink:0; }
        .feed-label { font-size:9px; font-weight:700; color:rgba(255,255,255,0.25); text-transform:uppercase; letter-spacing:.1em; display:flex; align-items:center; gap:6px; margin-bottom:10px; }
        .pdot { width:6px; height:6px; border-radius:50%; background:#00b86c; flex-shrink:0; animation:pulse 1.8s infinite; }
        .feed-list { display:flex; flex-direction:column; gap:5px; }
        .feed-row { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:9px 12px; animation:fadeUp .3s ease; }
        .feed-avatar { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.08); flex-shrink:0; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:rgba(255,255,255,0.4); }
        .feed-name { font-size:12px; font-weight:600; color:#fff; }
        .feed-action { font-size:11px; color:rgba(255,255,255,0.38); margin-top:1px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:220px; }
        .feed-time { font-size:10px; color:rgba(255,255,255,0.2); margin-left:auto; flex-shrink:0; }

        @media (max-width:900px) {
          .hero-inner { flex-direction:column; padding:48px 24px 40px; gap:40px; }
          .hero-title { font-size:38px; }
          .hero-right { width:100%; }
        }

        @media (max-width:420px) {
          .hero-inner { padding:36px 16px 32px; gap:32px; }
          .hero-title { font-size:30px; letter-spacing:-1px; }
          .hero-sub { font-size:14px; margin-bottom:24px; }
          .stats-row { max-width:100%; }
          .stat-cell { padding:11px 10px; }
          .stat-val { font-size:15px; }
        }
      `}</style>

      <div className="home-shell">
        <AuthNav startHref="/register" />

        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-glow-a" />
          <div className="hero-glow-b" />

          <div className="hero-inner">
            {/* Headline + CTA */}
            <div className="hero-left">
              <h1 className="hero-title">
                Sell anything.<br />
                <span>From anywhere.</span>
              </h1>
              <p className="hero-sub">
                Import from Nike, ASOS, Amazon and 1,000+ stores. Set your price. We purchase and ship automatically.
              </p>
              <div className="cta-row">
                <Link href="/register" className="btn-primary">Start for free</Link>
                <Link href="/login" className="btn-secondary">Log in</Link>
              </div>
              <div className="stats-row">
                {stats.map(s => (
                  <div key={s.label} className="stat-cell">
                    <div className="stat-val">{s.value}</div>
                    <div className="stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live feed */}
            <div className="hero-right">
              <div className="feed-label">
                <span className="pdot" />
                Live activity
              </div>
              <div className="feed-list">
                {feed.map(n => (
                  <div key={n.id} className="feed-row">
                    <div className="feed-avatar">
                      <span style={{ position:'absolute', inset:0, zIndex:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {n.name.charAt(0)}
                      </span>
                      <img
                        style={{ position:'absolute', inset:0, width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover', zIndex:1 }}
                        src={`https://i.pravatar.cc/40?img=${n.img}`}
                        alt={n.name}
                        onError={e => { e.currentTarget.style.opacity='0'; }}
                      />
                    </div>
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <div className="feed-name">{n.name} <span style={{ fontSize:12 }}>{FLAGS[n.country]}</span></div>
                      <div className="feed-action">{actionLine(n)}</div>
                    </div>
                    <div className="feed-time">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <AuthFooter />
      </div>
    </>
  );
}
