import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem', fontWeight: '450', letterSpacing: '-0.00833em',
};

// ── Live activity pool ─────────────────────────────────────────────────────
const ACTIVITY_POOL = [
  { user: 'Cole M.', flag: '🇺🇸', action: 'imported', item: 'Nike Air Max 270', profit: null },
  { user: 'Jessie K.', flag: '🇬🇧', action: 'profit', item: null, profit: '+$350' },
  { user: 'Amara T.', flag: '🇳🇬', action: 'imported', item: 'Adidas Ultraboost', profit: null },
  { user: 'Riku S.', flag: '🇫🇮', action: 'sold', item: 'Zara Blazer', profit: '+$94' },
  { user: 'Sofia R.', flag: '🇪🇸', action: 'profit', item: null, profit: '+$212' },
  { user: 'Liam O.', flag: '🇨🇦', action: 'imported', item: 'Apple AirPods Pro', profit: null },
  { user: 'Yuki N.', flag: '🇯🇵', action: 'sold', item: 'ASOS Floral Dress', profit: '+$67' },
  { user: 'Diego M.', flag: '🇧🇷', action: 'profit', item: null, profit: '+$489' },
  { user: 'Priya L.', flag: '🇮🇳', action: 'imported', item: 'Gucci GG Belt', profit: null },
  { user: 'Noah B.', flag: '🇿🇦', action: 'sold', item: 'Jordan 1 High', profit: '+$130' },
  { user: 'Lea V.', flag: '🇩🇪', action: 'profit', item: null, profit: '+$78' },
  { user: 'Marcus J.', flag: '🇺🇸', action: 'imported', item: 'Balenciaga Triple S', profit: null },
  { user: 'Chloe F.', flag: '🇫🇷', action: 'sold', item: 'Dior Saddle Bag', profit: '+$320' },
  { user: 'Tariq A.', flag: '🇦🇪', action: 'profit', item: null, profit: '+$156' },
  { user: 'Mei W.', flag: '🇨🇳', action: 'imported', item: 'Dyson Airwrap', profit: null },
  { user: 'Oscar L.', flag: '🇸🇪', action: 'sold', item: 'New Balance 550', profit: '+$88' },
  { user: 'Nia G.', flag: '🇬🇭', action: 'imported', item: 'H&M Linen Set', profit: null },
  { user: 'Ben C.', flag: '🇦🇺', action: 'profit', item: null, profit: '+$203' },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Brand data ─────────────────────────────────────────────────────────────
const NICHES = {
  fashion: {
    label: 'Fashion', emoji: '👗', color: '#1a1a2e',
    brands: [
      { name: 'Nike', url: 'https://www.nike.com', color: '#111', hot: true },
      { name: 'Adidas', url: 'https://www.adidas.com', color: '#000', hot: true },
      { name: 'Zara', url: 'https://www.zara.com', color: '#1a1a1a', hot: false },
      { name: 'ASOS', url: 'https://www.asos.com', color: '#2d2d2d', hot: true },
      { name: 'H&M', url: 'https://www.hm.com', color: '#e50010', hot: false },
      { name: 'Gucci', url: 'https://www.gucci.com', color: '#2c2c2c', hot: false },
      { name: 'Balenciaga', url: 'https://www.balenciaga.com', color: '#000', hot: true },
      { name: 'Dior', url: 'https://www.dior.com', color: '#1a1a1a', hot: false },
      { name: 'Off-White', url: 'https://www.off---white.com', color: '#000', hot: true },
      { name: 'Stone Island', url: 'https://www.stoneisland.com', color: '#333', hot: false },
      { name: 'Palace', url: 'https://shop.palaceskateboards.com', color: '#000', hot: true },
      { name: 'Acne Studios', url: 'https://www.acnestudios.com', color: '#333', hot: false },
      { name: 'Mango', url: 'https://www.mango.com', color: '#222', hot: false },
      { name: 'Cos', url: 'https://www.cosstores.com', color: '#1a1a1a', hot: false },
      { name: 'Uniqlo', url: 'https://www.uniqlo.com', color: '#e40012', hot: true },
      { name: 'Carhartt WIP', url: 'https://www.carhartt-wip.com', color: '#3b3024', hot: true },
      { name: 'Stussy', url: 'https://www.stussy.com', color: '#000', hot: true },
      { name: 'Supreme', url: 'https://www.supremenewyork.com', color: '#e42b20', hot: true },
      { name: 'Kith', url: 'https://kith.com', color: '#1a1a1a', hot: true },
      { name: 'Fear of God', url: 'https://fearofgod.com', color: '#333', hot: true },
    ]
  },
  electronics: {
    label: 'Electronics', emoji: '📱', color: '#1428A0',
    brands: [
      { name: 'Apple', url: 'https://www.apple.com', color: '#1d1d1f', hot: true },
      { name: 'Samsung', url: 'https://www.samsung.com', color: '#1428A0', hot: true },
      { name: 'Sony', url: 'https://www.sony.com', color: '#000', hot: false },
      { name: 'Bose', url: 'https://www.bose.com', color: '#000', hot: true },
      { name: 'Dyson', url: 'https://www.dyson.com', color: '#C41230', hot: true },
      { name: 'DJI', url: 'https://www.dji.com', color: '#1c1c1c', hot: true },
      { name: 'Logitech', url: 'https://www.logitech.com', color: '#00b3f0', hot: false },
      { name: 'GoPro', url: 'https://gopro.com', color: '#0f3d6b', hot: true },
      { name: 'Jabra', url: 'https://www.jabra.com', color: '#003087', hot: false },
      { name: 'Razer', url: 'https://www.razer.com', color: '#00d900', hot: true },
      { name: 'Beats', url: 'https://www.beatsbydre.com', color: '#e3001b', hot: true },
      { name: 'Bang & Olufsen', url: 'https://www.bang-olufsen.com', color: '#222', hot: false },
    ]
  },
  beauty: {
    label: 'Beauty', emoji: '💄', color: '#c8385a',
    brands: [
      { name: 'Charlotte Tilbury', url: 'https://www.charlottetilbury.com', color: '#c8a882', hot: true },
      { name: 'Glossier', url: 'https://www.glossier.com', color: '#e8c5c1', hot: true },
      { name: 'NARS', url: 'https://www.narscosmetics.com', color: '#000', hot: false },
      { name: 'Aesop', url: 'https://www.aesop.com', color: '#3c3c3c', hot: false },
      { name: 'Tatcha', url: 'https://www.tatcha.com', color: '#c2945a', hot: true },
      { name: 'Fenty Beauty', url: 'https://fentybeauty.com', color: '#c8385a', hot: true },
      { name: 'MAC', url: 'https://www.maccosmetics.com', color: '#1a1a1a', hot: false },
      { name: 'Rare Beauty', url: 'https://www.rarebeauty.com', color: '#d4a5b0', hot: true },
      { name: 'Drunk Elephant', url: 'https://www.drunkelephant.com', color: '#f28c28', hot: true },
      { name: 'Paula\'s Choice', url: 'https://www.paulaschoice.com', color: '#2e2e2e', hot: false },
    ]
  },
  sports: {
    label: 'Sports', emoji: '⚽', color: '#1a6b3a',
    brands: [
      { name: 'Nike', url: 'https://www.nike.com', color: '#111', hot: true },
      { name: 'Adidas', url: 'https://www.adidas.com', color: '#000', hot: true },
      { name: 'Under Armour', url: 'https://www.underarmour.com', color: '#1D1D1D', hot: false },
      { name: 'Gymshark', url: 'https://www.gymshark.com', color: '#25262b', hot: true },
      { name: 'Lululemon', url: 'https://www.lululemon.com', color: '#000', hot: true },
      { name: 'New Balance', url: 'https://www.newbalance.com', color: '#cf0a2c', hot: false },
      { name: 'Puma', url: 'https://www.puma.com', color: '#000', hot: false },
      { name: 'ASICS', url: 'https://www.asics.com', color: '#003da5', hot: false },
      { name: 'Reebok', url: 'https://www.reebok.com', color: '#cc0000', hot: true },
      { name: 'Hoka', url: 'https://www.hoka.com', color: '#ff5f1f', hot: true },
      { name: 'On Running', url: 'https://www.on-running.com', color: '#1a1a1a', hot: true },
      { name: 'Salomon', url: 'https://www.salomon.com', color: '#000', hot: false },
    ]
  },
  sneakers: {
    label: 'Sneakers', emoji: '👟', color: '#7c3aed',
    brands: [
      { name: 'Nike SNKRS', url: 'https://www.nike.com/launch', color: '#111', hot: true },
      { name: 'Jordan Brand', url: 'https://www.nike.com/jordan', color: '#e41c23', hot: true },
      { name: 'Adidas Originals', url: 'https://www.adidas.com/originals', color: '#000', hot: true },
      { name: 'New Balance', url: 'https://www.newbalance.com', color: '#cf0a2c', hot: true },
      { name: 'Vans', url: 'https://www.vans.com', color: '#e31837', hot: false },
      { name: 'Converse', url: 'https://www.converse.com', color: '#000', hot: false },
      { name: 'Asics', url: 'https://www.asics.com', color: '#003da5', hot: true },
      { name: 'Saucony', url: 'https://www.saucony.com', color: '#005fb0', hot: true },
      { name: 'Reebok', url: 'https://www.reebok.com', color: '#cc0000', hot: false },
      { name: 'Puma Clyde', url: 'https://www.puma.com', color: '#000', hot: false },
      { name: 'Hoka', url: 'https://www.hoka.com', color: '#ff5f1f', hot: true },
      { name: 'Mizuno', url: 'https://www.mizuno.com', color: '#003da5', hot: false },
    ]
  },
  home: {
    label: 'Home & Living', emoji: '🏠', color: '#0284c7',
    brands: [
      { name: 'IKEA', url: 'https://www.ikea.com', color: '#0058A3', hot: false },
      { name: 'Muji', url: 'https://www.muji.com', color: '#1a1a1a', hot: true },
      { name: 'West Elm', url: 'https://www.westelm.com', color: '#2f2f2f', hot: false },
      { name: 'Hay', url: 'https://www.hay.dk', color: '#000', hot: true },
      { name: 'Crate & Barrel', url: 'https://www.crateandbarrel.com', color: '#333', hot: false },
      { name: 'CB2', url: 'https://www.cb2.com', color: '#1a1a1a', hot: false },
      { name: 'Anthropologie', url: 'https://www.anthropologie.com', color: '#3d3d3d', hot: true },
      { name: 'Zara Home', url: 'https://www.zarahome.com', color: '#1a1a1a', hot: false },
      { name: 'H&M Home', url: 'https://www.hm.com/home', color: '#e50010', hot: false },
      { name: 'Ferm Living', url: 'https://www.fermliving.com', color: '#2b2b2b', hot: true },
    ]
  },
  watches: {
    label: 'Watches', emoji: '⌚', color: '#92400e',
    brands: [
      { name: 'Rolex', url: 'https://www.rolex.com', color: '#006039', hot: true },
      { name: 'Omega', url: 'https://www.omegawatches.com', color: '#1d1d1b', hot: true },
      { name: 'TAG Heuer', url: 'https://www.tagheuer.com', color: '#c8102e', hot: false },
      { name: 'Seiko', url: 'https://www.seikowatches.com', color: '#1a1a1a', hot: true },
      { name: 'Casio G-Shock', url: 'https://www.casio.com/gshock', color: '#000', hot: true },
      { name: 'Daniel Wellington', url: 'https://www.danielwellington.com', color: '#1d1d1b', hot: false },
      { name: 'Tissot', url: 'https://www.tissotwatches.com', color: '#c00', hot: false },
      { name: 'Hamilton', url: 'https://www.hamiltonwatch.com', color: '#1a1a1a', hot: false },
    ]
  },
  bags: {
    label: 'Bags & Accessories', emoji: '👜', color: '#a16207',
    brands: [
      { name: 'Louis Vuitton', url: 'https://www.louisvuitton.com', color: '#8b6914', hot: true },
      { name: 'Chanel', url: 'https://www.chanel.com', color: '#000', hot: true },
      { name: 'Hermès', url: 'https://www.hermes.com', color: '#e07000', hot: true },
      { name: 'Coach', url: 'https://www.coach.com', color: '#b5872a', hot: false },
      { name: 'Michael Kors', url: 'https://www.michaelkors.com', color: '#c5a028', hot: false },
      { name: 'Kate Spade', url: 'https://www.katespade.com', color: '#000', hot: false },
      { name: 'Telfar', url: 'https://telfar.net', color: '#000', hot: true },
      { name: 'Bottega Veneta', url: 'https://www.bottegaveneta.com', color: '#5a3e28', hot: true },
      { name: 'Loewe', url: 'https://www.loewe.com', color: '#1a1a1a', hot: true },
      { name: 'Jacquemus', url: 'https://www.jacquemus.com', color: '#1a1a1a', hot: true },
    ]
  },
  amazon: {
    label: 'Amazon Finds', emoji: '📦', color: '#cc8400',
    brands: [
      { name: 'Amazon US', url: 'https://www.amazon.com', color: '#ff9900', hot: true },
      { name: 'Amazon UK', url: 'https://www.amazon.co.uk', color: '#ff9900', hot: true },
      { name: 'Amazon DE', url: 'https://www.amazon.de', color: '#ff9900', hot: false },
      { name: 'Amazon FR', url: 'https://www.amazon.fr', color: '#ff9900', hot: false },
      { name: 'Amazon CA', url: 'https://www.amazon.ca', color: '#ff9900', hot: false },
      { name: 'Amazon AU', url: 'https://www.amazon.com.au', color: '#ff9900', hot: false },
    ]
  },
  kids: {
    label: 'Kids & Toys', emoji: '🧸', color: '#d97706',
    brands: [
      { name: 'Lego', url: 'https://www.lego.com', color: '#e3000b', hot: true },
      { name: 'Nike Kids', url: 'https://www.nike.com/kids', color: '#111', hot: true },
      { name: 'Adidas Kids', url: 'https://www.adidas.com/kids', color: '#000', hot: false },
      { name: 'Gap Kids', url: 'https://www.gap.com/kids', color: '#00254b', hot: false },
      { name: 'Pottery Barn Kids', url: 'https://www.potterybarnkids.com', color: '#3d3d3d', hot: false },
      { name: 'Fisher-Price', url: 'https://www.fisher-price.com', color: '#e31e24', hot: false },
      { name: 'Hasbro', url: 'https://www.hasbro.com', color: '#003087', hot: true },
      { name: 'Mattel', url: 'https://www.mattel.com', color: '#e31e24', hot: false },
    ]
  },
  gaming: {
    label: 'Gaming', emoji: '🎮', color: '#6d28d9',
    brands: [
      { name: 'PlayStation', url: 'https://www.playstation.com', color: '#003087', hot: true },
      { name: 'Xbox', url: 'https://www.xbox.com', color: '#107c10', hot: true },
      { name: 'Nintendo', url: 'https://www.nintendo.com', color: '#e4000f', hot: true },
      { name: 'Razer', url: 'https://www.razer.com', color: '#00d900', hot: true },
      { name: 'SteelSeries', url: 'https://steelseries.com', color: '#f60', hot: false },
      { name: 'HyperX', url: 'https://www.hyperxgaming.com', color: '#d00', hot: false },
      { name: 'Corsair', url: 'https://www.corsair.com', color: '#ffd700', hot: false },
      { name: 'ASUS ROG', url: 'https://rog.asus.com', color: '#e00', hot: true },
    ]
  },
  food: {
    label: 'Food & Wellness', emoji: '🌿', color: '#166534',
    brands: [
      { name: 'Whittard', url: 'https://www.whittard.co.uk', color: '#1a3a1a', hot: false },
      { name: 'Fortnum & Mason', url: 'https://www.fortnumandmason.com', color: '#6b4226', hot: false },
      { name: 'Optimum Nutrition', url: 'https://www.optimumnutrition.com', color: '#003087', hot: true },
      { name: 'MyProtein', url: 'https://www.myprotein.com', color: '#f60', hot: true },
      { name: 'GNC', url: 'https://www.gnc.com', color: '#003087', hot: false },
      { name: 'Holland & Barrett', url: 'https://www.hollandandbarrett.com', color: '#00843d', hot: false },
    ]
  },
};

const categories = Object.keys(NICHES);

// Animated activity notification
function ActivityPill({ item, visible }) {
  const isProfit = item.action === 'profit';
  const isSold = item.action === 'sold';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '9px 13px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(20px)',
      transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      minWidth: 240, maxWidth: 280,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: isProfit ? '#008060' : isSold ? '#1d4ed8' : '#7c3aed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
      }}>
        {isProfit ? '💰' : isSold ? '🛍️' : '🔗'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{item.flag}</span>
          <span>{item.user}</span>
          {isProfit && <span style={{ color: '#69f0ae', fontWeight: 700 }}>{item.profit}</span>}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isProfit ? 'profit made' : isSold ? `sold ${item.item} ${item.profit}` : `imported ${item.item}`}
        </div>
      </div>
    </div>
  );
}

