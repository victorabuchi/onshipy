import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const NICHES = [
  {
    id: 'fashion', label: 'Fashion', subcategories: ['Menswear', 'Womenswear', 'Streetwear', 'Shoes', 'Bags', 'Accessories'],
    brands: [
      { name: 'Nike', url: 'https://www.nike.com', logo: 'N', color: '#111', trending: true },
      { name: 'Adidas', url: 'https://www.adidas.com', logo: 'A', color: '#000', trending: true },
      { name: 'Zara', url: 'https://www.zara.com', logo: 'Z', color: '#1a1a1a', trending: false },
      { name: 'ASOS', url: 'https://www.asos.com', logo: 'AS', color: '#2d2d2d', trending: true },
      { name: 'H&M', url: 'https://www.hm.com', logo: 'H', color: '#e50010', trending: false },
      { name: 'Gucci', url: 'https://www.gucci.com', logo: 'G', color: '#2c2c2c', trending: false },
      { name: 'Balenciaga', url: 'https://www.balenciaga.com', logo: 'B', color: '#000', trending: true },
      { name: 'Dior', url: 'https://www.dior.com', logo: 'D', color: '#1a1a1a', trending: false },
      { name: 'Acne Studios', url: 'https://www.acnestudios.com', logo: 'AC', color: '#333', trending: false },
      { name: 'Off-White', url: 'https://www.off---white.com', logo: 'OW', color: '#000', trending: true },
      { name: 'Stone Island', url: 'https://www.stoneisland.com', logo: 'SI', color: '#333', trending: false },
      { name: 'Palace', url: 'https://shop.palaceskateboards.com', logo: 'P', color: '#000', trending: true },
    ]
  },
  {
    id: 'electronics', label: 'Electronics', subcategories: ['Phones', 'Laptops', 'Audio', 'Gaming', 'Cameras', 'Accessories'],
    brands: [
      { name: 'Apple', url: 'https://www.apple.com', logo: '', color: '#1d1d1f', trending: true },
      { name: 'Samsung', url: 'https://www.samsung.com', logo: 'S', color: '#1428A0', trending: true },
      { name: 'Sony', url: 'https://www.sony.com', logo: 'So', color: '#000', trending: false },
      { name: 'Bose', url: 'https://www.bose.com', logo: 'Bo', color: '#000', trending: true },
      { name: 'Dyson', url: 'https://www.dyson.com', logo: 'D', color: '#C41230', trending: false },
      { name: 'DJI', url: 'https://www.dji.com', logo: 'DJI', color: '#1c1c1c', trending: true },
    ]
  },
  {
    id: 'beauty', label: 'Beauty', subcategories: ['Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Nails'],
    brands: [
      { name: 'Charlotte Tilbury', url: 'https://www.charlottetilbury.com', logo: 'CT', color: '#c8a882', trending: true },
      { name: 'Glossier', url: 'https://www.glossier.com', logo: 'G', color: '#ff818a', trending: true },
      { name: 'NARS', url: 'https://www.narscosmetics.com', logo: 'N', color: '#000', trending: false },
      { name: 'Aesop', url: 'https://www.aesop.com', logo: 'AE', color: '#3c3c3c', trending: false },
      { name: 'Tatcha', url: 'https://www.tatcha.com', logo: 'T', color: '#c2945a', trending: true },
    ]
  },
  {
    id: 'sports', label: 'Sports', subcategories: ['Running', 'Football', 'Basketball', 'Gym', 'Outdoor', 'Cycling'],
    brands: [
      { name: 'Nike', url: 'https://www.nike.com', logo: 'N', color: '#111', trending: true },
      { name: 'Adidas', url: 'https://www.adidas.com', logo: 'A', color: '#000', trending: true },
      { name: 'Under Armour', url: 'https://www.underarmour.com', logo: 'UA', color: '#1D1D1D', trending: false },
      { name: 'Gymshark', url: 'https://www.gymshark.com', logo: 'GS', color: '#25262b', trending: true },
      { name: 'Lululemon', url: 'https://www.lululemon.com', logo: 'LL', color: '#000', trending: true },
      { name: 'New Balance', url: 'https://www.newbalance.com', logo: 'NB', color: '#cf0a2c', trending: false },
    ]
  },
  {
    id: 'home', label: 'Home & Living', subcategories: ['Furniture', 'Kitchen', 'Bedding', 'Decor', 'Lighting'],
    brands: [
      { name: 'IKEA', url: 'https://www.ikea.com', logo: 'IK', color: '#0058A3', trending: false },
      { name: 'Muji', url: 'https://www.muji.com', logo: 'MJ', color: '#1a1a1a', trending: true },
      { name: 'West Elm', url: 'https://www.westelm.com', logo: 'WE', color: '#2f2f2f', trending: false },
      { name: 'Hay', url: 'https://www.hay.dk', logo: 'H', color: '#000', trending: true },
    ]
  },
  {
    id: 'cars', label: 'Cars & Auto', subcategories: ['Parts', 'Accessories', 'Tools', 'Care'],
    brands: [
      { name: 'BMW Shop', url: 'https://shop.bmw.com', logo: 'BMW', color: '#1c69d4', trending: false },
      { name: 'Mercedes', url: 'https://shop.mercedes-benz.com', logo: 'MB', color: '#222', trending: false },
      { name: 'AutoZone', url: 'https://www.autozone.com', logo: 'AZ', color: '#e1261c', trending: true },
    ]
  },
];

