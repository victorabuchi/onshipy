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
  const [shopInput, setShopInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;

    // Check for redirect params from OAuth callback
    const { shopify: sh, error: err, shop } = router.query;
    if (sh === 'connected') {
      setSuccessMsg(`✓ ${shop || 'Shopify'} connected successfully!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
    if (err) {
      const msgs = {
        missing_params: 'Connection failed — missing parameters.',
        invalid_state: 'Connection failed — security check failed. Please try again.',
        invalid_hmac: 'Connection failed — invalid Shopify signature.',
        token_exchange_failed: 'Connection failed — could not get access token.',
        server_error: 'Server error. Please try again.'
      };
      setError(msgs[err] || 'Connection failed. Please try again.');
    }

    fetchStatus(t);
  }, [router.query]);

  const fetchStatus = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/status`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = await res.json();
      setShopify(data.connected ? data : false);
    } catch {
      setShopify(false);
    }
  };

  const handleConnect = async () => {
    if (!shopInput.trim()) { setError('Enter your Shopify store URL'); return; }
    setError('');
    setConnecting(true);
    try {
      const res = await fetch(`${API_BASE}/api/stores/shopify/install?shop=${encodeURIComponent(shopInput.trim())}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to Shopify
      } else {
        setError(data.error || 'Failed to start connection');
        setConnecting(false);
      }
    } catch {
      setError('Connection error. Please try again.');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your Shopify store?')) return;
    setDisconnecting(true);
    try {
      await fetch(`${API_BASE}/api/stores/shopify`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      setShopify(false);
    } catch {
      setError('Failed to disconnect');
    }
    setDisconnecting(false);
  };

  return (
    <Layout title="Online Store">
      <div style={{ fontFamily: P.font, fontSize: P.fontSize, color: P.text, maxWidth: 760, margin: '0 auto', padding: '24px 20px 80px' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Sales channels</h1>
          <p style={{ fontSize: P.fontSize, color: P.textSubdued, margin: 0 }}>Connect your stores to automatically push products and fulfill orders.</p>
        </div>

        {successMsg && (
          <div style={{ padding: '12px 16px', background: '#cdfed4', border: '1px solid #92fcac', borderRadius: 10, marginBottom: 16, fontSize: P.fontSize, color: '#006847', fontWeight: 500 }}>
            {successMsg}
          </div>
        )}
        {error && (
          <div style={{ padding: '12px 16px', background: '#fee8eb', border: '1px solid #ffc9cf', borderRadius: 10, marginBottom: 16, fontSize: P.fontSize, color: '#d82c0d' }}>
            {error}
            <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#d82c0d', fontSize: 16, lineHeight: 1 }}>×</button>
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
              <span style={{ padding: '3px 10px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600 }}>● Connected</span>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '20px' }}>
            {shopify === null ? (
              // Loading
              <div style={{ color: P.textSubdued, fontSize: P.fontSize }}>Checking connection...</div>

            ) : shopify ? (
              // Connected state
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
                    style={{ padding: '8px 18px', background: P.surface, color: '#d82c0d', border: '1px solid rgba(216,44,13,0.3)', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}
                  >
                    {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              </div>

            ) : (
              // Not connected state
              <div>
                <p style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 16, lineHeight: 1.6 }}>
                  Enter your Shopify store URL to connect. You'll be redirected to Shopify to approve the connection.
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 6 }}>
                      Shopify store URL
                    </label>
                    <div style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden', background: P.surface }}>
                      <input
                        type="text"
                        value={shopInput}
                        onChange={e => setShopInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !connecting && handleConnect()}
                        placeholder="yourstore"
                        style={{ flex: 1, padding: '9px 12px', border: 'none', outline: 'none', fontSize: P.fontSize, fontFamily: P.font, color: P.text, background: 'transparent' }}
                      />
                      <span style={{ padding: '9px 12px', background: P.bg, color: P.textSubdued, fontSize: P.fontSize, borderLeft: `1px solid ${P.border}`, whiteSpace: 'nowrap' }}>
                        .myshopify.com
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleConnect}
                    disabled={connecting || !shopInput.trim()}
                    style={{ padding: '9px 20px', background: connecting || !shopInput.trim() ? P.bg : '#96bf48', color: connecting || !shopInput.trim() ? P.textSubdued : '#fff', border: 'none', borderRadius: 8, cursor: connecting || !shopInput.trim() ? 'not-allowed' : 'pointer', fontSize: P.fontSize, fontWeight: 600, fontFamily: P.font, whiteSpace: 'nowrap' }}
                  >
                    {connecting ? 'Redirecting to Shopify...' : 'Connect Shopify'}
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 10 }}>
                  You'll be asked to approve permissions on Shopify — read/write products and orders.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── COMING SOON ── */}
        {[
          { name: 'WooCommerce', desc: 'Connect your WordPress + WooCommerce store', logo: '/woocommerce-logo.png' },
          { name: 'Etsy', desc: 'Sell handmade and vintage products', logo: '/Etsy-Logo.png' },
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