export default function Browse() {
  const router = useRouter();
  const { niche } = router.query;
  const tokenRef = useRef('');
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [embeddedUrl, setEmbeddedUrl] = useState(null);
  const [embeddedBrand, setEmbeddedBrand] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [notifVisible, setNotifVisible] = useState(false);
  const activityQueue = useRef(shuffle(ACTIVITY_POOL));
  const activityIdx = useRef(0);
  const [trendingSlide, setTrendingSlide] = useState(0);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;

    // Live activity popups
    const iv = setInterval(() => {
      if (activityIdx.current >= activityQueue.current.length) {
        activityQueue.current = shuffle(ACTIVITY_POOL);
        activityIdx.current = 0;
      }
      const item = activityQueue.current[activityIdx.current++];
      setNotifs([{ ...item, id: Date.now() }]);
      setNotifVisible(true);
      setTimeout(() => setNotifVisible(false), 3500);
    }, 4000);

    return () => clearInterval(iv);
  }, []);

  // Auto-scroll trending
  const nicheData = niche && NICHES[niche];
  useEffect(() => {
    if (!nicheData) return;
    const trending = nicheData.brands.filter(b => b.hot);
    if (trending.length <= 1) return;
    const iv = setInterval(() => setTrendingSlide(s => (s + 1) % trending.length), 2500);
    return () => clearInterval(iv);
  }, [niche]);

  const handleImport = async (url) => {
    if (!url) return;
    setImporting(true); setImportMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) { setImportMsg('error:' + (data.error || 'Failed')); return; }
      setImportMsg('success:Product imported! Go to Products to set your price.');
    } catch { setImportMsg('error:Connection failed'); }
    finally { setImporting(false); }
  };

  const openBrand = (brand) => {
    setEmbeddedUrl(brand.url);
    setEmbeddedBrand(brand);
  };

  const closeEmbed = () => { setEmbeddedUrl(null); setEmbeddedBrand(null); };

  const inp = {
    flex: 1, padding: '7px 12px',
    border: `1px solid ${P.border}`, borderRadius: 8,
    fontSize: P.fontSize, outline: 'none', fontFamily: P.font,
    letterSpacing: P.letterSpacing, color: P.text, background: '#fff',
  };

  // ── Embedded browser view ─────────────────────────────────────────────────
  if (embeddedUrl && embeddedBrand) {
    return (
      <Layout title={`Browse — ${embeddedBrand.name}`}>
        <style>{`
          .embed-topbar { display:flex; align-items:center; gap:10px; padding:10px 16px; background:#fff; border-bottom:1px solid ${P.border}; position:sticky; top:0; z-index:100; }
          .embed-frame { width:100%; height:calc(100vh - 108px); border:none; display:block; }
          .url-bar { flex:1; padding:6px 12px; background:${P.bg}; border:1px solid ${P.border}; border-radius:624px; font-size:${P.fontSize}; color:${P.textSubdued}; font-family:${P.font}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .copy-btn { padding:6px 14px; background:${P.text}; color:#fff; border:none; border-radius:624px; font-size:${P.fontSize}; cursor:pointer; font-family:${P.font}; white-space:nowrap; font-weight:500; }
          .import-bar-embed { display:flex; gap:8px; padding:10px 16px; background:#fff; border-top:1px solid ${P.border}; position:sticky; bottom:0; }
        `}</style>

        {/* Embedded browser topbar */}
        <div className="embed-topbar">
          <button onClick={closeEmbed} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:P.textSubdued, fontSize:P.fontSize, fontFamily:P.font, padding:'4px 8px', borderRadius:6 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <div style={{ width:32, height:32, borderRadius:8, background:embeddedBrand.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>
            {embeddedBrand.name[0]}
          </div>
          <div className="url-bar">{embeddedUrl}</div>
          <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(embeddedUrl); }}>
            Copy URL
          </button>
          <a href={embeddedUrl} target="_blank" rel="noreferrer" style={{ padding:'6px 14px', background:'#fff', color:P.text, border:`1px solid ${P.border}`, borderRadius:624, fontSize:P.fontSize, cursor:'pointer', fontFamily:P.font, whiteSpace:'nowrap', textDecoration:'none' }}>
            Open tab ↗
          </a>
        </div>

        {/* Iframe */}
        <iframe
          src={embeddedUrl}
          className="embed-frame"
          title={embeddedBrand.name}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />

        {/* Import bar at bottom */}
        <div className="import-bar-embed">
          <input
            value={importUrl}
            onChange={e => setImportUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleImport(importUrl)}
            placeholder={`Paste a product URL from ${embeddedBrand.name}...`}
            style={{ ...inp, flex:1 }}
          />
          <button onClick={() => handleImport(importUrl)} disabled={importing || !importUrl} style={{ padding:'7px 16px', background:importing || !importUrl ? P.bg : P.text, color:importing || !importUrl ? P.textSubdued : '#fff', border:`1px solid ${P.border}`, borderRadius:8, fontSize:P.fontSize, fontWeight:500, cursor:importing || !importUrl ? 'not-allowed' : 'pointer', fontFamily:P.font, whiteSpace:'nowrap' }}>
            {importing ? 'Importing...' : 'Import product'}
          </button>
          {importMsg && (
            <div style={{ alignSelf:'center', padding:'4px 10px', borderRadius:8, fontSize:P.fontSize, background:importMsg.startsWith('error:') ? '#fee8eb' : '#cdfed4', color:importMsg.startsWith('error:') ? '#d82c0d' : '#006847', whiteSpace:'nowrap' }}>
              {importMsg.startsWith('success:') ? '✓ Imported!' : importMsg.replace('error:', '')}
            </div>
          )}
        </div>

        {/* Live activity pills */}
        <div style={{ position:'fixed', bottom:80, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:6 }}>
          {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
        </div>
      </Layout>
    );
  }

  // ── Category grid ──────────────────────────────────────────────────────────
  if (!niche || !NICHES[niche]) {
    return (
      <Layout title="Browse">
        <style>{`
          .cat-card { background:#fff; border-radius:12px; border:1px solid ${P.border}; overflow:hidden; cursor:pointer; transition:box-shadow .15s; }
          .cat-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

        {/* Live activity */}
        <div style={{ position:'fixed', bottom:24, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:6 }}>
          {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
        </div>

        <div style={{ padding:'20px 20px 60px', maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:'1.125rem', fontWeight:650, color:P.text, margin:'0 0 3px', letterSpacing:'-0.02em' }}>Browse</h1>
            <p style={{ fontSize:P.fontSize, color:P.textSubdued, margin:0 }}>Choose a category to browse top brands and import products directly</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
            {categories.map((key, i) => {
              const n = NICHES[key];
              return (
                <div key={key} className="cat-card" onClick={() => router.push(`/browse?niche=${key}`)}
                  style={{ animationDelay:`${i * 0.04}s`, animation:'fadeUp .4s ease both' }}>
                  <div style={{ height:72, background:n.color, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                    <span style={{ fontSize:22 }}>{n.emoji}</span>
                    <span style={{ color:'rgba(255,255,255,0.95)', fontWeight:700, fontSize:'0.9375rem', letterSpacing:'-0.02em' }}>{n.label}</span>
                  </div>
                  <div style={{ padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontWeight:500, fontSize:P.fontSize, color:P.text }}>{n.label}</div>
                      <div style={{ fontSize:'0.75rem', color:P.textSubdued, marginTop:1 }}>{n.brands.length} brands · {n.brands.filter(b => b.hot).length} trending</div>
                    </div>
                    <svg width="14" height="14" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  // ── Niche view ─────────────────────────────────────────────────────────────
  const trending = nicheData.brands.filter(b => b.hot);
  const currentTrend = trending[trendingSlide % trending.length];

  return (
    <Layout title={`Browse — ${nicheData.label}`}>
      <style>{`
        .brand-card { background:#fff; border-radius:10px; border:1px solid ${P.border}; overflow:hidden; cursor:pointer; transition:box-shadow .15s, transform .15s; }
        .brand-card:hover { box-shadow:0 2px 12px rgba(0,0,0,0.1); transform:translateY(-1px); }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        .trend-slide { animation: fadeIn 0.5s ease; }
      `}</style>

      {/* Live activity */}
      <div style={{ position:'fixed', bottom:24, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:6 }}>
        {notifs.map(n => <ActivityPill key={n.id} item={n} visible={notifVisible} />)}
      </div>

      <div style={{ padding:'20px 20px 60px', maxWidth:1100, margin:'0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16, fontSize:P.fontSize, color:P.textSubdued }}>
          <button onClick={() => router.push('/browse')} style={{ background:'none', border:'none', cursor:'pointer', color:P.green, fontSize:P.fontSize, fontFamily:P.font, padding:0, fontWeight:500 }}>Browse</button>
          <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color:P.text, fontWeight:500 }}>{nicheData.label}</span>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:'1.125rem', fontWeight:650, color:P.text, margin:'0 0 3px', letterSpacing:'-0.02em' }}>{nicheData.emoji} {nicheData.label}</h1>
            <p style={{ fontSize:P.fontSize, color:P.textSubdued, margin:0 }}>Click any brand to browse inside Onshipy — no new tab needed</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', background:P.surface, border:`1px solid ${P.border}`, borderRadius:20, fontSize:'0.75rem', color:P.textSubdued }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
            {trending.length} trending now
          </div>
        </div>

        {/* ── Animated trending spotlight ── */}
        {currentTrend && (
          <div key={trendingSlide} className="trend-slide" style={{
            background: currentTrend.color, borderRadius:12, padding:'20px 24px',
            marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center',
            overflow:'hidden', position:'relative', minHeight:100,
          }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 60%)', pointerEvents:'none' }}/>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ fontSize:'0.6875rem', fontWeight:600, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#69f0ae', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
                Trending now
              </div>
              <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', marginBottom:4 }}>{currentTrend.name}</div>
              <div style={{ fontSize:P.fontSize, color:'rgba(255,255,255,0.65)' }}>{nicheData.label} · High resell demand</div>
            </div>
            <div style={{ display:'flex', gap:8, position:'relative', zIndex:1, flexWrap:'wrap' }}>
              <button onClick={() => openBrand(currentTrend)} style={{ padding:'8px 18px', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:8, color:'#fff', fontSize:P.fontSize, fontWeight:600, cursor:'pointer', fontFamily:P.font }}>
                Browse {currentTrend.name}
              </button>
            </div>
            {/* Slide dots */}
            <div style={{ position:'absolute', bottom:12, right:16, display:'flex', gap:5 }}>
              {trending.map((_, i) => (
                <div key={i} onClick={() => setTrendingSlide(i)} style={{ width:i === trendingSlide % trending.length ? 16 : 6, height:6, borderRadius:3, background:i === trendingSlide % trending.length ? '#fff' : 'rgba(255,255,255,0.35)', cursor:'pointer', transition:'width .3s' }}/>
              ))}
            </div>
          </div>
        )}

        {/* ── Import bar ── */}
        <div style={{ background:P.surface, borderRadius:12, border:`1px solid ${P.border}`, padding:'14px 18px', marginBottom:16 }}>
          <div style={{ fontWeight:600, fontSize:P.fontSize, color:P.text, marginBottom:8 }}>Import a product</div>
          <div style={{ display:'flex', gap:8 }}>
            <input value={importUrl} onChange={e => setImportUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleImport(importUrl)}
              placeholder="Paste any product URL here..."
              style={inp} />
            <button onClick={() => handleImport(importUrl)} disabled={importing || !importUrl} style={{ padding:'7px 16px', background:importing || !importUrl ? P.bg : P.text, color:importing || !importUrl ? P.textSubdued : '#fff', border:`1px solid ${P.border}`, borderRadius:8, fontSize:P.fontSize, fontWeight:500, cursor:importing || !importUrl ? 'not-allowed' : 'pointer', fontFamily:P.font, whiteSpace:'nowrap' }}>
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
          {importMsg && (
            <div style={{ marginTop:8, padding:'7px 12px', borderRadius:8, fontSize:P.fontSize, background:importMsg.startsWith('error:') ? '#fee8eb' : '#cdfed4', color:importMsg.startsWith('error:') ? '#d82c0d' : '#006847', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{importMsg.replace('error:', '').replace('success:', '')}</span>
              {importMsg.startsWith('success:') && (
                <button onClick={() => router.push('/products')} style={{ background:'none', border:'none', color:'#006847', cursor:'pointer', fontWeight:600, fontSize:P.fontSize, fontFamily:P.font }}>View →</button>
              )}
            </div>
          )}
        </div>

        {/* ── Top 10 Most Resold ── */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:'0.6875rem', fontWeight:600, color:P.textSubdued, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
            🔥 Top {Math.min(10, nicheData.brands.length)} most resold
          </div>
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
            {nicheData.brands.slice(0, 10).map((brand, i) => (
              <div key={i} onClick={() => openBrand(brand)} style={{
                flexShrink:0, width:120, background:P.surface, borderRadius:10,
                border:`1px solid ${P.border}`, overflow:'hidden', cursor:'pointer',
                transition:'box-shadow .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ height:60, background:brand.color, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <span style={{ color:'rgba(255,255,255,0.95)', fontWeight:800, fontSize:'1.25rem' }}>{brand.name[0]}</span>
                  <div style={{ position:'absolute', top:4, left:6, fontSize:'0.6875rem', fontWeight:700, color:'rgba(255,255,255,0.7)' }}>#{i+1}</div>
                  {brand.hot && <div style={{ position:'absolute', top:4, right:6, background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:'0.5625rem', fontWeight:700, padding:'1px 5px', borderRadius:10 }}>HOT</div>}
                </div>
                <div style={{ padding:'8px 10px' }}>
                  <div style={{ fontWeight:500, fontSize:'0.75rem', color:P.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{brand.name}</div>
                  <div style={{ fontSize:'0.625rem', color:P.green, marginTop:1 }}>Browse →</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── All brands grid ── */}
        <div>
          <div style={{ fontSize:'0.6875rem', fontWeight:600, color:P.textSubdued, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
            All brands ({nicheData.brands.length})
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:10 }}>
            {nicheData.brands.map((brand, i) => (
              <div key={i} className="brand-card" onClick={() => openBrand(brand)}>
                <div style={{ height:56, background:brand.color, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <span style={{ color:'rgba(255,255,255,0.95)', fontWeight:800, fontSize:'1.125rem' }}>{brand.name[0]}</span>
                  {brand.hot && <div style={{ position:'absolute', top:4, right:6, background:'rgba(255,255,255,0.15)', color:'#fff', fontSize:'0.5625rem', fontWeight:700, padding:'1px 4px', borderRadius:8 }}>HOT</div>}
                </div>
                <div style={{ padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontWeight:500, fontSize:'0.75rem', color:P.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{brand.name}</div>
                  <svg width="11" height="11" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}