export default function Browse() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [activeNiche, setActiveNiche] = useState(NICHES[0]);
  const [activeSub, setActiveSub] = useState(null);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [showImportBar, setShowImportBar] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
  }, []);

  const handleImport = async (url) => {
    setImportUrl(url);
    setImporting(true);
    setImportMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) { setImportMsg('error:' + (data.error || 'Failed')); return; }
      setImportMsg('success:Product imported! Go to Products to set price.');
    } catch { setImportMsg('error:Connection failed'); }
    finally { setImporting(false); }
  };

  const handleVisitBrand = (brand) => {
    setImportUrl('');
    setImportMsg('');
    setShowImportBar(true);
    window.open(brand.url, '_blank');
  };

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

        {/* Left sidebar — niches */}
        <div style={{ width: '200px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e1e3e5', overflowY: 'auto', padding: '16px 0' }}>
          <div style={{ padding: '0 12px 12px', borderBottom: '1px solid #f1f1f1', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Categories</div>
          </div>
          {NICHES.map(n => (
            <button key={n.id} onClick={() => { setActiveNiche(n); setActiveSub(null); }} style={{ width: '100%', padding: '9px 16px', border: 'none', background: activeNiche.id === n.id ? '#f0fdf6' : 'transparent', color: activeNiche.id === n.id ? '#008060' : '#1a1a1a', fontSize: '14px', fontWeight: activeNiche.id === n.id ? '500' : '400', cursor: 'pointer', textAlign: 'left' }}>
              {n.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#f6f6f7' }}>

          {/* Import bar */}
          {showImportBar && (
            <div style={{ background: '#1a1a2e', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #0f0f1a' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', whiteSpace: 'nowrap' }}>Paste product URL:</span>
              <input
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleImport(importUrl)}
                placeholder="https://..."
                style={{ flex: 1, padding: '7px 12px', border: 'none', borderRadius: '6px', fontSize: '14px', outline: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff' }}
              />
              <button onClick={() => handleImport(importUrl)} disabled={importing || !importUrl} style={{ padding: '7px 18px', background: importing ? '#555' : '#008060', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>
                {importing ? 'Importing...' : 'Import'}
              </button>
              <button onClick={() => setShowImportBar(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>×</button>
            </div>
          )}

          {importMsg && (
            <div style={{ padding: '10px 24px', background: importMsg.startsWith('error:') ? '#fff0f0' : '#f0fdf6', borderBottom: '1px solid', borderColor: importMsg.startsWith('error:') ? '#ffcccc' : '#b7e9d4', fontSize: '14px', color: importMsg.startsWith('error:') ? '#cc0000' : '#008060', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{importMsg.replace('error:', '').replace('success:', '')}</span>
              {importMsg.startsWith('success:') && (
                <button onClick={() => router.push('/products')} style={{ padding: '5px 14px', background: '#008060', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                  View Products
                </button>
              )}
            </div>
          )}

          <div style={{ padding: '24px 28px' }}>

            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>{activeNiche.label}</h1>
              <p style={{ color: '#6d7175', fontSize: '13px', margin: 0 }}>Browse top brands and import products with one click</p>
            </div>

            {/* Subcategories */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveSub(null)} style={{ padding: '6px 14px', background: !activeSub ? '#1a1a1a' : '#fff', color: !activeSub ? '#fff' : '#1a1a1a', border: '1px solid', borderColor: !activeSub ? '#1a1a1a' : '#c9cccf', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>All</button>
              {activeNiche.subcategories.map(sub => (
                <button key={sub} onClick={() => setActiveSub(sub)} style={{ padding: '6px 14px', background: activeSub === sub ? '#1a1a1a' : '#fff', color: activeSub === sub ? '#fff' : '#1a1a1a', border: '1px solid', borderColor: activeSub === sub ? '#1a1a1a' : '#c9cccf', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>{sub}</button>
              ))}
            </div>

            {/* Trending section */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ width: '3px', height: '16px', background: '#008060', borderRadius: '2px' }} />
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>Trending this week</div>
              </div>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                {activeNiche.brands.filter(b => b.trending).map((brand, i) => (
                  <div key={i} style={{ flexShrink: 0, width: '140px', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden', cursor: 'pointer' }} onClick={() => handleVisitBrand(brand)}>
                    <div style={{ height: '80px', background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px' }}>{brand.logo}</div>
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>{brand.name}</div>
                      <div style={{ fontSize: '12px', color: '#008060', fontWeight: '500' }}>Browse →</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All brands grid */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{ width: '3px', height: '16px', background: '#1a1a2e', borderRadius: '2px' }} />
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>All brands</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                {activeNiche.brands.map((brand, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' }} onClick={() => handleVisitBrand(brand)}>
                    <div style={{ height: '70px', background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '14px' }}>{brand.logo}</div>
                      {brand.trending && <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#008060', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px' }}>HOT</div>}
                    </div>
                    <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: '500', fontSize: '13px' }}>{brand.name}</div>
                      <div style={{ fontSize: '11px', color: '#008060', fontWeight: '600' }}>Visit</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Import instructions */}
            <div style={{ marginTop: '32px', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', padding: '20px 24px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>How to import a product</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                {[
                  { step: '1', text: 'Click a brand above to open their website' },
                  { step: '2', text: 'Copy the product URL from your browser address bar' },
                  { step: '3', text: 'Paste it in the import bar above and click Import' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', background: '#1a1a2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{s.step}</div>
                    <div style={{ fontSize: '13px', color: '#6d7175', lineHeight: '1.5' }}>{s.text}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowImportBar(true); }} style={{ marginTop: '16px', padding: '9px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>
                Open import bar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}