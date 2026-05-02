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
    primary:  { background: P.text,    color: '#fff', border: 'none' },
    secondary:{ background: P.surface, color: P.text, border: `1px solid ${P.border}` },
    green:    { background: P.green,   color: '#fff', border: 'none' },
    danger:   { background: P.surface, color: '#d82c0d', border: '1px solid rgba(216,44,13,0.3)' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...s[variant], padding: '7px 16px', borderRadius: 8,
      fontSize: P.fontSize, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: P.font, letterSpacing: P.letterSpacing,
      opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap', ...style
    }}>{children}</button>
  );
};

const SUB_PAGES = ['channels', 'themes', 'pages', 'preferences'];

export default function OnlineStore() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [seller, setSeller] = useState(null);
  const [section, setSection] = useState('channels');
  const [shopifyStatus, setShopifyStatus] = useState(null);
  const [listings, setListings] = useState([]);
  const [pushing, setPushing] = useState({});
  const [pushingAll, setPushingAll] = useState(false);
  const [toast, setToast] = useState(null);
  const [shopInput, setShopInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) { try { setSeller(JSON.parse(s)); } catch {} }

    const { shopify, shop, error, section: sec } = router.query;
    if (shopify === 'connected') {
      showToast(`✓ Connected to ${decodeURIComponent(shop || 'your store')}!`);
      router.replace('/online-store', undefined, { shallow: true });
    }
    if (error) {
      showToast('Shopify connection failed: ' + error, true);
      router.replace('/online-store', undefined, { shallow: true });
    }
    if (sec && SUB_PAGES.includes(sec)) setSection(sec);

    checkStatus(t);
    fetchListings(t);
  }, [router.query]);

  const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` });

  const checkStatus = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/status`, { headers: { Authorization: `Bearer ${t || tokenRef.current}` } });
      const data = await res.json();
      setShopifyStatus(data);
    } catch {}
  };

  const fetchListings = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/listings/all`, { headers: { Authorization: `Bearer ${t || tokenRef.current}` } });
      const data = await res.json();
      if (data.listings) setListings(data.listings);
    } catch {}
  };

  const connectShopify = async () => {
    if (!shopInput.trim()) { showToast('Enter your store name', true); return; }
    setConnecting(true);
    try {
      const shop = shopInput.trim().replace('.myshopify.com', '').replace('https://', '').replace(/\/$/, '');
      const res = await fetch(`${API_BASE}/api/stores/shopify/install?shop=${encodeURIComponent(shop + '.myshopify.com')}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      const data = await res.json();
      if (!res.ok || !data.install_url) { showToast(data.error || 'Could not connect', true); setConnecting(false); return; }
      window.location.href = data.install_url;
    } catch (err) { showToast('Error: ' + err.message, true); setConnecting(false); }
  };

  const disconnectShopify = async () => {
    if (!confirm('Disconnect Shopify store?')) return;
    await fetch(`${API_BASE}/api/stores/shopify/disconnect`, { method: 'DELETE', headers: authH() });
    setShopifyStatus({ connected: false });
    showToast('Store disconnected');
  };

  const pushListing = async (id) => {
    setPushing(p => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/push`, {
        method: 'POST', headers: authH(), body: JSON.stringify({ listing_id: id })
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error || 'Push failed', true);
      else { showToast('✓ Pushed to Shopify!'); fetchListings(); }
    } catch (err) { showToast(err.message, true); }
    setPushing(p => ({ ...p, [id]: false }));
  };

  const pushAll = async () => {
    setPushingAll(true);
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/push-all`, { method: 'POST', headers: authH() });
      const data = await res.json();
      showToast(`✓ Pushed ${data.pushed} products${data.failed > 0 ? `, ${data.failed} failed` : ''}`);
      fetchListings();
    } catch (err) { showToast(err.message, true); }
    setPushingAll(false);
  };

  const getImages = (images) => {
    try { return typeof images === 'string' ? JSON.parse(images) : (Array.isArray(images) ? images : []); }
    catch { return []; }
  };

  const unpushed = listings.filter(l => !l.shopify_product_id);
  const pushed = listings.filter(l => l.shopify_product_id);

  const subNav = [
    { id: 'channels', label: 'Sales channels' },
    { id: 'themes', label: 'Themes' },
    { id: 'pages', label: 'Pages' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <Layout title="Online Store">
      <style>{`
        .sub-tab { padding: 6px 14px; background: none; border: none; border-radius: 6px; font-size: ${P.fontSize}; color: ${P.textSubdued}; cursor: pointer; font-family: ${P.font}; letter-spacing: ${P.letterSpacing}; font-weight: ${P.fontWeight}; white-space: nowrap; transition: background .1s, color .1s; }
        .sub-tab:hover { background: rgba(0,0,0,0.05); color: ${P.text}; }
        .sub-tab.active { background: rgba(0,0,0,0.07); color: ${P.text}; font-weight: 600; }
        .push-row:hover { background: #fafafa !important; }
        .platform-card { background: ${P.surface}; border: 1px solid ${P.border}; border-radius: 10px; padding: 16px; cursor: pointer; transition: box-shadow .15s; }
        .platform-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.err ? '#d82c0d' : P.text, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ fontFamily: P.font, fontSize: P.fontSize, letterSpacing: P.letterSpacing, color: P.text, background: P.bg, minHeight: 'calc(100vh - 56px)' }}>

        {/* Header — floating on gray bg */}
        <div style={{ padding: '12px 20px 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🛍️</span>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: 0, letterSpacing: '-0.02em' }}>Online Store</h1>
              {shopifyStatus?.connected && (
                <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>
                  ● Connected
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {shopifyStatus?.connected && (
                <Btn variant="danger" onClick={disconnectShopify} style={{ fontSize: '0.75rem', padding: '5px 12px' }}>Disconnect</Btn>
              )}
            </div>
          </div>

          {/* Sub nav — Shopify style left sidebar-like tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {subNav.map(t => (
              <button key={t.id} className={`sub-tab${section === t.id ? ' active' : ''}`} onClick={() => setSection(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', background: P.bg, minHeight: 'calc(100vh - 108px)' }}>

          {/* ── SALES CHANNELS ─────────────────────────────────────────── */}
          {section === 'channels' && (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>

              {/* Shopify connect card */}
              <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: '#95BF47', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M15.337 23.979l7.301-1.644S19.974 7.823 19.953 7.679c-.02-.144-.145-.24-.27-.24s-2.513-.173-2.513-.173-.144-.019-.24-.106l-1.593-10.16z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 650, fontSize: '0.9375rem', color: P.text }}>Shopify</div>
                      <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 1 }}>
                        {shopifyStatus?.connected
                          ? `Connected to ${shopifyStatus.shop?.name} · ${shopifyStatus.shop?.url}`
                          : 'Sell directly on your Shopify store'}
                      </div>
                    </div>
                  </div>
                  {shopifyStatus?.connected ? (
                    <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Active</span>
                  ) : null}
                </div>

                {shopifyStatus?.connected ? (
                  /* Connected state — push products */
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text }}>{listings.length}</div>
                          <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>Total listings</div>
                        </div>
                        <div style={{ width: 1, background: P.border }}/>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.125rem', fontWeight: 650, color: P.green }}>{pushed.length}</div>
                          <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>Pushed</div>
                        </div>
                        <div style={{ width: 1, background: P.border }}/>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.125rem', fontWeight: 650, color: '#f59e0b' }}>{unpushed.length}</div>
                          <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>Pending</div>
                        </div>
                      </div>
                      {unpushed.length > 0 && (
                        <Btn variant="green" onClick={pushAll} disabled={pushingAll}>
                          {pushingAll ? 'Pushing...' : `Push ${unpushed.length} to Shopify →`}
                        </Btn>
                      )}
                    </div>

                    {/* Progress bar */}
                    {listings.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: '0.75rem', color: P.textSubdued }}>Push progress</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: P.green }}>{listings.length > 0 ? Math.round((pushed.length / listings.length) * 100) : 0}%</span>
                        </div>
                        <div style={{ height: 4, background: P.bg, borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${listings.length > 0 ? (pushed.length / listings.length) * 100 : 0}%`, background: P.green, borderRadius: 2, transition: 'width .4s' }}/>
                        </div>
                      </div>
                    )}

                    {/* Listings table */}
                    {listings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px', color: P.textSubdued, fontSize: P.fontSize }}>
                        No listings yet. <button onClick={() => router.push('/products')} style={{ background: 'none', border: 'none', color: P.green, cursor: 'pointer', fontWeight: 600, fontFamily: P.font, fontSize: P.fontSize }}>Import a product →</button>
                      </div>
                    ) : (
                      <div style={{ borderRadius: 8, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#fafafa' }}>
                              {['', 'Product', 'Price', 'Shopify', ''].map((h, i) => (
                                <th key={i} style={{ padding: '7px 12px', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: `1px solid ${P.border}` }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {listings.map(l => {
                              const imgs = getImages(l.images);
                              const isPushed = !!l.shopify_product_id;
                              return (
                                <tr key={l.id} className="push-row" style={{ background: P.surface }}>
                                  <td style={{ padding: '9px 12px', width: 40 }}>
                                    {imgs[0]
                                      ? <img src={imgs[0]} alt="" style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 6, border: `1px solid ${P.border}`, display: 'block' }} onError={e => e.target.style.display = 'none'} />
                                      : <div style={{ width: 30, height: 30, background: P.bg, borderRadius: 6 }}/>}
                                  </td>
                                  <td style={{ padding: '9px 12px' }}>
                                    <div style={{ fontWeight: 500, fontSize: P.fontSize, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{l.custom_title || l.original_title}</div>
                                    <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>{l.source_domain}</div>
                                  </td>
                                  <td style={{ padding: '9px 12px', fontWeight: 600, fontSize: P.fontSize }}>${parseFloat(l.selling_price).toFixed(2)}</td>
                                  <td style={{ padding: '9px 12px' }}>
                                    {isPushed
                                      ? <span style={{ fontSize: '0.6875rem', padding: '2px 7px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>✓ Live</span>
                                      : <span style={{ fontSize: '0.6875rem', padding: '2px 7px', borderRadius: 20, background: P.bg, color: P.textSubdued, fontWeight: 500 }}>Not pushed</span>}
                                  </td>
                                  <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                                    <Btn onClick={() => pushListing(l.id)} disabled={pushing[l.id]} variant={isPushed ? 'secondary' : 'primary'} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                                      {pushing[l.id] ? '...' : isPushed ? 'Re-push' : 'Push'}
                                    </Btn>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Not connected — ONE click connect */
                  <div style={{ padding: '24px 20px' }}>
                    <div style={{ maxWidth: 460 }}>
                      <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 16, lineHeight: 1.6 }}>
                        Connect your Shopify store to push products directly. You'll be redirected to Shopify to approve — no tokens, no copying.
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                          <input
                            value={shopInput}
                            onChange={e => setShopInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !connecting && connectShopify()}
                            placeholder="your-store"
                            style={{ width: '100%', padding: '8px 120px 8px 12px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, letterSpacing: P.letterSpacing, color: P.text, boxSizing: 'border-box' }}
                          />
                          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: P.textSubdued, pointerEvents: 'none' }}>.myshopify.com</span>
                        </div>
                        <Btn variant="green" onClick={connectShopify} disabled={connecting || !shopInput.trim()} style={{ padding: '8px 18px' }}>
                          {connecting ? 'Connecting...' : 'Connect Shopify →'}
                        </Btn>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 8 }}>
                        Enter just your store name — e.g. if your store is <strong>mystore.myshopify.com</strong> enter <strong>mystore</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Other channels */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>More sales channels</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {[
                    { name: 'WooCommerce', desc: 'Push to WordPress stores', color: '#7F54B3', status: 'Coming soon' },
                    { name: 'Etsy', desc: 'Sell on Etsy marketplace', color: '#F45800', status: 'Coming soon' },
                    { name: 'Amazon', desc: 'List on Amazon', color: '#FF9900', status: 'Coming soon' },
                    { name: 'Webhook', desc: 'Custom store integration', color: '#1a1a2e', status: 'Available', action: () => setSection('preferences') },
                  ].map((p, i) => (
                    <div key={i} className="platform-card" onClick={p.action}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{p.name[0]}</span>
                        </div>
                        <span style={{ fontSize: '0.6875rem', padding: '2px 7px', borderRadius: 20, background: p.status === 'Available' ? '#cdfed4' : P.bg, color: p.status === 'Available' ? '#006847' : P.textSubdued, fontWeight: 600 }}>{p.status}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── THEMES ────────────────────────────────────────────────── */}
          {section === 'themes' && (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 650, fontSize: '0.9375rem', color: P.text }}>Current theme</div>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 1 }}>Onshipy Default · Version 1.0</div>
                  </div>
                  <Btn variant="primary">Customize</Btn>
                </div>
                <div style={{ padding: '24px 20px', display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ width: 200, height: 130, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>Onshipy</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text, marginBottom: 4 }}>Onshipy Default</div>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued, lineHeight: 1.6, marginBottom: 12 }}>Your current storefront theme. Clean, fast, and optimized for product imports from any source.</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn>Preview</Btn>
                      <Btn variant="primary">Edit theme</Btn>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Popular free themes</div>
                <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {[
                      { name: 'Horizon', by: 'Onshipy', color: '#2d3436' },
                      { name: 'Minimal', by: 'Onshipy', color: '#636e72' },
                      { name: 'Bold', by: 'Onshipy', color: '#d63031' },
                      { name: 'Elegant', by: 'Onshipy', color: '#6c5ce7' },
                      { name: 'Fresh', by: 'Onshipy', color: '#00b894' },
                      { name: 'Classic', by: 'Onshipy', color: '#fdcb6e' },
                    ].map((t, i) => (
                      <div key={i} style={{ border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                        <div style={{ height: 100, background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{t.name}</span>
                        </div>
                        <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{t.name}</div>
                            <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>by {t.by}</div>
                          </div>
                          <button style={{ padding: '4px 10px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontFamily: P.font }}>Add</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PAGES ─────────────────────────────────────────────────── */}
          {section === 'pages' && (
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 650, margin: 0, color: P.text }}>Pages</h2>
                <Btn variant="primary">Add page</Btn>
              </div>
              <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafafa' }}>
                      {['Title', 'Visibility', 'Updated'].map((h, i) => (
                        <th key={i} style={{ padding: '8px 16px', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: `1px solid ${P.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { title: 'About Onshipy', visibility: 'Visible', updated: 'Today' },
                      { title: 'Privacy Policy', visibility: 'Visible', updated: '2 days ago' },
                      { title: 'Terms of Service', visibility: 'Visible', updated: '2 days ago' },
                      { title: 'Contact', visibility: 'Visible', updated: '2 days ago' },
                    ].map((p, i) => (
                      <tr key={i} className="push-row" style={{ background: P.surface }}>
                        <td style={{ padding: '11px 16px', fontSize: P.fontSize, borderBottom: `1px solid ${P.border}`, color: '#2b6cb0', cursor: 'pointer', fontWeight: 500 }}>{p.title}</td>
                        <td style={{ padding: '11px 16px', fontSize: P.fontSize, borderBottom: `1px solid ${P.border}` }}>
                          <span style={{ fontSize: '0.6875rem', padding: '2px 7px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>{p.visibility}</span>
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: P.fontSize, color: P.textSubdued, borderBottom: `1px solid ${P.border}` }}>{p.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '12px 16px', textAlign: 'center', borderTop: `1px solid ${P.border}`, fontSize: P.fontSize, color: P.textSubdued }}>
                  <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>Learn more about pages</span>
                </div>
              </div>
            </div>
          )}

          {/* ── PREFERENCES ───────────────────────────────────────────── */}
          {section === 'preferences' && (
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              {/* Webhook */}
              <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}` }}>
                  <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Webhook</div>
                  <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>Receive orders from any custom store</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {[
                    { label: 'Webhook URL', value: `${API_BASE}/api/webhook/${seller?.webhook_secret || '...'}` },
                    { label: 'Secret key', value: seller?.webhook_secret || '...' },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.label}</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input readOnly value={item.value} style={{ flex: 1, padding: '7px 12px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, background: P.bg, color: P.textSubdued, fontFamily: 'monospace', outline: 'none' }}/>
                        <Btn onClick={() => { navigator.clipboard.writeText(item.value); showToast('Copied!'); }}>Copy</Btn>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: '#eaf4ff', border: '1px solid #b5d4f4', borderRadius: 8, padding: '12px 14px', fontSize: P.fontSize, color: '#0C447C', lineHeight: 1.7 }}>
                    Send a <strong>POST</strong> request with JSON to receive orders automatically.<br/>
                    <code style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4 }}>
                      {'{ order_id, customer_name, customer_email, shipping_address, product_url, quantity, total }'}
                    </code>
                  </div>
                </div>
              </div>

              {/* Store settings */}
              <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}` }}>
                  <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Store preferences</div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  {[
                    { label: 'Password protection', desc: 'Restrict access to visitors with a password', enabled: false },
                    { label: 'Automatic redirection', desc: 'Redirect customers based on their location', enabled: true },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === 0 ? `1px solid ${P.border}` : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{s.label}</div>
                        <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>{s.desc}</div>
                      </div>
                      <div style={{ width: 36, height: 20, borderRadius: 10, background: s.enabled ? P.green : P.border, position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: s.enabled ? 18 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}