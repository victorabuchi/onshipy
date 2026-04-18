import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const NICHES = {
  fashion: {
    label: 'Fashion',
    brands: [
      { name: 'Nike', url: 'https://www.nike.com', color: '#111111', trending: true },
      { name: 'Adidas', url: 'https://www.adidas.com', color: '#000000', trending: true },
      { name: 'Zara', url: 'https://www.zara.com', color: '#1a1a1a', trending: false },
      { name: 'ASOS', url: 'https://www.asos.com', color: '#2d2d2d', trending: true },
      { name: 'H&M', url: 'https://www.hm.com', color: '#e50010', trending: false },
      { name: 'Gucci', url: 'https://www.gucci.com', color: '#2c2c2c', trending: false },
      { name: 'Balenciaga', url: 'https://www.balenciaga.com', color: '#000', trending: true },
      { name: 'Dior', url: 'https://www.dior.com', color: '#1a1a1a', trending: false },
      { name: 'Acne Studios', url: 'https://www.acnestudios.com', color: '#333', trending: false },
      { name: 'Off-White', url: 'https://www.off---white.com', color: '#000', trending: true },
      { name: 'Stone Island', url: 'https://www.stoneisland.com', color: '#333', trending: false },
      { name: 'Palace', url: 'https://shop.palaceskateboards.com', color: '#000', trending: true },
    ]
  },
  electronics: {
    label: 'Electronics',
    brands: [
      { name: 'Apple', url: 'https://www.apple.com', color: '#1d1d1f', trending: true },
      { name: 'Samsung', url: 'https://www.samsung.com', color: '#1428A0', trending: true },
      { name: 'Sony', url: 'https://www.sony.com', color: '#000', trending: false },
      { name: 'Bose', url: 'https://www.bose.com', color: '#000', trending: true },
      { name: 'Dyson', url: 'https://www.dyson.com', color: '#C41230', trending: false },
      { name: 'DJI', url: 'https://www.dji.com', color: '#1c1c1c', trending: true },
    ]
  },
  beauty: {
    label: 'Beauty',
    brands: [
      { name: 'Charlotte Tilbury', url: 'https://www.charlottetilbury.com', color: '#c8a882', trending: true },
      { name: 'Glossier', url: 'https://www.glossier.com', color: '#ff818a', trending: true },
      { name: 'NARS', url: 'https://www.narscosmetics.com', color: '#000', trending: false },
      { name: 'Aesop', url: 'https://www.aesop.com', color: '#3c3c3c', trending: false },
      { name: 'Tatcha', url: 'https://www.tatcha.com', color: '#c2945a', trending: true },
    ]
  },
  sports: {
    label: 'Sports',
    brands: [
      { name: 'Nike', url: 'https://www.nike.com', color: '#111', trending: true },
      { name: 'Adidas', url: 'https://www.adidas.com', color: '#000', trending: true },
      { name: 'Under Armour', url: 'https://www.underarmour.com', color: '#1D1D1D', trending: false },
      { name: 'Gymshark', url: 'https://www.gymshark.com', color: '#25262b', trending: true },
      { name: 'Lululemon', url: 'https://www.lululemon.com', color: '#000', trending: true },
      { name: 'New Balance', url: 'https://www.newbalance.com', color: '#cf0a2c', trending: false },
    ]
  },
  home: {
    label: 'Home & Living',
    brands: [
      { name: 'IKEA', url: 'https://www.ikea.com', color: '#0058A3', trending: false },
      { name: 'Muji', url: 'https://www.muji.com', color: '#1a1a1a', trending: true },
      { name: 'West Elm', url: 'https://www.westelm.com', color: '#2f2f2f', trending: false },
      { name: 'Hay', url: 'https://www.hay.dk', color: '#000', trending: true },
    ]
  },
  cars: {
    label: 'Cars & Auto',
    brands: [
      { name: 'AutoZone', url: 'https://www.autozone.com', color: '#e1261c', trending: true },
      { name: 'BMW Shop', url: 'https://shop.bmw.com', color: '#1c69d4', trending: false },
      { name: 'Mercedes Shop', url: 'https://shop.mercedes-benz.com', color: '#222', trending: false },
    ]
  },
};

