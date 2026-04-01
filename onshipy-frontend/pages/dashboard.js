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
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) setSeller(JSON.parse(s));
    fetchProducts(t);
  }, []);

  const fetchProducts = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { Authorization: `Bearer ${t || tokenRef.current}` }
      });
      const data = await res.json();
      if (data.products) setProducts(data.products);
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
    if (!url) return;
    setImporting(true);
    setMessage('loading');
    try {
      const res = await fetch(`${API_BASE}/api/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) { setMessage('error:' + (data.error || 'Could not import')); setImporting(false); return; }
      setUrl('');
      setMessage('success');
      fetchProducts();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) { setMessage('error:' + err.message); }
    finally { setImporting(false); }
  };

  const openModal = (p) => { setModalProduct(p); setSellingPrice(''); setProfitMargin(''); setListMessage(''); };
  const closeModal = () => { setModalProduct(null); setSellingPrice(''); setProfitMargin(''); setListMessage(''); };

  const handlePriceChange = (val) => {
    setSellingPrice(val);
    if (val && modalProduct?.source_price) {
      const margin = (((val - modalProduct.source_price) / val) * 100).toFixed(1);
      setProfitMargin(margin > 0 ? margin : 0);
    }
  };

  const handleMarginChange = (val) => {
    setProfitMargin(val);
    if (val && modalProduct?.source_price) setSellingPrice((modalProduct.source_price / (1 - val / 100)).toFixed(2));
  };

  const handleSetPrice = async () => {
    if (!sellingPrice || !modalProduct) return;
    setListing(true);
    setListMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/products/${modalProduct.id}/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ selling_price: parseFloat(sellingPrice), custom_title: modalProduct.title })
      });
      const data = await res.json();
      if (!res.ok) { setListMessage(data.error || 'Failed'); return; }
      setListMessage(`Listed at ${getCurrencySymbol(modalProduct.currency)}${parseFloat(sellingPrice).toFixed(2)} — Profit: ${getCurrencySymbol(modalProduct.currency)}${data.profit_per_sale} (${data.margin_percent}%)`);
      setTimeout(() => closeModal(), 2500);
    } catch { setListMessage('Connection error'); }
    finally { setListing(false); }
  };

  const stats = [
    { label: 'Total Products', value: products.length, color: '#008060' },
    { label: 'Completed', value: products.filter(p => p.scrape_status === 'completed').length, color: '#1c6ed4' },
    { label: 'Plan', value: seller?.plan || 'free', color: '#6d28d9' },
  ];

  return (
    <Layout>
      <div style={{ padding: '28px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>Welcome back, {seller?.full_name?.split(' ')[0]}</h1>
          <p style={{ color: '#6d7175', marginTop: '4px', fontSize: '13px' }}>Here's what's happening with your store today</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '18px 22px', border: '1px solid #e1e3e5' }}>
              <div style={{ fontSize: '26px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: '10px', padding: '20px 24px', border: '1px solid #e1e3e5', marginBottom: '20px' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Import a Product</div>
          <div style={{ fontSize: '13px', color: '#6d7175', marginBottom: '12px' }}>Paste any product URL from any website</div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleImport()} placeholder="https://www.example.com/product/..." style={{ flex: 1, padding: '9px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            <button onClick={handleImport} disabled={importing} style={{ padding: '9px 22px', background: importing ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: importing ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
          {message === 'loading' && (
            <div style={{ marginTop: '12px', height: '3px', background: '#e1e3e5', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '40%', background: '#1a1a1a', borderRadius: '2px', animation: 'slide 1.4s ease-in-out infinite' }} />
              <style>{`@keyframes slide{0%{margin-left:-40%}100%{margin-left:100%}}`}</style>
            </div>
          )}
          {message === 'success' && <div style={{ marginTop: '10px', padding: '9px 14px', background: '#f0fdf6', border: '1px solid #b7e9d4', borderRadius: '8px', fontSize: '13px', color: '#008060' }}>Product imported successfully!</div>}
          {message.startsWith('error:') && <div style={{ marginTop: '10px', padding: '9px 14px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', fontSize: '13px', color: '#cc0000' }}>{message.replace('error:', '')}</div>}
        </div>

        <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e1e3e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>My Products ({products.length})</div>
            <button onClick={() => fetchProducts()} style={{ padding: '5px 12px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Refresh</button>
          </div>
          {products.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6d7175', fontSize: '14px' }}>No products yet. Import your first product above.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['', 'Product', 'Source', 'Price', 'Status', 'Action'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 16px', fontSize: '11px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e1e3e5' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const imgs = getImages(p.images);
                  return (
                    <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f1f1f1' : 'none' }}>
                      <td style={{ padding: '12px 16px', width: '48px' }}>
                        {imgs[0] ? <img src={imgs[0]} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e1e3e5', display: 'block' }} onError={e => e.target.style.display = 'none'} /> : <div style={{ width: '36px', height: '36px', background: '#f1f1f1', borderRadius: '6px' }} />}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{p.title}</div>
                        <div style={{ fontSize: '12px', color: '#6d7175', marginTop: '2px' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6d7175' }}>{p.source_domain}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>{getCurrencySymbol(p.currency)}{p.source_price}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: p.scrape_status === 'completed' ? '#e3f9ef' : '#fff3cd', color: p.scrape_status === 'completed' ? '#008060' : '#856404' }}>{p.scrape_status}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => openModal(p)} style={{ padding: '6px 14px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Set Price</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '460px', margin: '0 16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px' }}>Set Selling Price</div>
                <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '3px', maxWidth: '340px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{modalProduct.title}</div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#6d7175', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: '12px', color: '#6d7175' }}>Source price</div><div style={{ fontWeight: '700', fontSize: '18px' }}>{getCurrencySymbol(modalProduct.currency)}{modalProduct.source_price}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#6d7175' }}>From</div><div style={{ fontSize: '13px', fontWeight: '500' }}>{modalProduct.source_domain}</div></div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Selling price ({modalProduct.currency})</label>
              <input type="number" value={sellingPrice} onChange={e => handlePriceChange(e.target.value)} placeholder={`Min ${getCurrencySymbol(modalProduct.currency)}${(parseFloat(modalProduct.source_price) + 1).toFixed(2)}`} style={{ width: '100%', padding: '10px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '16px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Or margin (%)</label>
              <input type="number" value={profitMargin} onChange={e => handleMarginChange(e.target.value)} placeholder="e.g. 30" style={{ width: '100%', padding: '10px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {sellingPrice && parseFloat(sellingPrice) > parseFloat(modalProduct.source_price) && (
              <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '12px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: '8px' }}>
                <div><div style={{ fontSize: '11px', color: '#6d7175', marginBottom: '3px' }}>You pay</div><div style={{ fontWeight: '700', fontSize: '14px' }}>{getCurrencySymbol(modalProduct.currency)}{modalProduct.source_price}</div></div>
                <div><div style={{ fontSize: '11px', color: '#6d7175', marginBottom: '3px' }}>Customer pays</div><div style={{ fontWeight: '700', fontSize: '14px' }}>{getCurrencySymbol(modalProduct.currency)}{parseFloat(sellingPrice).toFixed(2)}</div></div>
                <div><div style={{ fontSize: '11px', color: '#6d7175', marginBottom: '3px' }}>Your profit</div><div style={{ fontWeight: '700', fontSize: '14px', color: '#008060' }}>{getCurrencySymbol(modalProduct.currency)}{(sellingPrice - modalProduct.source_price).toFixed(2)}</div></div>
              </div>
            )}
            {listMessage && <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', background: listMessage.includes('error') || listMessage.includes('Failed') ? '#fff0f0' : '#f0fdf6', color: listMessage.includes('error') || listMessage.includes('Failed') ? '#cc0000' : '#008060', border: listMessage.includes('error') || listMessage.includes('Failed') ? '1px solid #ffcccc' : '1px solid #b7e9d4' }}>{listMessage}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '10px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleSetPrice} disabled={listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price)} style={{ flex: 2, padding: '10px', background: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(modalProduct.source_price) ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                {listing ? 'Saving...' : 'Save Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}