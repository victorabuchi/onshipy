import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AuthNav from '../components/AuthNav';

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

export default function Login() {
  const router = useRouter();
  const [feed, setFeed]   = useState([]);
  const [stats, setStats] = useState(STATS0);

  useEffect(() => {
    const q = [...ACTIVITIES].sort(() => Math.random() - 0.5);
    let i = 0;
    const push = () => { setFeed(prev => [{ ...q[i % q.length], id: Date.now() }, ...prev].slice(0, 5)); i++; };
    push();
    const iv  = setInterval(push, 3000);
    const sIv = setInterval(() => {
      setStats([
        { label: 'Products imported', value: (Math.floor(Math.random() * 80) + 380).toLocaleString() },
        { label: 'Profit generated',  value: `€${(Math.floor(Math.random() * 3000) + 8000).toLocaleString()}` },
        { label: 'Active sellers',    value: (2847 + Math.floor(Math.random() * 40) - 20).toLocaleString() },
      ]);
    }, 7000);
    return () => { clearInterval(iv); clearInterval(sIv); };
  }, []);

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

        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gridPan { from{background-position:0 0} to{background-position:0 48px} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes countUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

        .lg-page  { display:flex; flex-direction:column; min-height:100vh; background:#1a1a1a; }
        .lg-body  { flex:1; display:flex; justify-content:center; align-items:center; padding:40px 24px; position:relative; overflow:hidden; }
        .lg-grid  { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px); background-size:48px 48px; animation:gridPan 10s linear infinite; }
        .lg-ga    { position:absolute; top:10%; left:20%; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(0,128,96,0.1) 0%,transparent 70%); pointer-events:none; }
        .lg-gb    { position:absolute; bottom:5%; right:10%; width:260px; height:260px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%); pointer-events:none; }

        .lg-inner { max-width:600px; width:100%; position:relative; z-index:1; }
        .lg-title { font-size:42px; font-weight:800; color:#fff; line-height:1.1; letter-spacing:-1.2px; margin-bottom:12px; }
        .lg-sub   { font-size:15px; color:rgba(255,255,255,0.38); line-height:1.7; margin-bottom:32px; max-width:440px; }

        .stats-row { display:flex; gap:0; border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); margin-bottom:32px; }
        .stat-cell { flex:1; padding:14px 16px; background:rgba(255,255,255,0.03); border-right:1px solid rgba(255,255,255,0.07); }
        .stat-cell:last-child { border-right:none; }
        .stat-val  { font-size:20px; font-weight:800; color:#fff; animation:countUp .4s ease; }
        .stat-lbl  { font-size:10px; color:rgba(255,255,255,0.3); margin-top:3px; }

        .cta-row  { display:flex; gap:10px; margin-bottom:36px; }
        .cta-dark { padding:12px 28px; background:#fff; color:#1a1a1a; font-size:14px; font-weight:700; border:none; border-radius:24px; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-flex; align-items:center; gap:7px; transition:opacity .15s; }
        .cta-dark:hover { opacity:.88; }
        .cta-ghost { padding:12px 24px; background:rgba(255,255,255,0.06); color:#fff; font-size:14px; font-weight:600; border:1px solid rgba(255,255,255,0.12); border-radius:24px; cursor:pointer; font-family:inherit; text-decoration:none; display:inline-flex; align-items:center; transition:background .15s; }
        .cta-ghost:hover { background:rgba(255,255,255,0.1); }

        .feed-label { font-size:9px; font-weight:600; color:rgba(255,255,255,0.25); text-transform:uppercase; letter-spacing:.1em; display:flex; align-items:center; gap:6px; margin-bottom:10px; }
        .pdot       { width:6px; height:6px; border-radius:50%; background:#00b86c; flex-shrink:0; animation:pulse 1.8s infinite; }
        .feed-list  { display:flex; flex-direction:column; gap:6px; }
        .feed-row   { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:10px 13px; animation:fadeUp .3s ease; }
      `}</style>

      <div className="lg-page">
        <AuthNav />

        <div className="lg-body">
          <div className="lg-grid" />
          <div className="lg-ga" />
          <div className="lg-gb" />

          <div className="lg-inner">
            <div className="lg-title">
              Sell anything.<br />
              <span style={{ color:'rgba(255,255,255,0.25)' }}>From anywhere.</span>
            </div>
            <p className="lg-sub">
              Import from Nike, ASOS, Amazon and 1,000+ stores. Set your price. We purchase and ship automatically.
            </p>

            <div className="stats-row">
              {stats.map((s, i) => (
                <div key={i} className="stat-cell">
                  <div className="stat-val" key={s.value}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="cta-row">
              <Link href="/sign-in" className="cta-dark">
                Sign in
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/register" className="cta-ghost">Create free account</Link>
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
