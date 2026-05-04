import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem',
};

export default function OnlineStore() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [shopify, setShopify] = useState(null);   // null=loading | false=not connected | object=connected
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [shopInput, setShopInput] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fix bfcache: when browser restores page from cache (Back button), reset connecting
  useEffect(() => {
    const onPageShow = (e) => { if (e.persisted) setConnecting(false); };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    setConnecting(false); // always reset on any navigation return

    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;

    const { shopify: sh, error: err } = router.query;

    if (sh === 'connected') {
      setSuccessMsg('Shopify connected successfully!');
      router.replace('/online-store', undefined, { shallow: true });
    } else if (err) {
      const msgs = {
        missing_params:        'Connection failed — missing parameters.',
        invalid_state:         'Connection failed — security check failed. Please try again.',
        invalid_hmac:          'Connection failed — invalid Shopify signature.',
        token_exchange_failed: 'Connection failed — could not get access token.',
        server_error:          'Server error. Please try again.',
      };
      setError(msgs[err] || 'Connection failed. Please try again.');
      router.replace('/online-store', undefined, { shallow: true });
    }

    fetchStatus(t);
  }, [router.isReady, router.query]);

  const fetchStatus = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/status`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setShopify(data.connected ? data : false);
    } catch {
      setShopify(false);
    }
  };

  const handleConnect = async () => {
    if (!shopInput.trim()) { setError('Enter your Shopify store name.'); return; }
    setError('');
    setConnecting(true);
    try {
      const shop = shopInput.trim().replace(/\.myshopify\.com$/, ''); // strip suffix if pasted
      const res = await fetch(`${API_BASE}/api/stores/shopify/install?shop=${encodeURIComponent(shop)}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start connection. Please try again.');
        setConnecting(false);
      }
    } catch {
      setError('Connection error. Please check your internet and try again.');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Shopify store?')) return;
    setDisconnecting(true);
    try {
      await fetch(`${API_BASE}/api/stores/shopify`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      setShopify(false);
      setSuccessMsg('');
    } catch {
      setError('Failed to disconnect. Please try again.');
    }
    setDisconnecting(false);
  };

  // Shared card style (same for all 3 channels)
  const cardStyle = {
    background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`,
    padding: '16px 20px', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 14,
  };

  return (
    <Layout title="Online Store">
      <div style={{ fontFamily: P.font, fontSize: P.fontSize, color: P.text, maxWidth: 760, margin: '0 auto', padding: '24px 20px 80px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Sales channels</h1>
          <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: 0 }}>Connect your stores to automatically push products and fulfill orders.</p>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#cdfed4', border: '1px solid #92fcac', borderRadius: 10, marginBottom: 16, fontSize: P.fontSize, color: '#006847', fontWeight: 500 }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="#006847"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm4.78 6.97-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L8.75 11.94l4.97-4.97a.75.75 0 0 1 1.06 1.06Z"/></svg>
            {successMsg}
            <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#006847', display: 'flex', padding: 2 }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fee8eb', border: '1px solid #ffc9cf', borderRadius: 10, marginBottom: 16, fontSize: P.fontSize, color: '#d82c0d' }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="#d82c0d"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm-.75 4.75a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0v-4.5ZM10 14.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d82c0d', display: 'flex', padding: 2 }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* ── SHOPIFY ── same card structure as WooCommerce / Etsy */}
        <div style={cardStyle}>
          <img src="/shopify-logo.png" width="44" height="44" alt="Shopify" style={{ borderRadius: 10, flexShrink: 0, objectFit: 'contain' }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text }}>Shopify</div>
            <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>
              {shopify ? shopify.shop : 'Push products and sync orders automatically'}
            </div>
          </div>

          {/* Right-side action */}
          {shopify === null ? (
            // Loading status
            <span style={{ fontSize: '0.75rem', color: P.textSubdued }}>Checking…</span>

          ) : shopify ? (
            // Connected
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <span style={{ padding: '3px 10px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 7 }}>●</span> Connected
              </span>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                style={{ padding: '5px 14px', background: P.surface, color: '#d82c0d', border: '1px solid rgba(216,44,13,0.3)', borderRadius: 8, cursor: disconnecting ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 500, fontFamily: P.font, whiteSpace: 'nowrap' }}
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </div>

          ) : showInput ? (
            // Inline store input
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden', background: P.surface }}>
                <input
                  autoFocus
                  type="text"
                  value={shopInput}
                  onChange={e => setShopInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleConnect(); if (e.key === 'Escape') { setShowInput(false); setShopInput(''); setError(''); } }}
                  placeholder="yourstore"
                  style={{ width: 120, padding: '6px 10px', border: 'none', outline: 'none', fontSize: '0.75rem', fontFamily: P.font, color: P.text, background: 'transparent' }}
                />
                <span style={{ padding: '6px 8px', background: P.bg, color: P.textSubdued, fontSize: '0.75rem', borderLeft: `1px solid ${P.border}`, whiteSpace: 'nowrap' }}>
                  .myshopify.com
                </span>
              </div>
              <button
                onClick={handleConnect}
                disabled={connecting || !shopInput.trim()}
                style={{ padding: '6px 14px', background: connecting || !shopInput.trim() ? P.bg : '#96bf48', color: connecting || !shopInput.trim() ? P.textSubdued : '#fff', border: 'none', borderRadius: 8, cursor: connecting || !shopInput.trim() ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: P.font, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
              >
                {connecting && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg>}
                {connecting ? 'Connecting…' : 'Connect'}
              </button>
              <button
                onClick={() => { setShowInput(false); setShopInput(''); setError(''); }}
                style={{ padding: '6px 8px', background: 'none', border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', color: P.textSubdued, fontFamily: P.font }}
              >
                Cancel
              </button>
            </div>

          ) : (
            // Not connected — show connect button
            <button
              onClick={() => setShowInput(true)}
              style={{ flexShrink: 0, padding: '6px 16px', background: '#96bf48', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: P.font, whiteSpace: 'nowrap' }}
            >
              Connect Shopify
            </button>
          )}
        </div>

        {/* ── WOOCOMMERCE & ETSY (coming soon) ── */}
        {[
          { name: 'WooCommerce', desc: 'Connect your WordPress + WooCommerce store', logo: '/woocommerce-logo.png' },
          { name: 'Etsy',        desc: 'Sell handmade and vintage products',          logo: '/Etsy-Logo.png' },
        ].map((ch, i) => (
          <div key={i} style={{ ...cardStyle, opacity: 0.6 }}>
            <img src={ch.logo} width="44" height="44" alt={ch.name} style={{ borderRadius: 10, flexShrink: 0, objectFit: 'contain' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text }}>{ch.name}</div>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>{ch.desc}</div>
            </div>
            <span style={{ padding: '3px 10px', background: P.bg, color: P.textSubdued, borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, border: `1px solid ${P.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Coming soon
            </span>
          </div>
        ))}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Layout>
  );
}
