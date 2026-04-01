import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function OnlineStore() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [seller, setSeller] = useState(null);
  const [activeTab, setActiveTab] = useState('connect');
  const [connecting, setConnecting] = useState(null);
  const [connectedStores, setConnectedStores] = useState([]);
  const [listings, setListings] = useState([]);
  const [pushing, setPushing] = useState({});
  const [pushResults, setPushResults] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', error: false });

  const [shopifyForm, setShopifyForm] = useState({ shop_url: '', access_token: '' });
  const [wooForm, setWooForm] = useState({ site_url: '', consumer_key: '', consumer_secret: '' });
  const [manualForm, setManualForm] = useState({ store_name: '', store_url: '' });

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) setSeller(JSON.parse(s));
    const stored = localStorage.getItem('onshipy_stores');
    if (stored) setConnectedStores(JSON.parse(stored));
    fetchListings(t);
  }, []);

  const showToast = (msg, error = false) => {
    setToast({ show: true, msg, error });
    setTimeout(() => setToast({ show: false, msg: '', error: false }), 4000);
  };

  const fetchListings = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/listings/all`, {
        headers: { Authorization: `Bearer ${t || tokenRef.current}` }
      });
      const data = await res.json();
      if (data.listings) setListings(data.listings);
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

  const connectShopify = async () => {
    if (!shopifyForm.shop_url || !shopifyForm.access_token) { showToast('Please fill in all fields', true); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify(shopifyForm)
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Connection failed', true); return; }
      const store = { type: 'shopify', name: shopifyForm.shop_url, ...data };
      const updated = [...connectedStores, store];
      setConnectedStores(updated);
      localStorage.setItem('onshipy_stores', JSON.stringify(updated));
      setConnecting(null);
      setActiveTab('connected');
      showToast('Shopify store connected successfully!');
    } catch (err) { showToast('Connection error: ' + err.message, true); }
    setSaving(false);
  };

  const connectManual = () => {
    if (!manualForm.store_name) { showToast('Please enter a store name', true); return; }
    const store = { type: 'manual', name: manualForm.store_name, url: manualForm.store_url, webhook_secret: seller?.webhook_secret, connected_at: new Date().toISOString() };
    const updated = [...connectedStores, store];
    setConnectedStores(updated);
    localStorage.setItem('onshipy_stores', JSON.stringify(updated));
    setConnecting(null);
    setActiveTab('connected');
    showToast('Store connected successfully!');
  };

  const disconnectStore = (index) => {
    if (!confirm('Disconnect this store?')) return;
    const updated = connectedStores.filter((_, i) => i !== index);
    setConnectedStores(updated);
    localStorage.setItem('onshipy_stores', JSON.stringify(updated));
    showToast('Store disconnected');
  };

  const pushToShopify = async (listing, store) => {
    const key = listing.id;
    setPushing(prev => ({ ...prev, [key]: true }));
    setPushResults(prev => ({ ...prev, [key]: null }));
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({
          listing_id: listing.id,
          shop_url: store.name,
          access_token: store.access_token
        })
      });
      const data = await res.json();
      if (!res.ok) { setPushResults(prev => ({ ...prev, [key]: { error: data.error || 'Push failed' } })); return; }
      setPushResults(prev => ({ ...prev, [key]: { success: true, url: data.product_url } }));
      showToast('Product pushed to Shopify!');
    } catch (err) {
      setPushResults(prev => ({ ...prev, [key]: { error: err.message } }));
    }
    setPushing(prev => ({ ...prev, [key]: false }));
  };

  const platforms = [
    { id: 'shopify', name: 'Shopify', desc: 'Connect your Shopify store and push products automatically', color: '#95BF47' },
    { id: 'woocommerce', name: 'WooCommerce', desc: 'Connect your WordPress WooCommerce store', color: '#7F54B3' },
    { id: 'etsy', name: 'Etsy', desc: 'Sell on the Etsy marketplace', color: '#F45800' },
    { id: 'manual', name: 'Manual / Webhook', desc: 'Connect any store using our webhook system', color: '#1a1a2e' },
  ];

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1a1a1a' };
  const lbl = { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px', color: '#1a1a1a' };

  return (
    <Layout>
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {toast.show && (
          <div style={{ position: 'fixed', top: '20px', right: '20px', background: toast.error ? '#cc0000' : '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            {toast.error ? '' : '✓ '}{toast.msg}
          </div>
        )}

        <div style={{ padding: '24px 28px 0' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 4px 0' }}>Online Store</h1>
          <p style={{ color: '#6d7175', fontSize: '13px', margin: '0 0 20px 0' }}>Connect your store and push products automatically</p>

          <div style={{ display: 'flex', borderBottom: '1px solid #e1e3e5', gap: '0' }}>
            {[
              { id: 'connect', label: 'Connect a store' },
              { id: 'connected', label: `Connected stores ${connectedStores.length > 0 ? `(${connectedStores.length})` : ''}` },
              { id: 'push', label: 'Push products' },
              { id: 'webhook', label: 'Webhook' },
            ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setConnecting(null); }} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #1a1a1a' : '2px solid transparent', color: activeTab === tab.id ? '#1a1a1a' : '#6d7175', fontWeight: activeTab === tab.id ? '600' : '400', fontSize: '14px', cursor: 'pointer', marginBottom: '-1px' }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* CONNECT */}
          {activeTab === 'connect' && !connecting && (
            <div>
              <p style={{ fontSize: '14px', color: '#6d7175', marginBottom: '20px', marginTop: 0 }}>Choose a platform to connect your store.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', maxWidth: '700px' }}>
                {platforms.map(p => (
                  <div key={p.id} onClick={() => setConnecting(p.id)} style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                    <div style={{ width: '40px', height: '40px', background: p.color, borderRadius: '8px', marginBottom: '12px' }} />
                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '13px', color: '#6d7175', lineHeight: '1.5', marginBottom: '14px' }}>{p.desc}</div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: p.color }}>Connect {p.name} →</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'connect' && connecting === 'shopify' && (
            <div style={{ maxWidth: '500px' }}>
              <button onClick={() => setConnecting(null)} style={{ background: 'none', border: 'none', color: '#008060', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Back</button>
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f1f1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', background: '#95BF47', borderRadius: '8px' }} />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>Connect Shopify</div>
                    <div style={{ fontSize: '13px', color: '#6d7175' }}>Push products directly to your Shopify store</div>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ background: '#f0f7ff', border: '1px solid #b5d4f4', borderRadius: '8px', padding: '12px 14px', marginBottom: '18px', fontSize: '13px', color: '#0C447C', lineHeight: '1.6' }}>
                    <strong>How to get your access token:</strong><br />
                    Shopify Admin → Settings → Apps → Develop apps → Create app → Configure Admin API → Install app → Copy Admin API access token
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={lbl}>Shopify store URL</label>
                    <input value={shopifyForm.shop_url} onChange={e => setShopifyForm({ ...shopifyForm, shop_url: e.target.value })} style={inp} placeholder="your-store.myshopify.com" />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={lbl}>Admin API access token</label>
                    <input value={shopifyForm.access_token} onChange={e => setShopifyForm({ ...shopifyForm, access_token: e.target.value })} style={inp} placeholder="shpat_xxxxxxxxxxxx" type="password" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setConnecting(null)} style={{ flex: 1, padding: '10px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                    <button onClick={connectShopify} disabled={saving} style={{ flex: 2, padding: '10px', background: saving ? '#c9cccf' : '#95BF47', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                      {saving ? 'Connecting...' : 'Connect Shopify'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'connect' && connecting === 'manual' && (
            <div style={{ maxWidth: '500px' }}>
              <button onClick={() => setConnecting(null)} style={{ background: 'none', border: 'none', color: '#008060', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: 0, marginBottom: '20px' }}>← Back</button>
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f1f1' }}>
                  <div style={{ fontWeight: '600', fontSize: '15px' }}>Manual / Webhook</div>
                  <div style={{ fontSize: '13px', color: '#6d7175' }}>Connect any store using webhooks</div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={lbl}>Store name</label>
                    <input value={manualForm.store_name} onChange={e => setManualForm({ ...manualForm, store_name: e.target.value })} style={inp} placeholder="My Custom Store" />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={lbl}>Store URL (optional)</label>
                    <input value={manualForm.store_url} onChange={e => setManualForm({ ...manualForm, store_url: e.target.value })} style={inp} placeholder="https://mystore.com" />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={lbl}>Your webhook URL (send orders here)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input readOnly value={`${API_BASE}/api/webhook/${seller?.webhook_secret || 'your-secret'}`} style={{ ...inp, background: '#f6f6f7', color: '#6d7175', flex: 1 }} />
                      <button onClick={() => { navigator.clipboard.writeText(`${API_BASE}/api/webhook/${seller?.webhook_secret}`); showToast('Copied!'); }} style={{ padding: '9px 14px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>Copy</button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6d7175', marginTop: '4px' }}>Point your store's order webhook to this URL</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setConnecting(null)} style={{ flex: 1, padding: '10px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                    <button onClick={connectManual} style={{ flex: 2, padding: '10px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Save Connection</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'connect' && (connecting === 'woocommerce' || connecting === 'etsy') && (
            <div style={{ maxWidth: '500px' }}>
              <button onClick={() => setConnecting(null)} style={{ background: 'none', border: 'none', color: '#008060', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: 0, marginBottom: '20px' }}>← Back</button>
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', padding: '60px', textAlign: 'center' }}>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>{connecting === 'woocommerce' ? 'WooCommerce' : 'Etsy'} — Coming soon</div>
                <div style={{ color: '#6d7175', fontSize: '14px', marginBottom: '20px' }}>This integration is under development. Use Manual/Webhook in the meantime.</div>
                <button onClick={() => setConnecting(null)} style={{ padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Back to platforms</button>
              </div>
            </div>
          )}

          {/* CONNECTED STORES */}
          {activeTab === 'connected' && (
            <div style={{ maxWidth: '700px' }}>
              {connectedStores.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', padding: '80px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>No stores connected yet</div>
                  <div style={{ color: '#6d7175', fontSize: '14px', marginBottom: '20px' }}>Connect a store to start pushing products and receiving orders automatically</div>
                  <button onClick={() => setActiveTab('connect')} style={{ padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Connect a store</button>
                </div>
              ) : (
                <div>
                  {connectedStores.map((store, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', padding: '16px 20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', background: store.type === 'shopify' ? '#95BF47' : '#1a1a2e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '12px' }}>
                          {store.type === 'shopify' ? 'SH' : 'MW'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{store.name}</div>
                          <div style={{ fontSize: '12px', color: '#6d7175', marginTop: '2px' }}>{store.type} · Connected {new Date(store.connected_at || Date.now()).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ padding: '3px 10px', background: '#e3f9ef', color: '#008060', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>Active</span>
                        <button onClick={() => { setActiveTab('push'); }} style={{ padding: '6px 14px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Push products</button>
                        <button onClick={() => disconnectStore(i)} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ffc0c0', color: '#cc0000', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Disconnect</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab('connect')} style={{ padding: '9px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Add another store</button>
                </div>
              )}
            </div>
          )}

          {/* PUSH PRODUCTS */}
          {activeTab === 'push' && (
            <div>
              {connectedStores.length === 0 ? (
                <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '16px 20px', marginBottom: '16px', fontSize: '14px', color: '#cc0000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>You need to connect a store first before pushing products.</span>
                  <button onClick={() => setActiveTab('connect')} style={{ padding: '6px 16px', background: '#cc0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Connect now</button>
                </div>
              ) : listings.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>No listings to push</div>
                  <div style={{ color: '#6d7175', fontSize: '14px', marginBottom: '20px' }}>You need to import products and set prices before pushing to your store</div>
                  <button onClick={() => router.push('/products')} style={{ padding: '9px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Go to Products</button>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '14px', color: '#6d7175' }}>Push to:</div>
                    {connectedStores.map((s, i) => (
                      <span key={i} style={{ padding: '4px 12px', background: '#e3f9ef', color: '#008060', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>{s.name}</span>
                    ))}
                  </div>
                  <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          {['', 'Product', 'Selling price', 'Profit', 'Action'].map((h, i) => (
                            <th key={i} style={{ padding: '9px 16px', fontSize: '11px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e1e3e5' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map(l => {
                          const imgs = getImages(l.images);
                          const profit = (parseFloat(l.selling_price) - parseFloat(l.source_price_at_listing)).toFixed(2);
                          const isPushing = pushing[l.id];
                          const result = pushResults[l.id];
                          return (
                            <tr key={l.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                              <td style={{ padding: '12px 16px', width: '52px' }}>{imgs[0] ? <img src={imgs[0]} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e1e3e5', display: 'block' }} onError={e => e.target.style.display = 'none'} /> : <div style={{ width: '36px', height: '36px', background: '#f1f1f1', borderRadius: '6px' }} />}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{l.custom_title || l.original_title}</div>
                                <div style={{ fontSize: '12px', color: '#6d7175', marginTop: '2px' }}>{l.source_domain}</div>
                                {result && <div style={{ fontSize: '12px', marginTop: '4px', color: result.error ? '#cc0000' : '#008060' }}>{result.error ? result.error : result.url ? <a href={result.url} target="_blank" rel="noreferrer" style={{ color: '#008060' }}>View on Shopify ↗</a> : 'Pushed!'}</div>}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>${parseFloat(l.selling_price).toFixed(2)}</td>
                              <td style={{ padding: '12px 16px', color: '#008060', fontWeight: '600', fontSize: '14px' }}>+${profit}</td>
                              <td style={{ padding: '12px 16px' }}>
                                {connectedStores.filter(s => s.type === 'shopify').length > 0 ? (
                                  <button onClick={() => pushToShopify(l, connectedStores.find(s => s.type === 'shopify'))} disabled={isPushing} style={{ padding: '6px 16px', background: isPushing ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '6px', cursor: isPushing ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                    {isPushing ? 'Pushing...' : 'Push to Shopify'}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '13px', color: '#6d7175' }}>Connect Shopify first</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WEBHOOK */}
          {activeTab === 'webhook' && (
            <div style={{ maxWidth: '600px' }}>
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f1f1' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Webhook details</div>
                  <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '2px' }}>Use these to connect any custom store or receive orders</div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={lbl}>Order webhook URL</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input readOnly value={`${API_BASE}/api/webhook/${seller?.webhook_secret || 'loading...'}`} style={{ ...inp, background: '#f6f6f7', color: '#6d7175', flex: 1 }} />
                      <button onClick={() => { navigator.clipboard.writeText(`${API_BASE}/api/webhook/${seller?.webhook_secret}`); showToast('Copied!'); }} style={{ padding: '9px 14px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Copy</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={lbl}>Webhook secret</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input readOnly value={seller?.webhook_secret || 'loading...'} style={{ ...inp, background: '#f6f6f7', color: '#6d7175', flex: 1 }} />
                      <button onClick={() => { navigator.clipboard.writeText(seller?.webhook_secret); showToast('Copied!'); }} style={{ padding: '9px 14px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Copy</button>
                    </div>
                  </div>
                  <div style={{ background: '#f0f7ff', border: '1px solid #b5d4f4', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: '#0C447C', lineHeight: '1.7' }}>
                    <strong>Webhook payload format:</strong><br />
                    Send a POST request with JSON body containing:<br />
                    <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>order_id, customer_name, customer_email, shipping_address, product_url, quantity, total, currency</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}