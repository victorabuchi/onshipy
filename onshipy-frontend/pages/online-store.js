import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Small reusable components ──────────────────────────────────────────────
const Badge = ({ children, color = '#008060' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: color + '18', color
  }}>{children}</span>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff', borderRadius: 10,
    border: '1px solid #e1e3e5', overflow: 'hidden', ...style
  }}>{children}</div>
);

const CardHeader = ({ title, subtitle }) => (
  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f1f1' }}>
    <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{title}</div>
    {subtitle && <div style={{ fontSize: 13, color: '#6d7175', marginTop: 2 }}>{subtitle}</div>}
  </div>
);

const Btn = ({ children, onClick, disabled, variant = 'primary', style = {} }) => {
  const base = {
    padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', border: 'none',
    fontFamily: 'inherit', transition: 'opacity .15s', ...style
  };
  const variants = {
    primary: { background: disabled ? '#c9cccf' : '#1a1a1a', color: '#fff' },
    secondary: { background: '#f6f6f7', border: '1px solid #e1e3e5', color: '#1a1a1a' },
    danger: { background: '#fff0f0', border: '1px solid #ffc0c0', color: '#cc0000' },
    green: { background: disabled ? '#c9cccf' : '#008060', color: '#fff' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, placeholder, type = 'text', hint }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 5 }}>{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '9px 12px', border: '1px solid #c9cccf',
        borderRadius: 8, fontSize: 14, outline: 'none', color: '#111',
        boxSizing: 'border-box', fontFamily: 'inherit'
      }}
    />
    {hint && <div style={{ fontSize: 12, color: '#6d7175', marginTop: 4 }}>{hint}</div>}
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────
export default function OnlineStore() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [seller, setSeller] = useState(null);
  const [tab, setTab] = useState('connect');
  const [shopifyStatus, setShopifyStatus] = useState(null); // null | { connected, shop }
  const [listings, setListings] = useState([]);
  const [pushing, setPushing] = useState({});
  const [pushResults, setPushResults] = useState({});
  const [pushingAll, setPushingAll] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Connect form
  const [shopUrl, setShopUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connecting, setConnecting] = useState(false);

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) setSeller(JSON.parse(s));
    checkShopifyStatus();
    fetchListings();
  }, []);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokenRef.current}`
  });

  const checkShopifyStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('onshipy_token')}` }
      });
      const data = await res.json();
      setShopifyStatus(data);
      if (data.connected) setTab('push');
    } catch {}
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/products/listings/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('onshipy_token')}` }
      });
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch {}
    setLoading(false);
  };

  const connectShopify = async () => {
    if (!shopUrl.trim() || !accessToken.trim()) {
      showToast('Please fill in both fields', true); return;
    }
    setConnecting(true);
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/connect`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ shop_url: shopUrl.trim(), access_token: accessToken.trim() })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Connection failed', true); return; }
      setShopifyStatus({ connected: true, shop: data.shop });
      showToast(`✓ Connected to ${data.shop.name}`);
      setTab('push');
    } catch (err) {
      showToast('Connection error: ' + err.message, true);
    }
    setConnecting(false);
  };

  const disconnectShopify = async () => {
    if (!confirm('Disconnect your Shopify store?')) return;
    await fetch(`${API_BASE}/api/stores/shopify/disconnect`, {
      method: 'DELETE', headers: authHeaders()
    });
    setShopifyStatus({ connected: false });
    setTab('connect');
    showToast('Store disconnected');
  };

  const pushListing = async (listingId) => {
    setPushing(p => ({ ...p, [listingId]: true }));
    setPushResults(r => ({ ...r, [listingId]: null }));
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/push`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ listing_id: listingId })
      });
      const data = await res.json();
      if (!res.ok) {
        setPushResults(r => ({ ...r, [listingId]: { error: data.error } }));
        showToast(data.error || 'Push failed', true);
      } else {
        setPushResults(r => ({ ...r, [listingId]: { success: true, url: data.product_url } }));
        showToast('✓ Product pushed to Shopify!');
      }
    } catch (err) {
      setPushResults(r => ({ ...r, [listingId]: { error: err.message } }));
    }
    setPushing(p => ({ ...p, [listingId]: false }));
  };

  const pushAll = async () => {
    setPushingAll(true);
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/push-all`, {
        method: 'POST', headers: authHeaders()
      });
      const data = await res.json();
      showToast(`✓ Pushed ${data.pushed} products. ${data.failed > 0 ? `${data.failed} failed.` : ''}`);
      fetchListings();
    } catch (err) {
      showToast('Push all failed: ' + err.message, true);
    }
    setPushingAll(false);
  };

  const getImages = (images) => {
    try {
      if (!images) return [];
      if (typeof images === 'string') return JSON.parse(images);
      if (Array.isArray(images)) return images;
      return [];
    } catch { return []; }
  };

  const unpushedListings = listings.filter(l => !l.shopify_product_id);
  const pushedListings = listings.filter(l => l.shopify_product_id);

  const TABS = [
    { id: 'connect', label: 'Connect store' },
    { id: 'push', label: `Push products${unpushedListings.length > 0 ? ` (${unpushedListings.length})` : ''}` },
    { id: 'webhook', label: 'Webhook' },
  ];

  return (
    <Layout>
      <style>{`
        .store-tab { padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; color: #6d7175; font-weight: 400; font-size: 14px; cursor: pointer; margin-bottom: -1px; font-family: inherit; }
        .store-tab.active { color: #1a1a1a; font-weight: 600; border-bottom-color: #1a1a1a; }
        .store-tab:hover { color: #1a1a1a; }
        .step { display: flex; gap: 12px; margin-bottom: 18px; }
        .step-num { width: 26px; height: 26px; border-radius: 50%; background: #1a1a1a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .step-body { flex: 1; }
        .step-title { font-weight: 600; font-size: 14px; color: #111; margin-bottom: 4px; }
        .step-desc { font-size: 13px; color: #6d7175; line-height: 1.6; }
        code { background: #f0f0f0; border-radius: 4px; padding: '2px 6px'; font-size: 12px; }
        .listing-row:hover { background: #fafafa !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.error ? '#cc0000' : '#1a1a1a',
          color: '#fff', padding: '12px 20px', borderRadius: 8,
          fontSize: 14, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,.2)',
          maxWidth: 360
        }}>{toast.msg}</div>
      )}

      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 0', borderBottom: '1px solid #e1e3e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Online Store</h1>
              <p style={{ color: '#6d7175', fontSize: 13, margin: '4px 0 0' }}>
                {shopifyStatus?.connected
                  ? `Connected to ${shopifyStatus.shop?.name}`
                  : 'Connect your store to start selling'}
              </p>
            </div>
            {shopifyStatus?.connected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge color="#008060">● Connected</Badge>
                <Btn variant="danger" onClick={disconnectShopify} style={{ padding: '6px 14px', fontSize: 13 }}>
                  Disconnect
                </Btn>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex' }}>
            {TABS.map(t => (
              <button key={t.id} className={`store-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px', background: '#f6f6f7', minHeight: 'calc(100vh - 160px)' }}>

          {/* ── CONNECT TAB ─────────────────────────────────────────────── */}
          {tab === 'connect' && (
            <div style={{ maxWidth: 560 }}>

              {shopifyStatus?.connected && (
                <div style={{
                  background: '#f0fdf6', border: '1px solid #bbf7d0', borderRadius: 10,
                  padding: '14px 18px', marginBottom: 20, display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#008060' }}>
                      ✓ {shopifyStatus.shop?.name} is connected
                    </div>
                    <div style={{ fontSize: 13, color: '#6d7175', marginTop: 2 }}>
                      {shopifyStatus.shop?.url}
                    </div>
                  </div>
                  <Btn variant="secondary" onClick={() => setTab('push')} style={{ fontSize: 13 }}>
                    Push products →
                  </Btn>
                </div>
              )}

              <Card>
                <CardHeader
                  title="Connect Shopify"
                  subtitle="Push products directly to your Shopify store with one click"
                />
                <div style={{ padding: '20px' }}>

                  {/* Step-by-step guide */}
                  <div style={{
                    background: '#f6f6f7', borderRadius: 8, padding: '16px 18px', marginBottom: 20
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12 }}>
                      How to get your access token (2 minutes)
                    </div>

                    {[
                      {
                        n: 1, title: 'Open your Shopify Admin',
                        desc: <>Go to <strong>Settings → Apps and sales channels → Develop apps</strong></>
                      },
                      {
                        n: 2, title: 'Create a custom app',
                        desc: 'Click "Create an app", give it any name (e.g. "Onshipy")'
                      },
                      {
                        n: 3, title: 'Configure API permissions',
                        desc: <>Click <strong>Configure Admin API scopes</strong> and enable: <br />
                          <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>
                            read_products, write_products, read_orders, write_orders
                          </code>
                        </>
                      },
                      {
                        n: 4, title: 'Install and copy token',
                        desc: 'Click Install app → go to API credentials → copy the Admin API access token (starts with shpat_)'
                      },
                    ].map(step => (
                      <div key={step.n} className="step">
                        <div className="step-num">{step.n}</div>
                        <div className="step-body">
                          <div className="step-title">{step.title}</div>
                          <div className="step-desc">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Input
                    label="Shopify store URL"
                    value={shopUrl}
                    onChange={e => setShopUrl(e.target.value)}
                    placeholder="your-store.myshopify.com"
                    hint="Just the domain — no https:// needed"
                  />
                  <Input
                    label="Admin API access token"
                    value={accessToken}
                    onChange={e => setAccessToken(e.target.value)}
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                    type="password"
                    hint="Starts with shpat_ — keep this secret"
                  />

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <Btn
                      onClick={connectShopify}
                      disabled={connecting || !shopUrl || !accessToken}
                      style={{ flex: 1 }}
                    >
                      {connecting ? 'Connecting...' : 'Connect Shopify'}
                    </Btn>
                  </div>
                </div>
              </Card>

              {/* Other platforms */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6d7175', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Other platforms
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { name: 'WooCommerce', color: '#7F54B3', status: 'Coming soon' },
                    { name: 'Etsy', color: '#F45800', status: 'Coming soon' },
                    { name: 'Amazon', color: '#FF9900', status: 'Coming soon' },
                    { name: 'Custom / Webhook', color: '#1a1a2e', status: 'Available', action: () => setTab('webhook') },
                  ].map((p, i) => (
                    <div
                      key={i}
                      onClick={p.action}
                      style={{
                        background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5',
                        padding: '14px 16px', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', cursor: p.action ? 'pointer' : 'default'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: p.status === 'Available' ? '#008060' : '#9ca3af', marginTop: 2 }}>
                          {p.status}
                        </div>
                      </div>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PUSH TAB ────────────────────────────────────────────────── */}
          {tab === 'push' && (
            <div>
              {!shopifyStatus?.connected && (
                <div style={{
                  background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10,
                  padding: '14px 20px', marginBottom: 20, display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ fontSize: 14, color: '#856404' }}>
                    Connect your Shopify store first to push products.
                  </div>
                  <Btn onClick={() => setTab('connect')} variant="primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                    Connect →
                  </Btn>
                </div>
              )}

              {listings.length === 0 && !loading && (
                <Card>
                  <div style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>No listings yet</div>
                    <div style={{ color: '#6d7175', fontSize: 14, marginBottom: 20 }}>
                      Import a product and set a price before pushing to your store
                    </div>
                    <Btn onClick={() => router.push('/products')}>Go to Products</Btn>
                  </div>
                </Card>
              )}

              {listings.length > 0 && (
                <>
                  {/* Summary bar */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Badge color="#6d7175">{listings.length} listings total</Badge>
                      <Badge color="#008060">{pushedListings.length} pushed</Badge>
                      {unpushedListings.length > 0 && <Badge color="#856404">{unpushedListings.length} pending</Badge>}
                    </div>
                    {shopifyStatus?.connected && unpushedListings.length > 0 && (
                      <Btn
                        variant="green"
                        onClick={pushAll}
                        disabled={pushingAll}
                        style={{ padding: '8px 18px', fontSize: 13 }}
                      >
                        {pushingAll ? 'Pushing all...' : `Push all ${unpushedListings.length} →`}
                      </Btn>
                    )}
                  </div>

                  <Card>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          {['', 'Product', 'Price', 'Profit', 'Status', 'Action'].map((h, i) => (
                            <th key={i} style={{
                              padding: '9px 16px', fontSize: 11, fontWeight: 600,
                              color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.06em',
                              textAlign: 'left', borderBottom: '1px solid #e1e3e5'
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map(l => {
                          const imgs = getImages(l.images);
                          const profit = (parseFloat(l.selling_price) - parseFloat(l.source_price_at_listing)).toFixed(2);
                          const isPushing = pushing[l.id];
                          const result = pushResults[l.id];
                          const alreadyPushed = !!l.shopify_product_id;

                          return (
                            <tr key={l.id} className="listing-row" style={{ borderBottom: '1px solid #f1f1f1', background: '#fff' }}>
                              <td style={{ padding: '12px 16px', width: 52 }}>
                                {imgs[0]
                                  ? <img src={imgs[0]} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #e1e3e5', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                                  : <div style={{ width: 36, height: 36, background: '#f1f1f1', borderRadius: 6 }} />
                                }
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                                  {l.custom_title || l.original_title}
                                </div>
                                <div style={{ fontSize: 12, color: '#6d7175', marginTop: 2 }}>{l.source_domain}</div>
                                {result?.url && (
                                  <a href={result.url} target="_blank" rel="noreferrer"
                                    style={{ fontSize: 12, color: '#008060', textDecoration: 'none' }}>
                                    View on Shopify ↗
                                  </a>
                                )}
                                {result?.error && (
                                  <div style={{ fontSize: 12, color: '#cc0000' }}>{result.error}</div>
                                )}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>
                                ${parseFloat(l.selling_price).toFixed(2)}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#008060', fontWeight: 600 }}>
                                +${profit}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                {alreadyPushed
                                  ? <Badge color="#008060">Pushed</Badge>
                                  : <Badge color="#6d7175">Not pushed</Badge>
                                }
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                {shopifyStatus?.connected ? (
                                  <Btn
                                    onClick={() => pushListing(l.id)}
                                    disabled={isPushing}
                                    variant={alreadyPushed ? 'secondary' : 'primary'}
                                    style={{ padding: '6px 14px', fontSize: 13 }}
                                  >
                                    {isPushing ? 'Pushing...' : alreadyPushed ? 'Re-push' : 'Push'}
                                  </Btn>
                                ) : (
                                  <span style={{ fontSize: 13, color: '#9ca3af' }}>Connect store first</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ── WEBHOOK TAB ─────────────────────────────────────────────── */}
          {tab === 'webhook' && (
            <div style={{ maxWidth: 600 }}>
              <Card>
                <CardHeader
                  title="Webhook — receive orders from any store"
                  subtitle="Point your store's order webhook to this URL"
                />
                <div style={{ padding: 20 }}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>
                      Your webhook URL
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        readOnly
                        value={`${API_BASE}/api/webhook/${seller?.webhook_secret || '...'}`}
                        style={{
                          flex: 1, padding: '9px 12px', border: '1px solid #e1e3e5',
                          borderRadius: 8, fontSize: 13, color: '#6d7175',
                          background: '#f6f6f7', fontFamily: 'monospace'
                        }}
                      />
                      <Btn variant="secondary" style={{ padding: '9px 14px', fontSize: 13 }}
                        onClick={() => {
                          navigator.clipboard.writeText(`${API_BASE}/api/webhook/${seller?.webhook_secret}`);
                          showToast('Copied!');
                        }}>Copy</Btn>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>
                      Webhook secret
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        readOnly
                        value={seller?.webhook_secret || '...'}
                        style={{
                          flex: 1, padding: '9px 12px', border: '1px solid #e1e3e5',
                          borderRadius: 8, fontSize: 13, color: '#6d7175',
                          background: '#f6f6f7', fontFamily: 'monospace'
                        }}
                      />
                      <Btn variant="secondary" style={{ padding: '9px 14px', fontSize: 13 }}
                        onClick={() => { navigator.clipboard.writeText(seller?.webhook_secret); showToast('Copied!'); }}>
                        Copy
                      </Btn>
                    </div>
                  </div>

                  <div style={{
                    background: '#f0f7ff', border: '1px solid #b5d4f4',
                    borderRadius: 8, padding: '14px 16px', fontSize: 13,
                    color: '#0C447C', lineHeight: 1.7
                  }}>
                    <strong>Expected payload format:</strong><br />
                    <code style={{ background: 'rgba(0,0,0,.06)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>
                      {'{ order_id, customer_name, customer_email, shipping_address, product_url, quantity, total, currency }'}
                    </code>
                    <br /><br />
                    Send a <strong>POST</strong> request with <strong>Content-Type: application/json</strong>.
                    Orders will appear in your dashboard automatically.
                  </div>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}