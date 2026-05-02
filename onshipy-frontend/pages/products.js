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

const Btn = ({ children, onClick, variant = 'secondary', disabled, style = {} }) => {
  const s = {
    primary:  { background: P.text, color: '#fff', border: 'none' },
    secondary:{ background: P.surface, color: P.text, border: `1px solid ${P.border}` },
    green:    { background: P.green, color: '#fff', border: 'none' },
    danger:   { background: P.surface, color: '#d82c0d', border: '1px solid rgba(216,44,13,0.3)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...s[variant], padding: '6px 14px', borderRadius: 8,
      fontSize: P.fontSize, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: P.font, letterSpacing: P.letterSpacing,
      opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap', ...style
    }}>{children}</button>
  );
};

const TABS = [
  { id: 'products',        label: 'All' },
  { id: 'inventory',       label: 'Inventory' },
  { id: 'purchase_orders', label: 'Purchase orders' },
  { id: 'transfers',       label: 'Transfers' },
  { id: 'gift_cards',      label: 'Gift cards' },
];

export default function Products() {
  const router = useRouter();
  const tokenRef = useRef('');
  const section = router.query.section || 'products';
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [sellingPrice, setSellingPrice] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [listing, setListing] = useState(false);
  const [listMessage, setListMessage] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    fetchAll(t);
  }, []);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async (t) => {
    setLoading(true);
    const tok = t || tokenRef.current;
    try {
      const [p, l] = await Promise.all([
        fetch(`${API_BASE}/api/products`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
        fetch(`${API_BASE}/api/products/listings/all`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      ]);
      if (p.products) setProducts(p.products);
      if (l.listings) setListings(l.listings);
    } catch {}
    setLoading(false);
  };

  const getImages = (images) => {
    try {
      if (!images) return [];
      return typeof images === 'string' ? JSON.parse(images) : (Array.isArray(images) ? images : []);
    } catch { return []; }
  };

  const getVariants = (variants) => {
    try {
      if (!variants) return [];
      return typeof variants === 'string' ? JSON.parse(variants) : (Array.isArray(variants) ? variants : []);
    } catch { return []; }
  };

  const sym = (currency) => ({ GBP: '£', USD: '$', EUR: '€', JPY: '¥', CAD: 'CA$', AUD: 'A$' }[currency] || '$');

  const openProduct = (p) => {
    setSelected(p);
    setActiveImage(0);
    setEditData({ title: p.title, description: p.description || '', images: getImages(p.images) });
    setSellingPrice(''); setProfitMargin(''); setListMessage('');
    setSelectedVariants({}); setEditing(false);
  };

  const closePanel = () => { setSelected(null); setEditing(false); setActiveImage(0); };

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${selected.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      if (res.ok) { setProducts(p => p.filter(x => x.id !== selected.id)); closePanel(); showToast('Product deleted'); }
      else { const d = await res.json(); showToast(d.error || 'Delete failed', true); }
    } catch (err) { showToast('Error: ' + err.message, true); }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ title: editData.title, description: editData.description, images: JSON.stringify(editData.images) })
      });
      if (res.ok) {
        const updated = { ...selected, title: editData.title, description: editData.description, images: JSON.stringify(editData.images) };
        setProducts(p => p.map(x => x.id === selected.id ? updated : x));
        setSelected(updated); setEditing(false);
        showToast('Saved successfully');
      } else { const d = await res.json(); showToast(d.error || 'Save failed', true); }
    } catch (err) { showToast('Error: ' + err.message, true); }
    setSaving(false);
  };

  const handlePriceChange = (val) => {
    setSellingPrice(val);
    if (val && selected?.source_price) setProfitMargin((((val - selected.source_price) / val) * 100).toFixed(1));
  };
  const handleMarginChange = (val) => {
    setProfitMargin(val);
    if (val && selected?.source_price) setSellingPrice((selected.source_price / (1 - val / 100)).toFixed(2));
  };

  const handleSetPrice = async () => {
    if (!sellingPrice || !selected) return;
    setListing(true); setListMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/products/${selected.id}/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ selling_price: parseFloat(sellingPrice), custom_title: editData.title || selected.title })
      });
      const data = await res.json();
      if (!res.ok) { setListMessage(data.error || 'Failed'); return; }
      setListMessage(`Listed at ${sym(selected.currency)}${parseFloat(sellingPrice).toFixed(2)} · Profit: ${sym(selected.currency)}${data.profit_per_sale} (${data.margin_percent}%)`);
      fetchAll();
    } catch { setListMessage('Connection error'); }
    setListing(false);
  };

  const handleImageUpload = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setEditData(prev => ({ ...prev, images: [...(prev.images || []), ev.target.result] }));
        if (!editing) setEditing(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const isListed = (p) => listings.some(l => l.imported_product_id === p.id);

  const filtered = search
    ? products.filter(p => (p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.source_domain || '').toLowerCase().includes(search.toLowerCase()))
    : products;

  const images = editing ? (editData.images || []) : (selected ? getImages(selected.images) : []);
  const variants = selected ? getVariants(selected.variants) : [];
  const groupedVariants = variants.reduce((acc, v) => {
    if (v.option && v.value) {
      if (!acc[v.option]) acc[v.option] = [];
      if (!acc[v.option].includes(v.value)) acc[v.option].push(v.value);
    }
    return acc;
  }, {});

  const th = {
    padding: '8px 14px', fontSize: '0.6875rem', fontWeight: 600,
    color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em',
    textAlign: 'left', borderBottom: `1px solid ${P.border}`,
    background: '#fafafa', userSelect: 'none', fontFamily: P.font,
  };
  const td = {
    padding: '11px 14px', fontSize: P.fontSize, borderBottom: `1px solid ${P.border}`,
    verticalAlign: 'middle', color: P.text, letterSpacing: P.letterSpacing,
  };

  const SubEmptyState = ({ title, desc, actions }) => (
    <div style={{ padding: '80px 40px', textAlign: 'center' }}>
      <div style={{ fontWeight: 650, fontSize: '1rem', color: P.text, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>{desc}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>{actions}</div>
    </div>
  );

  return (
    <Layout title="Products">
      <style>{`
        .prod-row:hover { background: #fafafa !important; }
        .sub-tab { padding: 7px 14px; background: none; border: none; border-bottom: 2.5px solid transparent; font-size: ${P.fontSize}; color: ${P.textSubdued}; cursor: pointer; font-family: ${P.font}; letter-spacing: ${P.letterSpacing}; font-weight: ${P.fontWeight}; white-space: nowrap; transition: color .1s; }
        .sub-tab.active { color: ${P.text}; font-weight: 600; border-bottom-color: ${P.text}; }
        .sub-tab:hover:not(.active) { color: ${P.text}; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.err ? '#d82c0d' : P.text, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}

      {lightbox.open && images.length > 0 && (
        <div onClick={() => setLightbox({ open: false, index: 0 })} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightbox({ open: false, index: 0 })} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>×</button>
          {lightbox.index > 0 && <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: l.index - 1 })); }} style={{ position: 'absolute', left: 24, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>}
          <img src={images[lightbox.index]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 6 }} onError={e => e.target.style.display = 'none'} />
          {lightbox.index < images.length - 1 && <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: l.index + 1 })); }} style={{ position: 'absolute', right: 24, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>}
        </div>
      )}

      <div style={{ fontFamily: P.font, fontSize: P.fontSize, letterSpacing: P.letterSpacing, color: P.text, display: 'flex', height: 'calc(100vh - 56px)' }}>

        {/* ── Main content ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: P.bg, minWidth: 0 }}>

          {/* ── Shared header ── */}
          <div style={{ padding: '12px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill={P.textSubdued}><path d="M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11ZM10 3.65l5.514 2.45L10 8.55 4.486 6.1 10 3.65ZM3.5 7.365 9.25 9.9v6.183l-5.75-2.556V7.365Zm7.25 8.718V9.9l5.75-2.535v6.162l-5.75 2.556Z"/></svg>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: 0, letterSpacing: '-0.02em' }}>Products</h1>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn>More actions ▾</Btn>
                <Btn variant="primary" onClick={() => router.push('/dashboard')}>+ Add product</Btn>
                <Btn onClick={() => router.push('/browse')}>↓ Import</Btn>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${P.border}` }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`sub-tab${section === tab.id ? ' active' : ''}`}
                  onClick={() => router.push(tab.id === 'products' ? '/products' : `/products?section=${tab.id}`)}
                >
                  {tab.label}
                  {tab.id === 'products' && (
                    <span style={{ marginLeft: 5, fontSize: '0.625rem', background: P.bg, color: P.textSubdued, padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>{products.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── ALL PRODUCTS ── */}
          {section === 'products' && (
            <>
              {/* Main white card */}
              <div style={{ background: P.surface, margin: '8px 16px 0', borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                {/* Search + filter row */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                    <svg width="14" height="14" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search products..."
                      style={{ width: '100%', padding: '7px 12px 7px 32px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, color: P.text, background: P.surface, boxSizing: 'border-box' }}/>
                  </div>
                  <Btn>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 4 }}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
                    Filter
                  </Btn>
                  <Btn>Sort ▾</Btn>
                </div>

                {/* Loading */}
                {loading && (
                  <div style={{ padding: '60px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${P.green}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }}/>
                    Loading products...
                  </div>
                )}

                {/* Empty state */}
                {!loading && products.length === 0 && (
                  <div style={{ padding: '60px 40px', animation: 'fadeIn .3s ease' }}>
                    <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ fontWeight: 650, fontSize: '1.125rem', color: P.text, marginBottom: 8 }}>Add your products</div>
                        <div style={{ fontSize: P.fontSize, color: P.textSubdued, lineHeight: 1.6, marginBottom: 20 }}>
                          Start by stocking your store with products your customers will love. Import from Nike, ASOS, Amazon, and thousands more.
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Btn variant="primary" onClick={() => router.push('/dashboard')}>+ Add product</Btn>
                          <Btn onClick={() => router.push('/browse')}>↓ Import</Btn>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flexShrink: 0 }}>
                        {[0,1,2,3].map(i => (
                          <div key={i} style={{ width: 80, height: 80, background: P.bg, borderRadius: 10, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="32" height="32" viewBox="0 0 20 20" fill={P.border}><path d="M10.4 2.143a1 1 0 0 0-.8 0l-7 3.11A1 1 0 0 0 2 6.167V13.833a1 1 0 0 0 .6.924l7 3.11a1 1 0 0 0 .8 0l7-3.11A1 1 0 0 0 18 13.833V6.167a1 1 0 0 0-.6-.924l-7-3.11Z"/></svg>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 24, padding: '16px 20px', background: P.bg, borderRadius: 10, border: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 2 }}>Discover wholesale products with Onshipy Browse</div>
                        <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>Import from Nike, ASOS, Amazon, Zara and thousands of brands worldwide</div>
                      </div>
                      <Btn onClick={() => router.push('/browse')}>Browse brands →</Btn>
                    </div>
                  </div>
                )}

                {/* Products table */}
                {!loading && filtered.length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ ...th, width: 40, paddingRight: 0 }}><input type="checkbox" style={{ accentColor: P.green }}/></th>
                        <th style={th}></th>
                        <th style={th}>Product</th>
                        <th style={th}>Status</th>
                        <th style={th}>Inventory</th>
                        <th style={th}>Source price</th>
                        <th style={th}>Listed</th>
                        <th style={th}>Variants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => {
                        const imgs = getImages(p.images);
                        const pvars = getVariants(p.variants);
                        const listed = isListed(p);
                        return (
                          <tr key={p.id} className="prod-row"
                            onClick={() => openProduct(p)}
                            style={{ cursor: 'pointer', background: selected?.id === p.id ? '#f0fdf6' : P.surface }}>
                            <td style={{ ...td, width: 40, paddingRight: 0 }} onClick={e => e.stopPropagation()}>
                              <input type="checkbox" style={{ accentColor: P.green }}/>
                            </td>
                            <td style={{ ...td, width: 44, paddingRight: 0 }}>
                              {imgs[0]
                                ? <img src={imgs[0]} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, border: `1px solid ${P.border}`, display: 'block' }} onError={e => e.target.style.display = 'none'}/>
                                : <div style={{ width: 32, height: 32, background: P.bg, borderRadius: 6, border: `1px solid ${P.border}` }}/>}
                            </td>
                            <td style={td}>
                              <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260, color: '#2b6cb0' }}>{p.title}</div>
                              <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>{p.source_domain} · {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            </td>
                            <td style={td}>
                              <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: p.scrape_status === 'completed' ? '#cdfed4' : '#fff8db', color: p.scrape_status === 'completed' ? '#006847' : '#7c5a00', fontWeight: 600 }}>
                                {p.scrape_status === 'completed' ? 'Active' : p.scrape_status}
                              </span>
                            </td>
                            <td style={{ ...td, color: P.textSubdued }}>—</td>
                            <td style={{ ...td, fontWeight: 600 }}>{sym(p.currency)}{parseFloat(p.source_price).toFixed(2)}</td>
                            <td style={td}>
                              {listed
                                ? <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>● Listed</span>
                                : <span style={{ fontSize: '0.6875rem', color: P.textSubdued }}>Not listed</span>}
                            </td>
                            <td style={td}>
                              {pvars.length > 0
                                ? <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#eaf4ff', color: '#1d4ed8', fontWeight: 600 }}>{pvars.length}</span>
                                : <span style={{ color: P.textSubdued }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {!loading && filtered.length === 0 && products.length > 0 && (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>No products match your search</div>
                  </div>
                )}
              </div>

              {/* Learn more — gray area */}
              <div style={{ padding: '12px 20px 32px', textAlign: 'center' }}>
                <span style={{ color: '#2b6cb0', cursor: 'pointer', fontSize: P.fontSize }}>Learn more about products</span>
              </div>
            </>
          )}

          {/* ── INVENTORY ── */}
          {section === 'inventory' && (
            <>
              <div style={{ background: P.surface, margin: '8px 16px 0', borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                <SubEmptyState
                  title="Keep track of your inventory"
                  desc="When you enable inventory tracking on your products, you can view and adjust their inventory counts here."
                  actions={<Btn variant="primary" onClick={() => router.push('/products')}>Go to products</Btn>}
                />
              </div>
              <div style={{ padding: '12px 20px 32px', textAlign: 'center' }}>
                <span style={{ color: '#2b6cb0', cursor: 'pointer', fontSize: P.fontSize }}>Learn more about managing inventory</span>
              </div>
            </>
          )}

          {/* ── PURCHASE ORDERS ── */}
          {section === 'purchase_orders' && (
            <>
              <div style={{ background: P.surface, margin: '8px 16px 0', borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                <SubEmptyState
                  title="Manage your purchase orders"
                  desc="Track and receive inventory ordered from suppliers."
                  actions={<Btn variant="primary">Create purchase order</Btn>}
                />
              </div>
              <div style={{ padding: '12px 20px 32px', textAlign: 'center' }}>
                <span style={{ color: '#2b6cb0', cursor: 'pointer', fontSize: P.fontSize }}>Learn more about purchase orders</span>
              </div>
            </>
          )}

          {/* ── TRANSFERS ── */}
          {section === 'transfers' && (
            <>
              <div style={{ background: P.surface, margin: '8px 16px 0', borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                <SubEmptyState
                  title="Move inventory between locations"
                  desc="Move and track inventory between your business locations."
                  actions={<Btn variant="primary">Create transfer</Btn>}
                />
              </div>
              <div style={{ padding: '12px 20px 32px', textAlign: 'center' }}>
                <span style={{ color: '#2b6cb0', cursor: 'pointer', fontSize: P.fontSize }}>Learn more about transfers</span>
              </div>
            </>
          )}

          {/* ── GIFT CARDS ── */}
          {section === 'gift_cards' && (
            <>
              <div style={{ background: P.surface, margin: '8px 16px 0', borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                <SubEmptyState
                  title="Start selling gift cards"
                  desc="Add gift card products to sell or create gift cards and send them directly to your customers."
                  actions={[
                    <Btn key="1">Create gift card</Btn>,
                    <Btn key="2" variant="primary">Add gift card product</Btn>
                  ]}
                />
              </div>
              <div style={{ padding: '12px 20px 8px', textAlign: 'center', fontSize: P.fontSize, color: P.textSubdued }}>
                By using gift cards, you agree to our <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>Terms of Service</span>
              </div>
              <div style={{ padding: '4px 20px 32px', textAlign: 'center' }}>
                <span style={{ color: '#2b6cb0', cursor: 'pointer', fontSize: P.fontSize }}>Learn more about gift cards</span>
              </div>
            </>
          )}
        </div>

        {/* ── Product detail panel ── */}
        {selected && section === 'products' && (
          <div style={{ width: 420, flexShrink: 0, background: P.surface, borderLeft: `1px solid ${P.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column', animation: 'fadeIn .2s ease' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: P.surface, zIndex: 10 }}>
              <span style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Product details</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="danger" onClick={handleDelete} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Delete</Btn>
                <button onClick={closePanel} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: P.textSubdued, padding: '0 4px' }}>×</button>
              </div>
            </div>

            <div style={{ padding: 16, flex: 1 }}>
              {images.length > 0 ? (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <img src={images[activeImage]} alt="" onClick={() => setLightbox({ open: true, index: activeImage })}
                      style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, border: `1px solid ${P.border}`, cursor: 'zoom-in', display: 'block' }}
                      onError={e => e.target.style.display = 'none'}/>
                    <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 8px', borderRadius: 20, fontSize: '0.6875rem' }}>
                      {activeImage + 1}/{images.length}
                    </div>
                    {activeImage > 0 && <button onClick={() => setActiveImage(activeImage - 1)} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>}
                    {activeImage < images.length - 1 && <button onClick={() => setActiveImage(activeImage + 1)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {images.slice(0, 6).map((img, i) => (
                      <img key={i} src={img} alt="" onClick={() => setActiveImage(i)} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: activeImage === i ? `2px solid ${P.text}` : `1px solid ${P.border}`, opacity: activeImage === i ? 1 : 0.6 }} onError={e => e.target.style.display = 'none'}/>
                    ))}
                    <div onClick={() => fileInputRef.current?.click()} style={{ width: 44, height: 44, border: `1px dashed ${P.border}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: P.textSubdued, fontSize: 18 }}>+</div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }}/>
                  </div>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} style={{ height: 140, border: `1px dashed ${P.border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: P.textSubdued, marginBottom: 14 }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>+</div>
                  <div style={{ fontSize: P.fontSize }}>Upload images</div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }}/>
                </div>
              )}

              <div style={{ background: P.bg, borderRadius: 8, border: `1px solid ${P.border}`, padding: '10px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: P.textSubdued, marginBottom: 1 }}>Source</div>
                  <a href={selected.source_url} target="_blank" rel="noreferrer" style={{ fontSize: P.fontSize, color: '#2b6cb0', fontWeight: 500, textDecoration: 'none' }}>
                    {selected.source_domain} ↗
                  </a>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: P.textSubdued, marginBottom: 1, textAlign: 'right' }}>Source price</div>
                  <div style={{ fontSize: '1rem', fontWeight: 650, color: P.text }}>{sym(selected.currency)}{parseFloat(selected.source_price).toFixed(2)}</div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
                  {!editing && <button onClick={() => setEditing(true)} style={{ fontSize: P.fontSize, color: P.green, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: P.font }}>Edit</button>}
                </div>
                {editing
                  ? <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={{ width: '100%', padding: '7px 10px', border: `1px solid ${P.text}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, boxSizing: 'border-box' }}/>
                  : <div style={{ fontSize: P.fontSize, color: P.text, fontWeight: 500, lineHeight: 1.5 }}>{selected.title}</div>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Description</label>
                {editing
                  ? <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} rows={4} style={{ width: '100%', padding: '7px 10px', border: `1px solid ${P.text}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: P.font, lineHeight: 1.6 }}/>
                  : <div style={{ fontSize: P.fontSize, color: P.textSubdued, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.description || 'No description. Click Edit to add one.'}</div>}
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <Btn onClick={() => { setEditing(false); setEditData({ title: selected.title, description: selected.description || '', images: getImages(selected.images) }); }} style={{ flex: 1, textAlign: 'center' }}>Cancel</Btn>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '7px', background: saving ? P.bg : P.text, color: saving ? P.textSubdued : '#fff', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              )}

              {Object.keys(groupedVariants).length > 0 && (
                <div style={{ marginBottom: 14, paddingTop: 14, borderTop: `1px solid ${P.border}` }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Variants</div>
                  {Object.entries(groupedVariants).map(([opt, vals]) => (
                    <div key={opt} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 6 }}>{opt}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {vals.map(val => {
                          const isSelected = selectedVariants[opt] === val;
                          const isColor = opt.toLowerCase().includes('color') || opt.toLowerCase().includes('colour');
                          return (
                            <button key={val} onClick={() => setSelectedVariants(p => ({ ...p, [opt]: isSelected ? null : val }))} style={{
                              padding: isColor ? 0 : '4px 10px',
                              width: isColor ? 24 : 'auto', height: isColor ? 24 : 'auto',
                              borderRadius: isColor ? '50%' : 6,
                              border: isSelected ? `2px solid ${P.text}` : `1px solid ${P.border}`,
                              background: isColor ? val.toLowerCase() : isSelected ? P.text : P.surface,
                              color: isSelected && !isColor ? '#fff' : P.text,
                              fontSize: P.fontSize, cursor: 'pointer', fontFamily: P.font,
                            }} title={val}>{isColor ? '' : val}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ paddingTop: 14, borderTop: `1px solid ${P.border}` }}>
                <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 12 }}>Set selling price</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    Selling price ({selected.currency})
                  </label>
                  <input type="number" value={sellingPrice} onChange={e => handlePriceChange(e.target.value)}
                    placeholder={`Min ${sym(selected.currency)}${(parseFloat(selected.source_price) + 1).toFixed(2)}`}
                    style={{ width: '100%', padding: '7px 10px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: '1rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box', fontFamily: P.font }}/>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    Or profit margin (%)
                  </label>
                  <input type="number" value={profitMargin} onChange={e => handleMarginChange(e.target.value)}
                    placeholder="e.g. 30"
                    style={{ width: '100%', padding: '7px 10px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: P.font }}/>
                </div>

                {sellingPrice && parseFloat(sellingPrice) > parseFloat(selected.source_price) && (
                  <div style={{ background: '#f0fdf6', border: '1px solid #92fcac', borderRadius: 8, padding: 12, marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                    {[
                      { label: 'You pay', val: `${sym(selected.currency)}${parseFloat(selected.source_price).toFixed(2)}` },
                      { label: 'Customer pays', val: `${sym(selected.currency)}${parseFloat(sellingPrice).toFixed(2)}` },
                      { label: 'Profit', val: `${sym(selected.currency)}${(sellingPrice - selected.source_price).toFixed(2)}`, green: true },
                    ].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontSize: '0.6875rem', color: '#006847', marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontWeight: 650, fontSize: P.fontSize, color: s.green ? P.green : P.text }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {listMessage && (
                  <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 10, fontSize: P.fontSize, background: listMessage.includes('error') || listMessage.includes('Failed') ? '#fee8eb' : '#cdfed4', color: listMessage.includes('error') || listMessage.includes('Failed') ? '#d82c0d' : '#006847' }}>
                    {listMessage}
                  </div>
                )}

                <button onClick={handleSetPrice} disabled={listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(selected.source_price)} style={{
                  width: '100%', padding: '9px', background: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(selected.source_price) ? P.bg : P.green,
                  color: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(selected.source_price) ? P.textSubdued : '#fff',
                  border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 600, cursor: 'pointer', fontFamily: P.font,
                }}>
                  {listing ? 'Saving...' : isListed(selected) ? 'Update listing' : 'Save listing'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
