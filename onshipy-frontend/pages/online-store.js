import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function OnlineStore() {
  const router = useRouter();
  const [seller, setSeller] = useState(null);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('connect');
  const [connecting, setConnecting] = useState(null);
  const [shopifyForm, setShopifyForm] = useState({ shop_url: '', api_key: '', api_secret: '' });
  const [wooForm, setWooForm] = useState({ site_url: '', consumer_key: '', consumer_secret: '' });
  const [manualForm, setManualForm] = useState({ store_name: '', store_url: '', webhook_url: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    if (s) setSeller(JSON.parse(s));
  }, []);

  const platforms = [
    { id: 'shopify', name: 'Shopify', desc: 'Connect your existing Shopify store', color: '#95BF47', logo: '🛍️', popular: true },
    { id: 'woocommerce', name: 'WooCommerce', desc: 'Connect your WordPress WooCommerce store', color: '#7F54B3', logo: '🔌' },
    { id: 'etsy', name: 'Etsy', desc: 'Sell on the Etsy marketplace', color: '#F45800', logo: '🎨' },
    { id: 'amazon', name: 'Amazon', desc: 'List products on Amazon marketplace', color: '#FF9900', logo: '📦' },
    { id: 'ebay', name: 'eBay', desc: 'Sell on eBay marketplace', color: '#0063D1', logo: '🏷️' },
    { id: 'manual', name: 'Manual / Custom', desc: 'Connect any store via webhook', color: '#1a1a2e', logo: '⚙️' },
  ];

  const cardStyle = { background: '#fff', borderRadius: '12px', border: '1px solid #e1e3e5', marginBottom: '16px', overflow: 'hidden' };
  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px', color: '#1a1a1a' };

  return (
    <Layout>
      <div style={{ padding: '32px', maxWidth: '960px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: 0 }}>🌐 Online Store</h1>
          <p style={{ color: '#6d7175', fontSize: '14px', margin: '4px 0 0 0' }}>Connect your store and push products automatically</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e1e3e5', marginBottom: '28px', gap: '0' }}>
          {[
            { id: 'connect', label: 'Connect a store' },
            { id: 'connected', label: 'Connected stores' },
            { id: 'push', label: 'Push products' },
            { id: 'webhook', label: 'Webhook settings' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #008060' : '2px solid transparent', color: activeTab === tab.id ? '#008060' : '#6d7175', fontWeight: activeTab === tab.id ? '600' : '400', fontSize: '14px', cursor: 'pointer', marginBottom: '-1px' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONNECT */}
        {activeTab === 'connect' && (
          <div>
            {!connecting ? (
              <>
                <p style={{ fontSize: '14px', color: '#6d7175', marginBottom: '20px' }}>
                  Choose a platform to connect. Once connected, you can push your imported products directly to your store.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {platforms.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setConnecting(p.id)}
                      style={{ background: '#fff', border: '1px solid #e1e3e5', borderRadius: '12px', padding: '20px', cursor: 'pointer', position: 'relative', transition: 'border-color 0.15s', ':hover': { borderColor: p.color } }}
                    >
                      {p.popular && <div style={{ position: 'absolute', top: '-10px', right: '12px', background: '#008060', color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>POPULAR</div>}
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{p.logo}</div>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#1a1a1a', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ fontSize: '13px', color: '#6d7175', lineHeight: '1.5' }}>{p.desc}</div>
                      <div style={{ marginTop: '14px', padding: '7px 0', background: p.color, color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                        Connect {p.name}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <button onClick={() => setConnecting(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#008060', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginBottom: '20px', padding: 0 }}>
                  ← Back to platforms
                </button>

                {/* Shopify Connect Form */}
                {connecting === 'shopify' && (
                  <div style={cardStyle}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f1f1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '28px' }}>🛍️</div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>Connect Shopify</div>
                        <div style={{ fontSize: '13px', color: '#6d7175' }}>Link your Shopify store to push products automatically</div>
                      </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ background: '#f0f7ff', border: '1px solid #b5d4f4', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#0C447C' }}>
                        <strong>How to get your Shopify API credentials:</strong><br />
                        Go to Shopify Admin → Apps → Develop apps → Create an app → API credentials
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Shopify store URL</label>
                        <input value={shopifyForm.shop_url} onChange={e => setShopifyForm({ ...shopifyForm, shop_url: e.target.value })} style={inputStyle} placeholder="your-store.myshopify.com" />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>API access token</label>
                        <input value={shopifyForm.api_key} onChange={e => setShopifyForm({ ...shopifyForm, api_key: e.target.value })} style={inputStyle} placeholder="shpat_xxxxxxxxxxxx" type="password" />
                      </div>
                      <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Webhook secret (optional)</label>
                        <input value={shopifyForm.api_secret} onChange={e => setShopifyForm({ ...shopifyForm, api_secret: e.target.value })} style={inputStyle} placeholder="Your webhook secret key" type="password" />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setConnecting(null)} style={{ flex: 1, padding: '10px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                        <button style={{ flex: 2, padding: '10px', background: '#95BF47', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                          Connect Shopify Store
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* WooCommerce */}
                {connecting === 'woocommerce' && (
                  <div style={cardStyle}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f1f1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '28px' }}>🔌</div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>Connect WooCommerce</div>
                        <div style={{ fontSize: '13px', color: '#6d7175' }}>Link your WordPress WooCommerce store</div>
                      </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ background: '#f0f7ff', border: '1px solid #b5d4f4', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#0C447C' }}>
                        Go to WooCommerce → Settings → Advanced → REST API → Add key → Generate key with Read/Write access
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>WordPress site URL</label>
                        <input value={wooForm.site_url} onChange={e => setWooForm({ ...wooForm, site_url: e.target.value })} style={inputStyle} placeholder="https://yoursite.com" />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Consumer key</label>
                        <input value={wooForm.consumer_key} onChange={e => setWooForm({ ...wooForm, consumer_key: e.target.value })} style={inputStyle} placeholder="ck_xxxxxxxxxxxx" type="password" />
                      </div>
                      <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Consumer secret</label>
                        <input value={wooForm.consumer_secret} onChange={e => setWooForm({ ...wooForm, consumer_secret: e.target.value })} style={inputStyle} placeholder="cs_xxxxxxxxxxxx" type="password" />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setConnecting(null)} style={{ flex: 1, padding: '10px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                        <button style={{ flex: 2, padding: '10px', background: '#7F54B3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                          Connect WooCommerce
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual/Custom */}
                {connecting === 'manual' && (
                  <div style={cardStyle}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f1f1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '28px' }}>⚙️</div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>Manual / Custom Store</div>
                        <div style={{ fontSize: '13px', color: '#6d7175' }}>Connect any store using webhooks</div>
                      </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Store name</label>
                        <input value={manualForm.store_name} onChange={e => setManualForm({ ...manualForm, store_name: e.target.value })} style={inputStyle} placeholder="My Custom Store" />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Store URL</label>
                        <input value={manualForm.store_url} onChange={e => setManualForm({ ...manualForm, store_url: e.target.value })} style={inputStyle} placeholder="https://mystore.com" />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={labelStyle}>Your Onshipy webhook URL</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input readOnly value={`https://api.onshipy.com/webhooks/${seller?.webhook_secret || 'your-secret'}`} style={{ ...inputStyle, background: '#f6f6f7', color: '#6d7175', flex: 1 }} />
                          <button onClick={() => navigator.clipboard.writeText(`https://api.onshipy.com/webhooks/${seller?.webhook_secret}`)} style={{ padding: '9px 14px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>Copy</button>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6d7175', marginTop: '4px' }}>Point your store's order webhook to this URL</div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button onClick={() => setConnecting(null)} style={{ flex: 1, padding: '10px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                        <button style={{ flex: 2, padding: '10px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                          Save Connection
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Coming soon for others */}
                {['etsy', 'amazon', 'ebay'].includes(connecting) && (
                  <div style={{ ...cardStyle, padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{platforms.find(p => p.id === connecting)?.name} integration coming soon</h3>
                    <p style={{ color: '#6d7175', fontSize: '14px', marginBottom: '20px' }}>We're building this integration. You'll be notified when it's ready.</p>
                    <button onClick={() => setConnecting(null)} style={{ padding: '10px 24px', background: '#008060', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Back to platforms</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONNECTED STORES */}
        {activeTab === 'connected' && (
          <div>
            <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '12px', border: '1px solid #e1e3e5' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔗</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No stores connected yet</h3>
              <p style={{ color: '#6d7175', fontSize: '14px', marginBottom: '20px' }}>Connect a store to start pushing products and receiving orders automatically</p>
              <button onClick={() => setActiveTab('connect')} style={{ padding: '10px 24px', background: '#008060', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Connect a store
              </button>
            </div>
          </div>
        )}

        {/* PUSH PRODUCTS */}
        {activeTab === 'push' && (
          <div>
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', fontSize: '14px', color: '#cc0000' }}>
              You need to connect a store first before you can push products.
              <button onClick={() => setActiveTab('connect')} style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#cc0000', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline', fontSize: '14px', padding: 0 }}>Connect now →</button>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e1e3e5', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>How pushing products works</h2>
              {[
                { step: '1', title: 'Import a product', desc: 'Paste any product URL from any website to import it' },
                { step: '2', title: 'Set your price', desc: 'Set your selling price and profit margin' },
                { step: '3', title: 'Connect your store', desc: 'Link your Shopify, WooCommerce or other store' },
                { step: '4', title: 'Push to store', desc: 'One click to push the product to your connected store' },
                { step: '5', title: 'Automatic fulfillment', desc: 'When a customer buys, Onshipy automatically purchases from the source and ships to them' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#008060', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px', color: '#1a1a1a' }}>{s.title}</div>
                    <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '2px' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WEBHOOK */}
        {activeTab === 'webhook' && (
          <div>
            <div style={cardStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f1f1' }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>Your webhook details</div>
                <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '2px' }}>Use these to connect any custom store</div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Webhook URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input readOnly value={`https://api.onshipy.com/webhooks/${seller?.webhook_secret || 'loading...'}`} style={{ ...inputStyle, background: '#f6f6f7', color: '#6d7175', flex: 1 }} />
                    <button onClick={() => navigator.clipboard.writeText(`https://api.onshipy.com/webhooks/${seller?.webhook_secret}`)} style={{ padding: '9px 16px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Copy</button>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Webhook secret</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input readOnly value={seller?.webhook_secret || 'loading...'} style={{ ...inputStyle, background: '#f6f6f7', color: '#6d7175', flex: 1 }} type="password" />
                    <button onClick={() => navigator.clipboard.writeText(seller?.webhook_secret)} style={{ padding: '9px 16px', background: '#f6f6f7', border: '1px solid #e1e3e5', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Copy</button>
                  </div>
                </div>
                <div style={{ background: '#f0f7ff', border: '1px solid #b5d4f4', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: '#0C447C' }}>
                  <strong>Supported events:</strong> order.created, order.updated, order.cancelled<br />
                  <strong>Format:</strong> JSON POST request<br />
                  <strong>Authentication:</strong> HMAC-SHA256 signature in X-Onshipy-Signature header
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}