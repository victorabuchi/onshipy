import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    } catch (err) { console.error(err); }
  };

  const getImages = (images) => {
    try {
      if (!images) return [];
      if (typeof images === 'string') return JSON.parse(images);
      if (Array.isArray(images)) return images;
      return [];
    } catch { return []; }
  };

  const getCurrencySymbol = (currency) => {
    const s = { GBP: '£', USD: '$', EUR: '€', JPY: '¥', CAD: 'CA$', AUD: 'A$' };
    return s[currency] || '$';
  };

  const handleImport = async () => {
    if (!url.trim()) return;
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    setImporting(true);
    setMessage('loading');
    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) { setMessage('error:' + (data.error || 'Import failed')); return; }
      setUrl('');
      setMessage('success');
      await fetchAll();
      setTimeout(() => setMessage(''), 5000);
    } catch (err) { setMessage('error:' + err.message); }
    finally { setImporting(false); }
  };

  const openModal = (product, type) => {
    setModalProduct(product);
    setModalType(type);
    setSellingPrice('');
    setProfitMargin('');
    setListMessage('');
    setEditData({ title: product.title, description: product.description || '' });
  };

  const closeModal = () => { setModalProduct(null); setModalType(''); };

  const handlePriceChange = (val) => {
    setSellingPrice(val);
    if (val && modalProduct?.source_price) {
      setProfitMargin((((val - modalProduct.source_price) / val) * 100).toFixed(1));
    }
  };

  const handleMarginChange = (val) => {
    setProfitMargin(val);
    if (val && modalProduct?.source_price) {
      setSellingPrice((modalProduct.source_price / (1 - val / 100)).toFixed(2));
    }
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
      setListMessage(`Listed at ${getCurrencySymbol(modalProduct.currency)}${parseFloat(sellingPrice).toFixed(2)} — Profit: ${getCurrencySymbol(modalProduct.currency)}${data.profit_per_sale}`);
      await fetchAll();
      setTimeout(() => closeModal(), 2500);
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
      await fetch(`${API_BASE}/api/products/${product.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
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
  const sym = modalProduct ? getCurrencySymbol(modalProduct.currency) : '$';

  const revenue = orders.reduce((s, o) => s + parseFloat(o.amount_paid || 0), 0).toFixed(0);

  // ── Shared style tokens ───────────────────────────────────────────────────
  const card = { background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' };
  const cardHeader = { padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const btnPrimary = { padding: '8px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' };
  const btnSecondary = { padding: '8px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151', fontFamily: 'inherit' };

  return (
    <Layout title="Home">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.3px' }}>
            Hey {seller?.full_name?.split(' ')[0] || 'there'}, let's get started.
          </h1>
          <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14 }}>
            {seller?.store_name || 'Your store'} · <span style={{ color: '#008060', fontWeight: 500 }}>{seller?.plan || 'free'} plan</span>
          </p>
        </div>

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Sessions', value: '—', sub: '', href: '/analytics' },
            { label: 'Total sales', value: `$${revenue}`, sub: orders.length > 0 ? `${orders.length} orders` : '—', href: '/orders' },
            { label: 'Orders', value: orders.length, sub: orders.length > 0 ? 'this month' : '—', href: '/orders' },
            { label: 'Conversion rate', value: '0%', sub: '—', href: '/analytics' },
          ].map((s, i) => (
            <div key={i} onClick={() => router.push(s.href)} style={{
              ...card, padding: '16px 18px', cursor: 'pointer',
              transition: 'box-shadow .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</span>
                <svg width="14" height="14" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Getting started ────────────────────────────────────────────── */}
        <div style={{ ...card, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ ...cardHeader }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>Getting started</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{completedSteps} of {steps.length} tasks complete</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#008060' }}>{Math.round(progressPct)}%</span>
          </div>
          <div style={{ height: 4, background: '#f3f4f6' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: '#008060', transition: 'width .4s ease' }} />
          </div>
          {steps.map((step, i) => (
            <div key={i} onClick={step.action} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < steps.length - 1 ? '1px solid #f9fafb' : 'none',
              cursor: 'pointer', background: step.done ? '#fafff9' : '#fff',
              transition: 'background .12s',
            }}
              onMouseEnter={e => { if (!step.done) e.currentTarget.style.background = '#fafafa'; }}
              onMouseLeave={e => e.currentTarget.style.background = step.done ? '#fafff9' : '#fff'}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: step.done ? '#008060' : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {step.done
                  ? <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>{step.num}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: step.done ? '#9ca3af' : '#111', textDecoration: step.done ? 'line-through' : 'none' }}>{step.title}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{step.desc} · ~{step.time}</div>
              </div>
              {!step.done
                ? <span style={{ fontSize: 13, color: '#008060', fontWeight: 600, flexShrink: 0 }}>Start →</span>
                : <span style={{ fontSize: 11, padding: '2px 8px', background: '#dcfce7', color: '#008060', borderRadius: 20, fontWeight: 600, flexShrink: 0 }}>Done</span>
              }
            </div>
          ))}
        </div>

        {/* ── Import a product ───────────────────────────────────────────── */}
        <div style={{ ...card, padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#111', marginBottom: 4 }}>Import a product</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
            Paste any product URL from Nike, ASOS, Amazon, Zara and thousands of other websites
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="import-input"
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !importing && handleImport()}
              placeholder="https://www.nike.com/product/..."
              style={{ ...inp, flex: 1 }}
            />
            <button
              onClick={handleImport}
              disabled={importing || !url.trim()}
              style={{ ...btnPrimary, opacity: importing || !url.trim() ? 0.5 : 1, cursor: importing || !url.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>

          {message === 'loading' && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Importing product details', 'Fetching images', 'Detecting price & currency'].map((label, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #008060', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
                </div>
              ))}
            </div>
          )}
          {message === 'success' && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#008060', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>✓ Product imported successfully!</span>
              <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#008060', cursor: 'pointer', fontWeight: 600, fontSize: 13, textDecoration: 'underline' }}>View Products</button>
            </div>
          )}
          {message.startsWith('error:') && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
              {message.replace('error:', '')}
            </div>
          )}
        </div>

        {/* ── My Products ────────────────────────────────────────────────── */}
        <div style={{ ...card, overflow: 'hidden', marginBottom: 20 }}>
          <div style={cardHeader}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>My Products</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{products.length} imported</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fetchAll()} style={btnSecondary}>Refresh</button>
              <button onClick={() => router.push('/products')} style={btnPrimary}>View all</button>
            </div>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111', marginBottom: 6 }}>No products yet</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>Import your first product using the bar above</div>
            </div>
          ) : (
            <>
              {products.slice(0, 5).map((p, i) => {
                const imgs = getImages(p.images);
                const isListed = listings.some(l => l.imported_product_id === p.id);
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 20px',
                    borderBottom: i < Math.min(products.length, 5) - 1 ? '1px solid #f9fafb' : 'none',
                    transition: 'background .1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                      {imgs[0]
                        ? <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{p.source_domain}</span>
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{getCurrencySymbol(p.currency)}{p.source_price}</span>
                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: isListed ? '#dcfce7' : '#f3f4f6', color: isListed ? '#008060' : '#6b7280', fontWeight: 500 }}>
                          {isListed ? '● Listed' : 'Not listed'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {[
                        { label: 'Edit', action: () => openModal(p, 'edit'), style: btnSecondary },
                        { label: isListed ? 'Update price' : 'Set price', action: () => openModal(p, 'price'), style: btnPrimary },
                        { label: 'Images', action: () => openModal(p, 'image'), style: btnSecondary },
                        { label: 'Push', action: () => router.push('/online-store'), style: { ...btnSecondary, color: '#008060', borderColor: '#bbf7d0', background: '#f0fdf4' } },
                        { label: 'Delete', action: () => handleDelete(p), style: { ...btnSecondary, color: '#dc2626', borderColor: '#fecaca', background: '#fff' } },
                      ].map((btn, bi) => (
                        <button key={bi} onClick={btn.action} style={{ ...btn.style, padding: '5px 10px', fontSize: 12 }}>{btn.label}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {products.length > 5 && (
                <div style={{ padding: '12px 20px', textAlign: 'center', borderTop: '1px solid #f3f4f6' }}>
                  <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#008060', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    View all {products.length} products →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Quick actions ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { title: 'Browse brands', desc: 'Find products from top brands', href: '/browse', emoji: '🔍' },
            { title: 'My listings', desc: 'Manage priced products', href: '/listings', emoji: '📋' },
            { title: 'Connect store', desc: 'Link Shopify & more', href: '/online-store', emoji: '🔗' },
            { title: 'Analytics', desc: 'Track revenue & profit', href: '/analytics', emoji: '📊' },
          ].map((item, i) => (
            <div key={i} onClick={() => router.push(item.href)} style={{
              ...card, padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{item.emoji}</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#111', marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Recent orders ──────────────────────────────────────────────── */}
        {orders.length > 0 && (
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={cardHeader}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>Recent orders</div>
              <button onClick={() => router.push('/orders')} style={{ background: 'none', border: 'none', color: '#008060', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>View all</button>
            </div>
            {orders.slice(0, 3).map((o, i) => (
              <div key={o.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 20px', borderBottom: i < 2 ? '1px solid #f9fafb' : 'none',
                transition: 'background .1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: '#111' }}>#{o.storefront_order_id || o.id.slice(0, 8)}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{o.customer_name} · {new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>${o.amount_paid}</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: o.status === 'delivered' ? '#dcfce7' : o.status === 'shipped' ? '#dbeafe' : '#fef9c3',
                    color: o.status === 'delivered' ? '#008060' : o.status === 'shipped' ? '#1d4ed8' : '#92400e'
                  }}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modalProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111' }}>
                {modalType === 'price' && 'Set selling price'}
                {modalType === 'edit' && 'Edit product'}
                {modalType === 'image' && 'Manage images'}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{modalProduct.title}</div>

              {modalType === 'price' && (
                <>
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Source price</div>
                      <div style={{ fontWeight: 700, fontSize: 20 }}>{sym}{modalProduct.source_price}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>From</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{modalProduct.source_domain}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Selling price ({modalProduct.currency})</label>
                    <input type="number" value={sellingPrice} onChange={e => handlePriceChange(e.target.value)}
                      placeholder={`Min ${sym}${(parseFloat(modalProduct.source_price) + 1).toFixed(2)}`}
                      style={{ ...inp, fontSize: 16, fontWeight: 600 }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Or profit margin (%)</label>
                    <input type="number" value={profitMargin} onChange={e => handleMarginChange(e.target.value)} placeholder="e.g. 30" style={{ ...inp, fontSize: 16 }} />
                  </div>
                  {sellingPrice && parseFloat(sellingPrice) > parseFloat(modalProduct.source_price) && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, marginBottom: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                      {[
                        { label: 'You pay', val: `${sym}${modalProduct.source_price}` },
                        { label: 'Customer pays', val: `${sym}${parseFloat(sellingPrice).toFixed(2)}` },
                        { label: 'Your profit', val: `${sym}${(sellingPrice - modalProduct.source_price).toFixed(2)}`, green: true },
                      ].map((s, i) => (
                        <div key={i}>
                          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>{s.label}</div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: s.green ? '#008060' : '#111' }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {listMessage && (
                    <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: listMessage.includes('error') || listMessage.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: listMessage.includes('error') || listMessage.includes('Failed') ? '#dc2626' : '#008060' }}>
                      {listMessage}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={closeModal} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
                    <button onClick={handleSetPrice} disabled={listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price)} style={{ ...btnPrimary, flex: 2, opacity: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price) ? 0.5 : 1, cursor: listing ? 'not-allowed' : 'pointer' }}>
                      {listing ? 'Saving...' : 'Save listing'}
                    </button>
                  </div>
                </>
              )}

              {modalType === 'edit' && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Title</label>
                    <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={inp} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description</label>
                    <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} rows={5} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
                  </div>
                  {listMessage && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, background: '#f0fdf4', color: '#008060' }}>{listMessage}</div>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={closeModal} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
                    <button onClick={handleSaveEdit} disabled={saving} style={{ ...btnPrimary, flex: 2, opacity: saving ? 0.5 : 1 }}>{saving ? 'Saving...' : 'Save changes'}</button>
                  </div>
                </>
              )}

              {modalType === 'image' && (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {getImages(modalProduct.images).map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} onError={e => e.target.style.display = 'none'} />
                    ))}
                    <div onClick={() => fileInputRef.current?.click()} style={{ width: 80, height: 80, border: '2px dashed #e5e7eb', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', fontSize: 22 }}>
                      +<span style={{ fontSize: 10, marginTop: 2 }}>Add</span>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                  </div>
                  <button onClick={closeModal} style={{ ...btnSecondary, width: '100%' }}>Close</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}