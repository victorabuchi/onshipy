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

// Shopify-style dark icon component
const DarkIcon = ({ children }) => (
  <div style={{
    width: 36, height: 36, borderRadius: 8,
    background: 'rgba(48,48,48,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, color: P.text
  }}>{children}</div>
);

// Shopify pill button
const Btn = ({ children, onClick, variant = 'secondary', disabled }) => {
  const styles = {
    primary: { background: 'rgba(48,48,48,1)', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: P.text, border: `1px solid ${P.border}` },
    tertiary: { background: 'transparent', color: P.text, border: 'none' },
    success: { background: '#fff', color: '#008060', border: '1px solid rgba(0,128,96,0.3)' },
    danger: { background: '#fff', color: '#d82c0d', border: '1px solid rgba(216,44,13,0.3)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      padding: '5px 12px', borderRadius: 6,
      fontSize: P.fontSize, fontWeight: '500', cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: P.font, letterSpacing: P.letterSpacing,
      opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap',
      transition: 'background .1s, opacity .1s',
    }}>{children}</button>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [seller, setSeller] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalType, setModalType] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [listing, setListing] = useState(false);
  const [listMessage, setListMessage] = useState('');
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) { try { setSeller(JSON.parse(s)); } catch {} }
    fetchAll(t);
  }, []);

  const fetchAll = async (t) => {
    const tok = t || tokenRef.current;
    try {
      const [p, l, o] = await Promise.all([
        fetch(`${API_BASE}/api/products`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
        fetch(`${API_BASE}/api/products/listings/all`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
        fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      ]);
      if (p.products) setProducts(p.products);
      if (l.listings) setListings(l.listings);
      if (o.orders) setOrders(o.orders);
    } catch {}
  };

  const getImages = (images) => {
    try {
      if (!images) return [];
      if (typeof images === 'string') return JSON.parse(images);
      if (Array.isArray(images)) return images;
    } catch {}
    return [];
  };

  const getCurrencySymbol = (currency) => {
    return { GBP: '£', USD: '$', EUR: '€', JPY: '¥', CAD: 'CA$', AUD: 'A$' }[currency] || '$';
  };

  const handleImport = async () => {
    if (!url.trim()) return;
    setImporting(true); setMessage('loading');
    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) { setMessage('error:' + (data.error || 'Import failed')); return; }
      setUrl(''); setMessage('success');
      await fetchAll();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) { setMessage('error:' + err.message); }
    finally { setImporting(false); }
  };

  const openModal = (product, type) => {
    setModalProduct(product); setModalType(type);
    setSellingPrice(''); setProfitMargin(''); setListMessage('');
    setEditData({ title: product.title, description: product.description || '' });
  };
  const closeModal = () => { setModalProduct(null); setModalType(''); };

  const handlePriceChange = (val) => {
    setSellingPrice(val);
    if (val && modalProduct?.source_price) setProfitMargin((((val - modalProduct.source_price) / val) * 100).toFixed(1));
  };
  const handleMarginChange = (val) => {
    setProfitMargin(val);
    if (val && modalProduct?.source_price) setSellingPrice((modalProduct.source_price / (1 - val / 100)).toFixed(2));
  };

  const handleSetPrice = async () => {
    if (!sellingPrice || !modalProduct) return;
    setListing(true); setListMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/products/${modalProduct.id}/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ selling_price: parseFloat(sellingPrice), custom_title: modalProduct.title })
      });
      const data = await res.json();
      if (!res.ok) { setListMessage(data.error || 'Failed'); return; }
      setListMessage(`Listed at ${getCurrencySymbol(modalProduct.currency)}${parseFloat(sellingPrice).toFixed(2)}`);
      await fetchAll();
      setTimeout(() => closeModal(), 2000);
    } catch { setListMessage('Connection error'); }
    finally { setListing(false); }
  };

  const handleSaveEdit = async () => {
    if (!modalProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${modalProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify(editData)
      });
      if (res.ok) { await fetchAll(); setListMessage('Saved!'); setTimeout(() => closeModal(), 1500); }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (product) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`${API_BASE}/api/products/${product.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenRef.current}` } });
      await fetchAll();
    } catch {}
  };

  const handleImageUpload = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const imgs = getImages(modalProduct.images);
        setModalProduct(prev => ({ ...prev, images: JSON.stringify([...imgs, ev.target.result]) }));
      };
      reader.readAsDataURL(file);
    });
  };

  const steps = [
    { num: 1, title: 'Import a product', desc: 'Paste any product URL to import it instantly', done: products.length > 0, time: '1 min', action: () => document.getElementById('import-input')?.focus() },
    { num: 2, title: 'Set your price', desc: 'Set a selling price and profit margin', done: listings.length > 0, time: '2 min', action: () => router.push('/products') },
    { num: 3, title: 'Connect your store', desc: 'Link Shopify, WooCommerce or custom store', done: false, time: '5 min', action: () => router.push('/online-store') },
    { num: 4, title: 'Push products', desc: 'Publish your listed products to your store', done: false, time: '1 min', action: () => router.push('/online-store') },
  ];
  const completedSteps = steps.filter(s => s.done).length;
  const progressPct = (completedSteps / steps.length) * 100;
  const revenue = orders.reduce((s, o) => s + parseFloat(o.amount_paid || 0), 0).toFixed(0);
  const sym = modalProduct ? getCurrencySymbol(modalProduct.currency) : '$';

  const inp = {
    width: '100%', padding: '7px 11px',
    border: `1px solid ${P.border}`, borderRadius: 8,
    fontSize: P.fontSize, outline: 'none',
    fontFamily: P.font, letterSpacing: P.letterSpacing,
    color: P.text, background: '#fff',
    boxSizing: 'border-box',
  };

  return (
    <Layout title="Home">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .dash-row:hover { background: #fafafa !important; }
        .stat-card:hover { box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .quick-card:hover { background: #fafafa !important; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
      `}</style>

      <div style={{ fontFamily: P.font, fontSize: P.fontSize, letterSpacing: P.letterSpacing, color: P.text }}>
        <div style={{ maxWidth: 976, margin: '0 auto', padding: '20px 20px 60px' }}>

          {/* ── Page header ── */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              Hey {seller?.full_name?.split(' ')[0] || 'there'}, let's get started.
            </h1>
            <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: 0 }}>
              {seller?.store_name || 'Your store'} · <span style={{ color: P.green, fontWeight: 500 }}>{seller?.plan || 'free'} plan</span>
            </p>
          </div>

          {/* ── Stat cards ── */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 2 }}>
            {[
              { label: 'Sessions', value: '—' },
              { label: 'Total sales', value: `$${revenue}` },
              { label: 'Orders', value: orders.length },
              { label: 'Conversion rate', value: '0%' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{
                background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`,
                padding: '16px 20px', cursor: 'pointer', transition: 'box-shadow .15s',
                flexShrink: 0, minWidth: 160
              }} onClick={() => router.push(i === 0 ? '/analytics' : i === 1 ? '/analytics' : '/orders')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: P.fontSize, color: P.textSubdued, fontWeight: P.fontWeight }}>{s.label}</span>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="rgba(140,140,140,1)"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm-.75 4.5a.75.75 0 0 1 1.5 0v4.25l2.5 2.5a.75.75 0 1 1-1.06 1.06l-2.75-2.75a.75.75 0 0 1-.19-.51V5.5Z" opacity=".5"/></svg>
                </div>
                <div style={{ fontSize: '1.375rem', fontWeight: 600, color: P.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ marginTop: 8 }}>
                  <svg width="70" height="18" viewBox="0 0 70 18"><line x1="0" y1="14" x2="70" y2="14" stroke="#2fb3eb" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5"/></svg>
                </div>
              </div>
            ))}
          </div>

          {/* ── Getting started ── */}
          <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Getting started</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 1 }}>{completedSteps} of {steps.length} tasks complete</div>
              </div>
              <span style={{ fontSize: P.fontSize, fontWeight: 600, color: P.green }}>{Math.round(progressPct)}%</span>
            </div>
            <div style={{ height: 3, background: P.bg }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: P.green, transition: 'width .4s ease' }} />
            </div>
            {steps.map((step, i) => (
              <div key={i} onClick={step.action} className="dash-row" style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                borderBottom: i < steps.length - 1 ? `1px solid ${P.border}` : 'none',
                cursor: 'pointer', background: step.done ? '#fafff9' : P.surface,
                transition: 'background .1s',
              }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: step.done ? P.green : P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step.done
                    ? <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: P.textSubdued }}>{step.num}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: P.fontSize, fontWeight: step.done ? P.fontWeight : 500, color: step.done ? P.textSubdued : P.text, textDecoration: step.done ? 'line-through' : 'none' }}>{step.title}</div>
                  <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>{step.desc} · ~{step.time}</div>
                </div>
                {!step.done
                  ? <span style={{ fontSize: P.fontSize, color: P.green, fontWeight: 500 }}>Start →</span>
                  : <span style={{ fontSize: '0.6875rem', padding: '2px 8px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontWeight: 600 }}>Done</span>
                }
              </div>
            ))}
          </div>

          {/* ── Import ── */}
          <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '16px 20px', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 2 }}>Import a product</div>
            <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 12 }}>Paste any product URL from Nike, ASOS, Amazon, Zara and thousands of other websites</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input id="import-input" type="text" value={url} onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !importing && handleImport()}
                placeholder="https://www.nike.com/product/..."
                style={{ ...inp, flex: 1 }} />
              <button onClick={handleImport} disabled={importing || !url.trim()} style={{
                padding: '7px 16px', background: importing || !url.trim() ? P.bg : P.text,
                color: importing || !url.trim() ? P.textSubdued : '#fff',
                border: `1px solid ${P.border}`, borderRadius: 8,
                fontSize: P.fontSize, fontWeight: 500, cursor: importing || !url.trim() ? 'not-allowed' : 'pointer',
                fontFamily: P.font, whiteSpace: 'nowrap', letterSpacing: P.letterSpacing
              }}>{importing ? 'Importing...' : 'Import'}</button>
            </div>
            {message === 'loading' && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['Importing product details', 'Fetching images', 'Detecting price & currency'].map((label, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: `2px solid ${P.green}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                    <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
            {message === 'success' && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#cdfed4', border: '1px solid #92fcac', borderRadius: 8, fontSize: P.fontSize, color: '#006847', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>✓ Product imported successfully!</span>
                <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#006847', cursor: 'pointer', fontWeight: 600, fontSize: P.fontSize, fontFamily: P.font }}>View →</button>
              </div>
            )}
            {message.startsWith('error:') && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#fee8eb', border: '1px solid #ffc9cf', borderRadius: 8, fontSize: P.fontSize, color: '#d82c0d' }}>
                {message.replace('error:', '')}
              </div>
            )}
          </div>

          {/* ── My Products ── */}
          <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>My Products</span>
                <span style={{ fontSize: P.fontSize, color: P.textSubdued, marginLeft: 8 }}>{products.length} imported</span>
              </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => fetchAll()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, display: 'flex', alignItems: 'center', gap: 4, fontSize: P.fontSize, fontFamily: P.font, padding: '4px 6px', borderRadius: 6 }}
                  title="Refresh products"
                  onMouseEnter={e => e.currentTarget.style.background = P.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                </button>
                <Btn variant="primary" onClick={() => router.push('/products')}>View all</Btn>
              </div>
            </div>

            {products.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 20 20" fill={P.border} style={{ marginBottom: 12 }}><path d="M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11Z"/></svg>
                <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text, marginBottom: 4 }}>No products yet</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>Import your first product using the bar above</div>
              </div>
            ) : (
              <>
                {products.slice(0, 5).map((p, i) => {
                  const imgs = getImages(p.images);
                  const isListed = listings.some(l => l.imported_product_id === p.id);
                  return (
                    <div key={p.id} className="dash-row" style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                      borderBottom: i < Math.min(products.length, 5) - 1 ? `1px solid ${P.border}` : 'none',
                      background: P.surface, transition: 'background .1s',
                    }}>
                      <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: P.bg, border: `1px solid ${P.border}` }}>
                        {imgs[0]
                          ? <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="18" height="18" viewBox="0 0 20 20" fill={P.border}><path d="M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11Z"/></svg>
                            </div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: '0.75rem', color: P.textSubdued }}>{p.source_domain}</span>
                          <span style={{ fontSize: '0.75rem', color: P.border }}>·</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: P.text }}>{getCurrencySymbol(p.currency)}{p.source_price}</span>
                          <span style={{ fontSize: '0.6875rem', padding: '1px 6px', borderRadius: 20, background: isListed ? '#cdfed4' : P.bg, color: isListed ? '#006847' : P.textSubdued, fontWeight: 500 }}>
                            {isListed ? '● Listed' : 'Not listed'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Btn onClick={() => openModal(p, 'edit')}>Edit</Btn>
                        <Btn variant="primary" onClick={() => openModal(p, 'price')}>{isListed ? 'Update price' : 'Set price'}</Btn>
                        <Btn onClick={() => openModal(p, 'image')}>Images</Btn>
                        <Btn variant="success" onClick={() => router.push('/online-store')}>Push</Btn>
                        <Btn variant="danger" onClick={() => handleDelete(p)}>Delete</Btn>
                      </div>
                    </div>
                  );
                })}
                {products.length > 5 && (
                  <div style={{ padding: '10px 20px', borderTop: `1px solid ${P.border}`, textAlign: 'center' }}>
                    <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: P.green, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>
                      View all {products.length} products →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Quick actions — Shopify style dark icon cards ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[
              {
                title: 'Browse brands', desc: 'Find products from top brands', href: '/browse',
                icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M8.5 3a5.5 5.5 0 1 0 3.17 9.98l3.674 3.675a.75.75 0 1 0 1.06-1.06L12.731 12.23A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/></svg>
              },
              {
                title: 'My listings', desc: 'Manage priced products', href: '/listings',
                icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M3.25 4a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 8a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5H3.25ZM3.25 12a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z"/></svg>
              },
              {
                title: 'Connect store', desc: 'Link Shopify & more', href: '/online-store',
                icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M3.5 4A1.5 1.5 0 0 0 2 5.5v9A1.5 1.5 0 0 0 3.5 16h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 16.5 4h-13ZM3.5 5.5h13V8h-13V5.5Zm0 4h13v5h-13v-5Z"/></svg>
              },
              {
                title: 'Analytics', desc: 'Track revenue & profit', href: '/analytics',
                icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4.5 12.25a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-1.5 0V13a.75.75 0 0 1 .75-.75ZM10 8.5a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0V9.25A.75.75 0 0 1 10 8.5ZM15.5 4.5a.75.75 0 0 1 .75.75v11a.75.75 0 0 1-1.5 0v-11a.75.75 0 0 1 .75-.75Z"/></svg>
              },
            ].map((item, i) => (
              <div key={i} className="quick-card" onClick={() => router.push(item.href)} style={{
                background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`,
                padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow .15s, background .1s',
              }}>
                <DarkIcon>{item.icon}</DarkIcon>
                <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* ── Recent orders ── */}
          {orders.length > 0 && (
            <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Recent orders</span>
                <button onClick={() => router.push('/orders')} style={{ background: 'none', border: 'none', color: P.green, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>View all</button>
              </div>
              {orders.slice(0, 3).map((o, i) => (
                <div key={o.id} className="dash-row" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 20px', borderBottom: i < 2 ? `1px solid ${P.border}` : 'none',
                  background: P.surface, transition: 'background .1s',
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>#{o.storefront_order_id || o.id.slice(0, 8)}</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>{o.customer_name} · {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: P.fontSize }}>${o.amount_paid}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 500,
                      background: o.status === 'delivered' ? '#cdfed4' : o.status === 'shipped' ? '#eaf4ff' : '#fff8db',
                      color: o.status === 'delivered' ? '#006847' : o.status === 'shipped' ? '#1d4ed8' : '#7c5a00'
                    }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: P.surface, borderRadius: 12, width: '100%', maxWidth: 440, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: P.surface }}>
              <span style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>
                {modalType === 'price' ? 'Set selling price' : modalType === 'edit' ? 'Edit product' : 'Manage images'}
              </span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: P.textSubdued, lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{modalProduct.title}</div>

              {modalType === 'price' && (
                <>
                  <div style={{ background: P.bg, borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>Source price</div>
                      <div style={{ fontWeight: 650, fontSize: '1.125rem', color: P.text }}>{sym}{modalProduct.source_price}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>From</div>
                      <div style={{ fontSize: P.fontSize, fontWeight: 500 }}>{modalProduct.source_domain}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Selling price ({modalProduct.currency})</label>
                    <input type="number" value={sellingPrice} onChange={e => handlePriceChange(e.target.value)}
                      placeholder={`Min ${sym}${(parseFloat(modalProduct.source_price) + 1).toFixed(2)}`} style={{ ...inp, fontSize: '1rem', fontWeight: 600 }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Or profit margin (%)</label>
                    <input type="number" value={profitMargin} onChange={e => handleMarginChange(e.target.value)} placeholder="e.g. 30" style={{ ...inp, fontSize: '1rem' }} />
                  </div>
                  {sellingPrice && parseFloat(sellingPrice) > parseFloat(modalProduct.source_price) && (
                    <div style={{ background: '#cdfed4', border: '1px solid #92fcac', borderRadius: 8, padding: 12, marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                      {[{ label: 'You pay', val: `${sym}${modalProduct.source_price}` }, { label: 'Customer pays', val: `${sym}${parseFloat(sellingPrice).toFixed(2)}` }, { label: 'Your profit', val: `${sym}${(sellingPrice - modalProduct.source_price).toFixed(2)}`, green: true }].map((s, i) => (
                        <div key={i}>
                          <div style={{ fontSize: '0.6875rem', color: '#006847', marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontWeight: 650, fontSize: P.fontSize, color: '#006847' }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {listMessage && <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontSize: P.fontSize, background: listMessage.includes('Failed') || listMessage.includes('error') ? '#fee8eb' : '#cdfed4', color: listMessage.includes('Failed') || listMessage.includes('error') ? '#d82c0d' : '#006847' }}>{listMessage}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn onClick={closeModal} style={{ flex: 1 }}>Cancel</Btn>
                    <button onClick={handleSetPrice} disabled={listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price)} style={{ flex: 2, padding: '8px', background: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price) ? P.bg : P.text, color: listing ? P.textSubdued : '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font, letterSpacing: P.letterSpacing }}>
                      {listing ? 'Saving...' : 'Save listing'}
                    </button>
                  </div>
                </>
              )}

              {modalType === 'edit' && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Title</label>
                    <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={inp} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Description</label>
                    <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} rows={5} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  {listMessage && <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontSize: P.fontSize, background: '#cdfed4', color: '#006847' }}>{listMessage}</div>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn onClick={closeModal}>Cancel</Btn>
                    <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 1, padding: '8px', background: saving ? P.bg : P.text, color: saving ? P.textSubdued : '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font, letterSpacing: P.letterSpacing }}>
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </>
              )}

              {modalType === 'image' && (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {getImages(modalProduct.images).map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: 76, height: 76, objectFit: 'cover', borderRadius: 8, border: `1px solid ${P.border}` }} onError={e => e.target.style.display = 'none'} />
                    ))}
                    <div onClick={() => fileInputRef.current?.click()} style={{ width: 76, height: 76, border: `2px dashed ${P.border}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: P.textSubdued, fontSize: 20 }}>
                      +<span style={{ fontSize: '0.625rem', marginTop: 2 }}>Add</span>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                  </div>
                  <Btn onClick={closeModal} style={{ width: '100%' }}>Close</Btn>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}