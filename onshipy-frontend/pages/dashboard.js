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
      if (res.ok) {
        await fetchAll();
        setListMessage('Saved successfully!');
        setTimeout(() => closeModal(), 1500);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (product) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`${API_BASE}/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenRef.current}` }
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
    { num: 2, title: 'Set your price', desc: 'Set a selling price and profit margin on your product', done: listings.length > 0, time: '2 min', action: () => router.push('/products') },
    { num: 3, title: 'Connect your store', desc: 'Link your Shopify, WooCommerce or custom store', done: false, time: '5 min', action: () => router.push('/online-store') },
    { num: 4, title: 'Push products', desc: 'Publish your listed products to your connected store', done: false, time: '1 min', action: () => router.push('/online-store') },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const progressPct = (completedSteps / steps.length) * 100;

  const sym = modalProduct ? getCurrencySymbol(modalProduct.currency) : '$';

  return (
    <Layout>
      <div style={{ background: '#f1f2f4', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 20px 60px' }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: 0 }}>
              Welcome back, {seller?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>
              {seller?.store_name || 'Your store'} · {seller?.plan || 'free'} plan
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Products', value: products.length, color: '#111', href: '/products' },
              { label: 'Listings', value: listings.length, color: '#1d4ed8', href: '/listings' },
              { label: 'Orders', value: orders.length, color: '#7c3aed', href: '/orders' },
              { label: 'Revenue', value: `$${orders.reduce((s, o) => s + parseFloat(o.amount_paid || 0), 0).toFixed(0)}`, color: '#00a47c', href: '/analytics' },
            ].map((s, i) => (
              <div key={i} onClick={() => router.push(s.href)} style={{ background: '#fff', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Getting started checklist */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>Getting started</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{completedSteps} of {steps.length} steps completed</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#00a47c' }}>{Math.round(progressPct)}%</div>
              </div>
              {/* Progress bar */}
              <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: '#00a47c', borderRadius: '3px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
            {steps.map((step, i) => (
              <div key={i} onClick={step.action} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < steps.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer', background: step.done ? '#fafff9' : '#fff', transition: 'background 0.12s' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step.done ? '#00a47c' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                  {step.done
                    ? <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af' }}>{step.num}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: step.done ? '#6b7280' : '#111', textDecoration: step.done ? 'line-through' : 'none' }}>{step.title}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '1px' }}>{step.desc} · ~{step.time}</div>
                </div>
                {!step.done && (
                  <div style={{ fontSize: '12px', color: '#00a47c', fontWeight: '600', flexShrink: 0 }}>
                    Start →
                  </div>
                )}
                {step.done && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', background: '#dcfce7', color: '#00a47c', borderRadius: '20px', fontWeight: '600', flexShrink: 0 }}>Done</span>
                )}
              </div>
            ))}
          </div>

          {/* Import section */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontWeight: '600', fontSize: '15px', color: '#111', marginBottom: '4px' }}>Import a product</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
              Paste any product URL from Nike, ASOS, Amazon, Zara and thousands of other websites
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                id="import-input"
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !importing && handleImport()}
                placeholder="https://www.nike.com/product/..."
                style={{ flex: 1, minWidth: '200px', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                onClick={handleImport}
                disabled={importing || !url.trim()}
                style={{ padding: '10px 24px', background: importing || !url.trim() ? '#9ca3af' : '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: importing || !url.trim() ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }}
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>

            {message === 'loading' && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ height: '3px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '40%', background: '#111', borderRadius: '2px', animation: 'slide 1.4s ease-in-out infinite' }} />
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>Scraping product details, images and price...</div>
                <style>{`@keyframes slide { 0% { margin-left: -40% } 100% { margin-left: 100% } }`}</style>
              </div>
            )}
            {message === 'success' && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '13px', color: '#00a47c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Product imported successfully!</span>
                <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#00a47c', cursor: 'pointer', fontWeight: '600', fontSize: '13px', textDecoration: 'underline' }}>View Products</button>
              </div>
            )}
            {message.startsWith('error:') && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#dc2626' }}>
                {message.replace('error:', '')}
              </div>
            )}
          </div>

          {/* My Products */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>My Products</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{products.length} imported</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => fetchAll()} style={{ padding: '6px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: '500' }}>Refresh</button>
                <button onClick={() => router.push('/products')} style={{ padding: '6px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>View all</button>
              </div>
            </div>

            {products.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '10px', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📦</div>
                <div style={{ fontWeight: '600', fontSize: '15px', color: '#111', marginBottom: '6px' }}>No products yet</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Import your first product using the bar above</div>
              </div>
            ) : (
              <div>
                {products.slice(0, 5).map((p, i) => {
                  const imgs = getImages(p.images);
                  const isListed = listings.some(l => l.imported_product_id === p.id);
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < Math.min(products.length, 5) - 1 ? '1px solid #f9fafb' : 'none' }}>
                      {/* Image */}
                      <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                        {imgs[0]
                          ? <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{p.source_domain}</span>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>·</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#111' }}>{getCurrencySymbol(p.currency)}{p.source_price}</span>
                          <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '20px', background: isListed ? '#dcfce7' : '#f3f4f6', color: isListed ? '#00a47c' : '#6b7280', fontWeight: '500' }}>
                            {isListed ? 'Listed' : 'Not listed'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => router.push('/products')}
                          style={{ padding: '6px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap' }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => openModal(p, 'edit')}
                          style={{ padding: '6px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openModal(p, 'price')}
                          style={{ padding: '6px 10px', background: '#111', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}
                        >
                          {isListed ? 'Update price' : 'Set price'}
                        </button>
                        <button
                          onClick={() => openModal(p, 'image')}
                          style={{ padding: '6px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap' }}
                        >
                          Images
                        </button>
                        <button
                          onClick={() => router.push('/online-store')}
                          style={{ padding: '6px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#00a47c', fontWeight: '500', whiteSpace: 'nowrap' }}
                        >
                          Push
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          style={{ padding: '6px 10px', background: '#fff', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#dc2626', fontWeight: '500', whiteSpace: 'nowrap' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}

                {products.length > 5 && (
                  <div style={{ padding: '12px 20px', textAlign: 'center', borderTop: '1px solid #f3f4f6' }}>
                    <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: '#00a47c', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                      View all {products.length} products →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {[
              { title: 'Browse brands', desc: 'Find products from top brands to import', href: '/browse', color: '#1d4ed8' },
              { title: 'My listings', desc: 'Manage priced products ready to sell', href: '/listings', color: '#7c3aed' },
              { title: 'Connect store', desc: 'Link Shopify, WooCommerce and more', href: '/online-store', color: '#00a47c' },
              { title: 'Analytics', desc: 'Track your revenue and profit', href: '/analytics', color: '#b45309' },
            ].map((item, i) => (
              <div key={i} onClick={() => router.push(item.href)} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
                <div style={{ width: '32px', height: '32px', background: item.color + '18', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '10px', height: '10px', background: item.color, borderRadius: '50%' }} />
                </div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#111', marginBottom: '3px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          {orders.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>Recent orders</div>
                <button onClick={() => router.push('/orders')} style={{ background: 'none', border: 'none', color: '#00a47c', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>View all</button>
              </div>
              {orders.slice(0, 3).map((o, i) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: i < 2 ? '1px solid #f9fafb' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#111' }}>#{o.storefront_order_id || o.id.slice(0, 8)}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{o.customer_name} · {new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>${o.amount_paid}</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: o.status === 'delivered' ? '#dcfce7' : o.status === 'shipped' ? '#dbeafe' : '#fef9c3', color: o.status === 'delivered' ? '#00a47c' : o.status === 'shipped' ? '#1d4ed8' : '#92400e' }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Modal header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>
                {modalType === 'price' && 'Set Selling Price'}
                {modalType === 'edit' && 'Edit Product'}
                {modalType === 'image' && 'Manage Images'}
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Product name */}
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{modalProduct.title}</div>

              {/* SET PRICE */}
              {modalType === 'price' && (
                <>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                    <div><div style={{ fontSize: '12px', color: '#6b7280' }}>Source price</div><div style={{ fontWeight: '700', fontSize: '20px' }}>{sym}{modalProduct.source_price}</div></div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#6b7280' }}>From</div><div style={{ fontSize: '13px', fontWeight: '500' }}>{modalProduct.source_domain}</div></div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Selling price ({modalProduct.currency})</label>
                    <input type="number" value={sellingPrice} onChange={e => handlePriceChange(e.target.value)} placeholder={`Min ${sym}${(parseFloat(modalProduct.source_price) + 1).toFixed(2)}`} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Or profit margin (%)</label>
                    <input type="number" value={profitMargin} onChange={e => handleMarginChange(e.target.value)} placeholder="e.g. 30" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  {sellingPrice && parseFloat(sellingPrice) > parseFloat(modalProduct.source_price) && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                      <div><div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>You pay</div><div style={{ fontWeight: '700', fontSize: '14px' }}>{sym}{modalProduct.source_price}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>Customer pays</div><div style={{ fontWeight: '700', fontSize: '14px' }}>{sym}{parseFloat(sellingPrice).toFixed(2)}</div></div>
                      <div><div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>Your profit</div><div style={{ fontWeight: '700', fontSize: '14px', color: '#00a47c' }}>{sym}{(sellingPrice - modalProduct.source_price).toFixed(2)}</div></div>
                    </div>
                  )}
                  {listMessage && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', background: listMessage.includes('error') ? '#fef2f2' : '#f0fdf4', color: listMessage.includes('error') ? '#dc2626' : '#00a47c' }}>{listMessage}</div>}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={closeModal} style={{ flex: 1, padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                    <button onClick={handleSetPrice} disabled={listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price)} style={{ flex: 2, padding: '10px', background: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price) ? '#9ca3af' : '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                      {listing ? 'Saving...' : 'Save Listing'}
                    </button>
                  </div>
                </>
              )}

              {/* EDIT */}
              {modalType === 'edit' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Title</label>
                    <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Description</label>
                    <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} rows={5} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                  </div>
                  {listMessage && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', background: '#f0fdf4', color: '#00a47c' }}>{listMessage}</div>}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={closeModal} style={{ flex: 1, padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                    <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 2, padding: '10px', background: saving ? '#9ca3af' : '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}

              {/* IMAGES */}
              {modalType === 'image' && (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {getImages(modalProduct.images).map((img, i) => (
                      <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <img src={img} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} onError={e => e.target.parentElement.style.display = 'none'} />
                      </div>
                    ))}
                    <div onClick={() => fileInputRef.current?.click()} style={{ width: '80px', height: '80px', border: '2px dashed #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', fontSize: '20px' }}>
                      +<span style={{ fontSize: '10px', marginTop: '3px' }}>Add</span>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                  </div>
                  <button onClick={closeModal} style={{ width: '100%', padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Close</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}