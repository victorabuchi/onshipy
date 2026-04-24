import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Products() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sellingPrice, setSellingPrice] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [listing, setListing] = useState(false);
  const [listMessage, setListMessage] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`, { headers: { Authorization: `Bearer ${tokenRef.current}` } });
      const data = await res.json();
      if (data.products) setProducts(data.products);
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

  const getVariants = (variants) => {
    try {
      if (!variants) return [];
      if (typeof variants === 'string') return JSON.parse(variants);
      if (Array.isArray(variants)) return variants;
      return [];
    } catch { return []; }
  };

  const getCurrencySymbol = (currency) => {
    const s = { GBP: '£', USD: '$', EUR: '€', JPY: '¥', CAD: 'CA$', AUD: 'A$' };
    return s[currency] || '$';
  };

  const openProduct = (product) => {
    setSelectedProduct(product);
    setActiveImage(0);
    setEditData({ title: product.title, description: product.description || '', images: getImages(product.images) });
    setSellingPrice(''); setProfitMargin(''); setListMessage(''); setSaveMessage('');
    setSelectedVariants({});
    setEditing(false); setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); setSelectedProduct(null); setEditing(false); setActiveImage(0); setSelectedVariants({}); };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/${selectedProduct.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tokenRef.current}` } });
      if (res.ok) { setProducts(prev => prev.filter(p => p.id !== selectedProduct.id)); closePanel(); }
      else { const d = await res.json(); alert(d.error || 'Delete failed'); }
    } catch (err) { alert('Error: ' + err.message); }
    setDeleting(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;
    setSaving(true); setSaveMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/products/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ title: editData.title, description: editData.description, images: JSON.stringify(editData.images) })
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...selectedProduct, title: editData.title, description: editData.description, images: JSON.stringify(editData.images) };
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updated : p));
        setSelectedProduct(updated); setEditing(false);
        setSaveMessage('Saved successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      } else { setSaveMessage('Error: ' + (data.error || 'Save failed')); }
    } catch (err) { setSaveMessage('Error: ' + err.message); }
    setSaving(false);
  };

  const handlePriceChange = (val) => {
    setSellingPrice(val);
    if (val && selectedProduct?.source_price) setProfitMargin((((val - selectedProduct.source_price) / val) * 100).toFixed(1));
  };

  const handleMarginChange = (val) => {
    setProfitMargin(val);
    if (val && selectedProduct?.source_price) setSellingPrice((selectedProduct.source_price / (1 - val / 100)).toFixed(2));
  };

  const handleSetPrice = async () => {
    if (!sellingPrice || !selectedProduct) return;
    setListing(true); setListMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/products/${selectedProduct.id}/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ selling_price: parseFloat(sellingPrice), custom_title: editData.title || selectedProduct.title })
      });
      const data = await res.json();
      if (!res.ok) { setListMessage(data.error || 'Failed'); return; }
      setListMessage(`Listed at ${getCurrencySymbol(selectedProduct.currency)}${parseFloat(sellingPrice).toFixed(2)} — Profit: ${getCurrencySymbol(selectedProduct.currency)}${data.profit_per_sale} (${data.margin_percent}%)`);
    } catch { setListMessage('Connection error'); }
    finally { setListing(false); }
  };

  const handleImageUpload = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => { setEditData(prev => ({ ...prev, images: [...(prev.images || []), ev.target.result] })); if (!editing) setEditing(true); };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx) => {
    const imgs = editData.images.filter((_, i) => i !== idx);
    setEditData(prev => ({ ...prev, images: imgs }));
    if (activeImage >= imgs.length) setActiveImage(Math.max(0, imgs.length - 1));
    if (!editing) setEditing(true);
  };

  const sym = selectedProduct ? getCurrencySymbol(selectedProduct.currency) : '$';
  const images = editing ? (editData.images || []) : (selectedProduct ? getImages(selectedProduct.images) : []);
  const variants = selectedProduct ? getVariants(selectedProduct.variants) : [];

  const th = { padding: '9px 16px', fontSize: '11px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e1e3e5', background: '#f9fafb' };
  const td = { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' };

  // Group variants by option name e.g. { Color: ['Red','Blue'], Size: ['S','M','L'] }
  const groupedVariants = variants.reduce((acc, v) => {
    if (v.option && v.value) {
      if (!acc[v.option]) acc[v.option] = [];
      if (!acc[v.option].includes(v.value)) acc[v.option].push(v.value);
    }
    return acc;
  }, {});

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: '#f6f6f7' }}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>Products</h1>
                <p style={{ color: '#6d7175', fontSize: '13px', margin: '3px 0 0 0' }}>{products.length} imported</p>
              </div>
              <button onClick={() => router.push('/dashboard')} style={{ padding: '9px 18px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Import product</button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6d7175', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #00a47c', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>No products yet</div>
                <div style={{ color: '#6d7175', fontSize: '14px', marginBottom: '20px' }}>Import your first product to get started</div>
                <button onClick={() => router.push('/dashboard')} style={{ padding: '9px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Import a product</button>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={th}></th>
                      <th style={th}>Product</th>
                      <th style={th}>Source</th>
                      <th style={th}>Price</th>
                      <th style={th}>Variants</th>
                      <th style={th}>Status</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const imgs = getImages(p.images);
                      const pvars = getVariants(p.variants);
                      const isSel = selectedProduct?.id === p.id;
                      return (
                        <tr key={p.id} onClick={() => openProduct(p)} style={{ cursor: 'pointer', background: isSel ? '#f0fdf6' : '#fff' }}>
                          <td style={{ ...td, width: '52px' }}>
                            {imgs[0]
                              ? <img src={imgs[0]} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e1e3e5', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                              : <div style={{ width: '36px', height: '36px', background: '#f1f1f1', borderRadius: '6px' }} />}
                          </td>
                          <td style={td}>
                            <div style={{ fontWeight: '500', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>{p.title}</div>
                            <div style={{ fontSize: '12px', color: '#6d7175', marginTop: '2px' }}>{new Date(p.created_at).toLocaleDateString()}</div>
                          </td>
                          <td style={{ ...td, color: '#6d7175', fontSize: '13px' }}>{p.source_domain}</td>
                          <td style={{ ...td, fontWeight: '600' }}>{getCurrencySymbol(p.currency)}{p.source_price}</td>
                          <td style={td}>
                            {pvars.length > 0
                              ? <span style={{ fontSize: '12px', padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '20px', fontWeight: '500' }}>{pvars.length} variants</span>
                              : <span style={{ fontSize: '12px', color: '#9ca3af' }}>—</span>}
                          </td>
                          <td style={td}>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: p.scrape_status === 'completed' ? '#e3f9ef' : '#fff3cd', color: p.scrape_status === 'completed' ? '#008060' : '#856404' }}>{p.scrape_status}</span>
                          </td>
                          <td style={{ ...td, color: '#6d7175', fontSize: '13px' }}>View</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {panelOpen && selectedProduct && (
          <div style={{ width: '500px', flexShrink: 0, background: '#fff', borderLeft: '1px solid #e1e3e5', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e1e3e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Product details</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleDelete} disabled={deleting} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ffc0c0', color: '#cc0000', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>{deleting ? 'Deleting...' : 'Delete'}</button>
                <button onClick={closePanel} style={{ padding: '6px 12px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', color: '#6d7175' }}>×</button>
              </div>
            </div>
            <div style={{ padding: '20px', flex: 1 }}>
              {saveMessage && (
                <div style={{ padding: '9px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', background: saveMessage.includes('Error') ? '#fff0f0' : '#f0fdf6', color: saveMessage.includes('Error') ? '#cc0000' : '#008060', border: saveMessage.includes('Error') ? '1px solid #ffcccc' : '1px solid #b7e9d4' }}>{saveMessage}</div>
              )}

              {/* Images */}
              <div style={{ marginBottom: '20px' }}>
                {images.length > 0 ? (
                  <>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <img src={images[activeImage]} alt="" onClick={() => { setLightboxIndex(activeImage); setLightboxOpen(true); }} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e1e3e5', display: 'block', cursor: 'zoom-in' }} onError={e => e.target.style.display = 'none'} />
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>{activeImage + 1}/{images.length}</div>
                      {activeImage > 0 && <button onClick={() => setActiveImage(activeImage - 1)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>}
                      {activeImage < images.length - 1 && <button onClick={() => setActiveImage(activeImage + 1)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                          <img src={img} alt="" onClick={() => setActiveImage(i)} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImage === i ? '2px solid #1a1a1a' : '1px solid #e1e3e5', opacity: activeImage === i ? 1 : 0.6, display: 'block' }} onError={e => e.target.parentElement.style.display = 'none'} />
                          <button onClick={() => handleRemoveImage(i)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#cc0000', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      ))}
                      <div onClick={() => fileInputRef.current?.click()} style={{ width: '52px', height: '52px', border: '1px dashed #c9cccf', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6d7175', fontSize: '18px', flexShrink: 0 }}>+</div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                  </>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} style={{ height: '160px', border: '1px dashed #c9cccf', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6d7175' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>+</div>
                    <div style={{ fontSize: '13px' }}>Upload images</div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                  </div>
                )}
              </div>

              <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <div><span style={{ color: '#6d7175' }}>Source: </span><a href={selectedProduct.source_url} target="_blank" rel="noreferrer" style={{ color: '#008060', textDecoration: 'none', fontWeight: '500' }}>{selectedProduct.source_domain} ↗</a></div>
                <div style={{ fontWeight: '600' }}>{sym}{selectedProduct.source_price}</div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</label>
                  {!editing && <button onClick={() => setEditing(true)} style={{ fontSize: '12px', color: '#008060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', padding: 0 }}>Edit</button>}
                </div>
                {editing
                  ? <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #1a1a1a', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                  : <p style={{ margin: 0, fontSize: '14px', color: '#1a1a1a', fontWeight: '500', lineHeight: '1.5' }}>{selectedProduct.title}</p>}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Description</label>
                {editing
                  ? <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} rows={5} style={{ width: '100%', padding: '9px 12px', border: '1px solid #1a1a1a', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }} />
                  : <p style={{ margin: 0, fontSize: '14px', color: '#6d7175', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{selectedProduct.description || 'No description. Click Edit to add one.'}</p>}
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <button onClick={() => { setEditing(false); setEditData({ title: selectedProduct.title, description: selectedProduct.description || '', images: getImages(selectedProduct.images) }); }} style={{ flex: 1, padding: '9px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                  <button onClick={handleSaveEdit} disabled={saving} style={{ flex: 2, padding: '9px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>{saving ? 'Saving...' : 'Save changes'}</button>
                </div>
              )}

              {/* Variants */}
              {Object.keys(groupedVariants).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ borderTop: '1px solid #e1e3e5', paddingTop: '16px', marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variants</label>
                  </div>
                  {Object.entries(groupedVariants).map(([optionName, values]) => (
                    <div key={optionName} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a1a', marginBottom: '6px' }}>{optionName}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {values.map(val => {
                          const isSelected = selectedVariants[optionName] === val;
                          const isColor = optionName.toLowerCase().includes('color') || optionName.toLowerCase().includes('colour');
                          return (
                            <button
                              key={val}
                              onClick={() => setSelectedVariants(prev => ({ ...prev, [optionName]: isSelected ? null : val }))}
                              style={{
                                padding: isColor ? '0' : '5px 12px',
                                width: isColor ? '28px' : 'auto',
                                height: isColor ? '28px' : 'auto',
                                borderRadius: isColor ? '50%' : '6px',
                                border: isSelected ? '2px solid #1a1a1a' : '1px solid #e1e3e5',
                                background: isColor ? val.toLowerCase() : isSelected ? '#1a1a1a' : '#fff',
                                color: isSelected && !isColor ? '#fff' : '#1a1a1a',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                flexShrink: 0,
                                boxShadow: isSelected ? '0 0 0 2px #fff, 0 0 0 4px #1a1a1a' : 'none',
                              }}
                              title={val}
                            >
                              {isColor ? '' : val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid #e1e3e5', margin: '20px 0' }} />
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '14px' }}>Pricing</div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Selling price ({selectedProduct.currency})</label>
                <input type="number" value={sellingPrice} onChange={e => handlePriceChange(e.target.value)} placeholder={`Min ${sym}${(parseFloat(selectedProduct.source_price) + 1).toFixed(2)}`} style={{ width: '100%', padding: '9px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '15px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Margin (%)</label>
                <input type="number" value={profitMargin} onChange={e => handleMarginChange(e.target.value)} placeholder="e.g. 30" style={{ width: '100%', padding: '9px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {sellingPrice && parseFloat(sellingPrice) > parseFloat(selectedProduct.source_price) && (
                <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '12px', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                  <div><div style={{ fontSize: '11px', color: '#6d7175', marginBottom: '3px' }}>You pay</div><div style={{ fontWeight: '700', fontSize: '14px' }}>{sym}{selectedProduct.source_price}</div></div>
                  <div><div style={{ fontSize: '11px', color: '#6d7175', marginBottom: '3px' }}>Customer pays</div><div style={{ fontWeight: '700', fontSize: '14px' }}>{sym}{parseFloat(sellingPrice).toFixed(2)}</div></div>
                  <div><div style={{ fontSize: '11px', color: '#6d7175', marginBottom: '3px' }}>Profit</div><div style={{ fontWeight: '700', fontSize: '14px', color: '#008060' }}>{sym}{(sellingPrice - selectedProduct.source_price).toFixed(2)}</div></div>
                </div>
              )}
              {listMessage && <div style={{ padding: '9px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', background: listMessage.includes('error') || listMessage.includes('Failed') ? '#fff0f0' : '#f0fdf6', color: listMessage.includes('error') || listMessage.includes('Failed') ? '#cc0000' : '#008060', border: listMessage.includes('error') || listMessage.includes('Failed') ? '1px solid #ffcccc' : '1px solid #b7e9d4' }}>{listMessage}</div>}
              <button onClick={handleSetPrice} disabled={listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(selectedProduct.source_price)} style={{ width: '100%', padding: '11px', background: listing || !sellingPrice || parseFloat(sellingPrice) <= parseFloat(selectedProduct.source_price) ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>{listing ? 'Saving...' : 'Save listing'}</button>
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && images.length > 0 && (
        <div onClick={() => setLightboxOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: '20px', right: '24px', background: 'none', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer' }}>×</button>
          {lightboxIndex > 0 && <button onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }} style={{ position: 'absolute', left: '24px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>}
          <img src={images[lightboxIndex]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '6px' }} />
          {lightboxIndex < images.length - 1 && <button onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }} style={{ position: 'absolute', right: '24px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>}
          <div style={{ position: 'absolute', bottom: '60px', display: 'flex', gap: '6px' }}>
            {images.map((img, i) => <img key={i} src={img} alt="" onClick={e => { e.stopPropagation(); setLightboxIndex(i); }} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: lightboxIndex === i ? '2px solid #fff' : '2px solid transparent', opacity: lightboxIndex === i ? 1 : 0.45, flexShrink: 0 }} />)}
          </div>
        </div>
      )}
    </Layout>
  );
}