export default function Browse() {
  const router = useRouter();
  const { niche } = router.query;
  const tokenRef = useRef('');
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
  }, []);

  const handleImport = async (url) => {
    if (!url) return;
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
      setImportMsg('success:Product imported! Go to Products to set your price.');
    } catch { setImportMsg('error:Connection failed'); }
    finally { setImporting(false); }
  };

  const categories = Object.keys(NICHES);

  // No niche selected — show category grid
  if (!niche || !NICHES[niche]) {
    return (
      <Layout>
        <div style={{ padding: '28px 32px', background: '#f1f2f4', minHeight: '100vh' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: 0 }}>Browse</h1>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Choose a category to browse top brands and import products</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
            {categories.map(key => {
              const n = NICHES[key];
              const colors = ['#1a1a2e', '#00a47c', '#7c3aed', '#dc2626', '#0284c7', '#d97706'];
              const color = colors[categories.indexOf(key) % colors.length];
              return (
                <div
                  key={key}
                  onClick={() => router.push(`/browse?niche=${key}`)}
                  style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                >
                  <div style={{ height: '80px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px' }}>{n.label}</span>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>{n.label}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{n.brands.length} brands</div>
                    </div>
                    <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  // Niche selected — show brands for that niche
  const nicheData = NICHES[niche];

  return (
    <Layout>
      <div style={{ padding: '28px 32px', background: '#f1f2f4', minHeight: '100vh' }}>

        {/* Back button */}
        <button onClick={() => router.push('/browse')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '14px', fontWeight: '500', marginBottom: '20px', padding: 0 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Browse
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: 0 }}>{nicheData.label}</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Click a brand to visit their website, then copy a product URL and import it</p>
        </div>

        {/* Import bar */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>Import a product</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleImport(importUrl)}
              placeholder="Paste product URL here..."
              style={{ flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            />
            <button onClick={() => handleImport(importUrl)} disabled={importing || !importUrl} style={{ padding: '9px 20px', background: importing ? '#9ca3af' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: importing ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
          {importMsg && (
            <div style={{ marginTop: '10px', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', background: importMsg.startsWith('error:') ? '#fef2f2' : '#f0fdf4', color: importMsg.startsWith('error:') ? '#dc2626' : '#00a47c', border: `1px solid ${importMsg.startsWith('error:') ? '#fecaca' : '#bbf7d0'}` }}>
              {importMsg.replace('error:', '').replace('success:', '')}
              {importMsg.startsWith('success:') && (
                <button onClick={() => router.push('/products')} style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#00a47c', cursor: 'pointer', fontWeight: '600', fontSize: '13px', padding: 0, textDecoration: 'underline' }}>View Products</button>
              )}
            </div>
          )}
        </div>

        {/* Trending */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Trending this week</div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            {nicheData.brands.filter(b => b.trending).map((brand, i) => (
              <div key={i} onClick={() => window.open(brand.url, '_blank')} style={{ flexShrink: 0, width: '140px', background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: '70px', background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: '800', fontSize: '15px', letterSpacing: '-0.3px' }}>{brand.name[0]}</span>
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{brand.name}</div>
                  <span style={{ fontSize: '10px', background: '#f0fdf4', color: '#00a47c', padding: '2px 6px', borderRadius: '10px', fontWeight: '700' }}>HOT</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All brands */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>All brands</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {nicheData.brands.map((brand, i) => (
              <div key={i} onClick={() => window.open(brand.url, '_blank')} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: '64px', background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>{brand.name[0]}</span>
                  {brand.trending && <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px' }}>HOT</div>}
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '500', fontSize: '13px', color: '#111' }}>{brand.name}</div>
                  <svg width="13" height="13" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}