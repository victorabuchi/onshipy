import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Listings() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/listings/all`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch (err) { console.error(err); }
    setLoading(false);
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

  const handleUnlist = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      if (res.ok) { setListings(prev => prev.filter(l => l.id !== id)); if (selected?.id === id) setSelected(null); }
      else { const d = await res.json(); alert(d.error || 'Failed to remove'); }
    } catch (err) { alert('Error: ' + err.message); }
  };

  const totalRevenue = listings.reduce((s, l) => s + parseFloat(l.selling_price || 0), 0);
  const totalProfit = listings.reduce((s, l) => s + (parseFloat(l.selling_price || 0) - parseFloat(l.source_price_at_listing || 0)), 0);

  const th = { padding: '9px 16px', fontSize: '11px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e1e3e5', background: '#f9fafb' };
  const td = { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' };

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: '#f6f6f7' }}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>Listings</h1>
                <p style={{ color: '#6d7175', fontSize: '13px', margin: '3px 0 0 0' }}>{listings.length} active {listings.length === 1 ? 'listing' : 'listings'}</p>
              </div>
              <button onClick={() => router.push('/products')} style={{ padding: '9px 18px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Add listing</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Active listings', value: listings.length, color: '#008060' },
                { label: 'Revenue potential', value: `$${totalRevenue.toFixed(2)}`, color: '#1c6ed4' },
                { label: 'Profit potential', value: `$${totalProfit.toFixed(2)}`, color: '#6d28d9' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '18px 22px', border: '1px solid #e1e3e5' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6d7175', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>Loading...</div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>No listings yet</div>
                <div style={{ color: '#6d7175', fontSize: '14px', marginBottom: '20px' }}>Import a product and set a price to create your first listing</div>
                <button onClick={() => router.push('/products')} style={{ padding: '9px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Go to Products</button>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}></th><th style={th}>Product</th><th style={th}>Source price</th><th style={th}>Selling price</th><th style={th}>Profit</th><th style={th}>Status</th><th style={th}></th></tr></thead>
                  <tbody>
                    {listings.map(l => {
                      const imgs = getImages(l.images);
                      const sym = getCurrencySymbol(l.currency);
                      const profit = (parseFloat(l.selling_price) - parseFloat(l.source_price_at_listing)).toFixed(2);
                      const margin = ((profit / l.selling_price) * 100).toFixed(1);
                      const isSel = selected?.id === l.id;
                      return (
                        <tr key={l.id} onClick={() => setSelected(isSel ? null : l)} style={{ cursor: 'pointer', background: isSel ? '#f0fdf6' : '#fff' }}>
                          <td style={{ ...td, width: '52px' }}>{imgs[0] ? <img src={imgs[0]} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e1e3e5', display: 'block' }} onError={e => e.target.style.display = 'none'} /> : <div style={{ width: '36px', height: '36px', background: '#f1f1f1', borderRadius: '6px' }} />}</td>
                          <td style={td}><div style={{ fontWeight: '500', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>{l.custom_title || l.original_title}</div><div style={{ fontSize: '12px', color: '#6d7175', marginTop: '2px' }}>{l.source_domain}</div></td>
                          <td style={{ ...td, color: '#6d7175' }}>{sym}{parseFloat(l.source_price_at_listing).toFixed(2)}</td>
                          <td style={{ ...td, fontWeight: '600' }}>{sym}{parseFloat(l.selling_price).toFixed(2)}</td>
                          <td style={td}><div style={{ fontWeight: '600', color: '#008060' }}>+{sym}{profit}</div><div style={{ fontSize: '11px', color: '#6d7175' }}>{margin}% margin</div></td>
                          <td style={td}><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: l.status === 'active' ? '#e3f9ef' : '#f1f1f1', color: l.status === 'active' ? '#008060' : '#6d7175' }}>{l.status}</span></td>
                          <td style={td}><button onClick={e => { e.stopPropagation(); handleUnlist(l.id); }} style={{ padding: '5px 10px', background: '#fff', border: '1px solid #e1e3e5', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#cc0000' }}>Remove</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div style={{ width: '360px', flexShrink: 0, background: '#fff', borderLeft: '1px solid #e1e3e5', overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e1e3e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Listing details</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6d7175' }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              {getImages(selected.images)[0] && <img src={getImages(selected.images)[0]} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e1e3e5' }} onError={e => e.target.style.display = 'none'} />}
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '14px' }}>{selected.custom_title || selected.original_title}</div>
              <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                {[
                  { label: 'Source price', value: `${getCurrencySymbol(selected.currency)}${parseFloat(selected.source_price_at_listing).toFixed(2)}`, color: '#cc0000' },
                  { label: 'Selling price', value: `${getCurrencySymbol(selected.currency)}${parseFloat(selected.selling_price).toFixed(2)}`, color: '#1a1a1a' },
                  { label: 'Profit per sale', value: `+${getCurrencySymbol(selected.currency)}${(parseFloat(selected.selling_price) - parseFloat(selected.source_price_at_listing)).toFixed(2)}`, color: '#008060' },
                  { label: 'Margin', value: `${(((parseFloat(selected.selling_price) - parseFloat(selected.source_price_at_listing)) / parseFloat(selected.selling_price)) * 100).toFixed(1)}%`, color: '#008060' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: i === 0 ? 'none' : '1px solid #e1e3e5' }}>
                    <span style={{ fontSize: '13px', color: '#6d7175' }}>{r.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: r.color }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => router.push('/products')} style={{ flex: 1, padding: '9px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Edit product</button>
                <button onClick={() => handleUnlist(selected.id)} style={{ flex: 1, padding: '9px', background: '#fff', border: '1px solid #ffc0c0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#cc0000' }}>Remove listing</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}