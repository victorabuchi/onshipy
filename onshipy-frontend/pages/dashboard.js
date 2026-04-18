import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [products, setProducts] = useState([]);
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [seller, setSeller] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [listing, setListing] = useState(false);
  const [listMessage, setListMessage] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) {
      router.push('/login');
      return;
    }
    tokenRef.current = t;
    if (s) {
      try { setSeller(JSON.parse(s)); } catch {}
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const t = localStorage.getItem('onshipy_token');
      if (!t) return;
      tokenRef.current = t;
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error('fetchProducts error:', err);
    }
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

    // Always re-read token from localStorage right before fetch
    const t = localStorage.getItem('onshipy_token');
    if (!t) {
      router.push('/login');
      return;
    }
    tokenRef.current = t;

    setImporting(true);
    setMessage('loading');

    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenRef.current}`
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await res.json();

      if (res.status === 401) {
        setMessage('error:Session expired. Please log in again.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      if (!res.ok) {
        setMessage('error:' + (data.error || 'Import failed'));
        return;
      }

      setUrl('');
      setMessage('success');
      await fetchProducts();
      setTimeout(() => setMessage(''), 5000);

    } catch (err) {
      console.error('Import error:', err);
      setMessage('error:' + err.message);
    } finally {
      setImporting(false);
    }
  };

  const openModal = (p) => {
    setModalProduct(p);
    setSellingPrice('');
    setProfitMargin('');
    setListMessage('');
  };

  const closeModal = () => {
    setModalProduct(null);
    setSellingPrice('');
    setProfitMargin('');
    setListMessage('');
  };

  const handlePriceChange = (val) => {
    setSellingPrice(val);
    if (val && modalProduct?.source_price) {
      const margin = (((val - modalProduct.source_price) / val) * 100).toFixed(1);
      setProfitMargin(margin > 0 ? margin : 0);
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
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;

    setListing(true);
    setListMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/products/${modalProduct.id}/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenRef.current}`
        },
        body: JSON.stringify({
          selling_price: parseFloat(sellingPrice),
          custom_title: modalProduct.title
        })
      });
      const data = await res.json();
      if (!res.ok) { setListMessage(data.error || 'Failed'); return; }
      setListMessage(`Listed at ${getCurrencySymbol(modalProduct.currency)}${parseFloat(sellingPrice).toFixed(2)} — Profit: ${getCurrencySymbol(modalProduct.currency)}${data.profit_per_sale} (${data.margin_percent}%)`);
      setTimeout(() => closeModal(), 3000);
    } catch { setListMessage('Connection error'); }
    finally { setListing(false); }
  };

  const stats = [
    { label: 'Total Products', value: products.length, color: '#00a47c' },
    { label: 'Completed', value: products.filter(p => p.scrape_status === 'completed').length, color: '#1c6ed4' },
    { label: 'Plan', value: seller?.plan || 'free', color: '#7c3aed' },
  ];

  const sym = modalProduct ? getCurrencySymbol(modalProduct.currency) : '$';

  return (
    <Layout>
      <div style={{ padding: '24px 28px', background: '#f1f2f4', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#111', margin: 0 }}>
            Welcome back, {seller?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '13px' }}>
            Here's what's happening with your store today
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '18px 20px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '26px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Import */}
        <div style={{ background: '#fff', borderRadius: '10px', padding: '20px 24px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#111', marginBottom: '4px' }}>Import a Product</div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Paste any product URL from any website</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !importing && handleImport()}
              placeholder="https://www.nike.com/product/..."
              style={{ flex: 1, minWidth: '200px', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleImport}
              disabled={importing || !url.trim()}
              style={{ padding: '10px 22px', background: importing || !url.trim() ? '#9ca3af' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: importing || !url.trim() ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>

          {message === 'loading' && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '40%', background: '#1a1a1a', borderRadius: '2px', animation: 'slide 1.4s ease-in-out infinite' }} />
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>Scraping product details...</div>
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

        {/* Products table */}
        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>My Products ({products.length})</div>
            <button onClick={fetchProducts} style={{ padding: '6px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
              Refresh
            </button>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
              No products yet. Import your first product above.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['', 'PRODUCT', 'SOURCE', 'PRICE', 'STATUS', 'ACTION'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => {
                    const imgs = getImages(p.images);
                    return (
                      <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <td style={{ padding: '12px 16px', width: '48px' }}>
                          {imgs[0]
                            ? <img src={imgs[0]} alt="" style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                            : <div style={{ width: '38px', height: '38px', background: '#f3f4f6', borderRadius: '6px' }} />
                          }
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '500', fontSize: '14px', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>{p.title}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{p.source_domain}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px', color: '#111' }}>{getCurrencySymbol(p.currency)}{p.source_price}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: p.scrape_status === 'completed' ? '#f0fdf4' : '#fefce8', color: p.scrape_status === 'completed' ? '#00a47c' : '#92400e' }}>
                            {p.scrape_status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => openModal(p)} style={{ padding: '7px 16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                            Set Price
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Set Price Modal */}
      {modalProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px', color: '#111' }}>Set Selling Price</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>{modalProduct.title}</div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6b7280', lineHeight: 1, padding: '0 0 0 12px' }}>×</button>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Source price</div>
                <div style={{ fontWeight: '700', fontSize: '20px', color: '#111' }}>{sym}{modalProduct.source_price}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>From</div>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#111' }}>{modalProduct.source_domain}</div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Your selling price ({modalProduct.currency})
              </label>
              <input
                type="number"
                value={sellingPrice}
                onChange={e => handlePriceChange(e.target.value)}
                placeholder={`Min ${sym}${(parseFloat(modalProduct.source_price) + 1).toFixed(2)}`}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Or set profit margin (%)
              </label>
              <input
                type="number"
                value={profitMargin}
                onChange={e => handleMarginChange(e.target.value)}
                placeholder="e.g. 30"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {sellingPrice && parseFloat(sellingPrice) > parseFloat(modalProduct.source_price) && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>You pay</div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{sym}{modalProduct.source_price}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>Customer pays</div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{sym}{parseFloat(sellingPrice).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px' }}>Your profit</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#00a47c' }}>{sym}{(sellingPrice - modalProduct.source_price).toFixed(2)}</div>
                </div>
              </div>
            )}

            {listMessage && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', background: listMessage.includes('error') || listMessage.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: listMessage.includes('error') || listMessage.includes('Failed') ? '#dc2626' : '#00a47c', border: `1px solid ${listMessage.includes('error') || listMessage.includes('Failed') ? '#fecaca' : '#bbf7d0'}` }}>
                {listMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Cancel
              </button>
              <button
                onClick={handleSetPrice}
                disabled={listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price)}
                style={{ flex: 2, padding: '10px', background: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price) ? '#9ca3af' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price) ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' }}
              >
                {listing ? 'Saving...' : 'Save Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}