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
  const [shopify, setShopify] = useState(null); // null=loading, false=not connected, object=connected
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [seller, setSeller] = useState(null);
  // Track that user just returned from OAuth so we can show the right state while API loads
  const [oauthReturn, setOauthReturn] = useState(null); // 'connected' | 'failed' | null

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;

    const s = localStorage.getItem('onshipy_seller');
    if (s) { try { setSeller(JSON.parse(s)); } catch {} }

    const { shopify: sh, error: err } = router.query;

    if (sh === 'connected') {
      setOauthReturn('connected');
      setSuccessMsg('Shopify connected successfully!');
      // Clean up query params without page reload
      router.replace('/online-store', undefined, { shallow: true });
    } else if (err) {
      setOauthReturn('failed');
      const msgs = {
        missing_params:       'Connection failed — missing parameters.',
        invalid_state:        'Connection failed — security check failed. Please try again.',
        invalid_hmac:         'Connection failed — invalid Shopify signature.',
        token_exchange_failed:'Connection failed — could not get access token.',
        server_error:         'Server error. Please try again.',
      };
      setError(msgs[err] || 'Connection failed. Please try again.');
      router.replace('/online-store', undefined, { shallow: true });
    }

    fetchStatus(t);
  }, [router.isReady]);

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

  // Derive a shop subdomain from seller's store_name (e.g. "My Store" → "my-store")
  const getShopSlug = () => {
    if (!seller?.store_name) return '';
    return seller.store_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleConnect = async () => {
    setError('');
    setOauthReturn(null);
    setConnecting(true);
    const shop = getShopSlug();
    try {
      const url = shop
        ? `${API_BASE}/api/stores/shopify/install?shop=${encodeURIComponent(shop)}`
        : `${API_BASE}/api/stores/shopify/install`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // leaves the app → Shopify OAuth
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
      setOauthReturn(null);
      setSuccessMsg('');
    } catch {
      setError('Failed to disconnect. Please try again.');
    }
    setDisconnecting(false);
  };

  // What body content to show inside the Shopify card
  const renderShopifyBody = () => {
    // Still checking status
    if (shopify === null) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: P.textSubdued, fontSize: P.fontSize }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/>
          </svg>
          Checking connection status…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    // Connected
    if (shopify) {
      return (
        <div>
          <div style={{ background: P.bg, borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>{shopify.shop_name}</div>
              <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>{shopify.shop}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#006847"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm4.78 6.97-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L8.75 11.94l4.97-4.97a.75.75 0 0 1 1.06 1.06Z"/></svg>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/products')}
              style={{ padding: '8px 18px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}
            >
              Push products to Shopify
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              style={{ padding: '8px 18px', background: P.surface, color: '#d82c0d', border: '1px solid rgba(216,44,13,0.3)', borderRadius: 8, cursor: disconnecting ? 'not-allowed' : 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </button>
          </div>
        </div>
      );
    }

    // Not connected — show simple connect button, no URL input
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: 0, lineHeight: 1.6 }}>
          Connect your Shopify store to push products and sync orders automatically.
          {seller?.store_name && (
            <span style={{ display: 'block', marginTop: 4, fontSize: '0.75rem' }}>
              Store detected: <strong style={{ color: P.text }}>{seller.store_name}</strong>
            </span>
          )}
        </p>
        <button
          onClick={handleConnect}
          disabled={connecting}
          style={{
            padding: '9px 22px', flexShrink: 0,
            background: connecting ? P.bg : '#96bf48',
            color: connecting ? P.textSubdued : '#fff',
            border: connecting ? `1px solid ${P.border}` : 'none',
            borderRadius: 8,
            cursor: connecting ? 'not-allowed' : 'pointer',
            fontSize: P.fontSize, fontWeight: 600, fontFamily: P.font,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {connecting && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9"/>
            </svg>
          )}
          {connecting ? 'Connecting…' : 'Connect Shopify'}
        </button>
      </div>
    );
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
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#006847"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm4.78 6.97-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L8.75 11.94l4.97-4.97a.75.75 0 0 1 1.06 1.06Z"/></svg>
            {successMsg}
            <button onClick={() => setSuccessMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#006847', display: 'flex', padding: 2 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fee8eb', border: '1px solid #ffc9cf', borderRadius: 10, marginBottom: 16, fontSize: P.fontSize, color: '#d82c0d' }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#d82c0d"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1Zm-.75 4.75a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-1.5 0v-4.5ZM10 14.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d82c0d', display: 'flex', padding: 2 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* ── SHOPIFY CARD ── */}
        <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 16 }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/shopify-logo.png" width="44" height="44" alt="Shopify" style={{ borderRadius: 10, flexShrink: 0, objectFit: 'contain' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 650, fontSize: '0.9375rem', color: P.text }}>Shopify</div>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>Push products and sync orders automatically</div>
            </div>
            {shopify && (
              <span style={{ padding: '3px 10px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 8 }}>●</span> Connected
              </span>
            )}
            {oauthReturn === 'failed' && !shopify && shopify !== null && (
              <span style={{ padding: '3px 10px', background: '#fee8eb', color: '#d82c0d', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 8 }}>●</span> Connection failed
              </span>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '20px' }}>
            {renderShopifyBody()}
          </div>
        </div>

        {/* ── COMING SOON ── */}
        {[
          { name: 'WooCommerce', desc: 'Connect your WordPress + WooCommerce store', logo: '/woocommerce-logo.png' },
          { name: 'Etsy',        desc: 'Sell handmade and vintage products',          logo: '/Etsy-Logo.png' },
        ].map((ch, i) => (
          <div key={i} style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '16px 20px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14, opacity: 0.6 }}>
            <img src={ch.logo} width="44" height="44" alt={ch.name} style={{ borderRadius: 10, flexShrink: 0, objectFit: 'contain' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text }}>{ch.name}</div>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>{ch.desc}</div>
            </div>
            <span style={{ padding: '3px 10px', background: P.bg, color: P.textSubdued, borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, border: `1px solid ${P.border}` }}>Coming soon</span>
          </div>
        ))}

      </div>
    </Layout>
  );
}
