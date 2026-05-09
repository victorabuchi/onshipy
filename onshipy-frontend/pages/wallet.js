import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', red: '#d82c0d',
  font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem',
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const WalletIllustration = () => (
  <svg width="160" height="128" viewBox="0 0 160 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Back card */}
    <rect x="16" y="38" width="100" height="64" rx="8" fill="#e9e9e9"/>
    {/* Mid card */}
    <rect x="24" y="28" width="100" height="64" rx="8" fill="#f5f5f5"/>
    {/* Front card */}
    <rect x="32" y="18" width="100" height="64" rx="8" fill="white" stroke="#e0e0e0" strokeWidth="1.5"/>
    {/* Card colour band */}
    <rect x="32" y="18" width="100" height="22" rx="8" fill="#008060" opacity="0.15"/>
    <rect x="32" y="30" width="100" height="10" fill="#008060" opacity="0.08"/>
    {/* Chip */}
    <rect x="46" y="46" width="18" height="14" rx="3" fill="#f0c040" opacity="0.85"/>
    <line x1="46" y1="53" x2="64" y2="53" stroke="#d4a800" strokeWidth="1" opacity="0.6"/>
    <line x1="55" y1="46" x2="55" y2="60" stroke="#d4a800" strokeWidth="1" opacity="0.6"/>
    {/* Card number dots */}
    <circle cx="78" cy="54" r="2.5" fill="#e9e9e9"/>
    <circle cx="86" cy="54" r="2.5" fill="#e9e9e9"/>
    <circle cx="94" cy="54" r="2.5" fill="#e9e9e9"/>
    <circle cx="102" cy="54" r="2.5" fill="#e9e9e9"/>
    {/* Balance line */}
    <rect x="46" y="68" width="38" height="4" rx="2" fill="#e9e9e9"/>
    {/* Green balance pill */}
    <rect x="90" y="66" width="28" height="8" rx="4" fill="#cdfed4"/>
    <rect x="93" y="68" width="14" height="4" rx="2" fill="#006847" opacity="0.5"/>
  </svg>
);

const TX_ICONS = {
  topup:    { bg: '#cdfed4', color: '#006847', symbol: '+' },
  debit:    { bg: '#fee8eb', color: '#d82c0d', symbol: '−' },
  refund:   { bg: '#e3f1ff', color: '#0070c4', symbol: '↩' },
};

export default function Wallet() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [seller, setSeller] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupModal, setTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [autoThreshold, setAutoThreshold] = useState('10');
  const [autoAmount, setAutoAmount] = useState('50');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) { try { setSeller(JSON.parse(s)); } catch {} }
    fetchWallet(t);
  }, []);

  const fetchWallet = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = await res.json();
      setBalance(data.balance ?? 0);
      setTransactions(data.transactions || []);
      setAutoRecharge(data.auto_recharge || false);
      setAutoThreshold(data.auto_threshold?.toString() || '10');
      setAutoAmount(data.auto_amount?.toString() || '50');
    } catch {
      setBalance(0);
      setTransactions([]);
    }
    setLoading(false);
  };

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 5) { showToast('Minimum top-up is $5', true); return; }
    setTopupLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wallet/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Stripe checkout
      } else if (data.error) {
        showToast(data.error, true);
      }
    } catch { showToast('Connection error', true); }
    setTopupLoading(false);
  };

  const handleAutoRecharge = async () => {
    try {
      await fetch(`${API_BASE}/api/wallet/auto-recharge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ enabled: !autoRecharge, threshold: parseFloat(autoThreshold), amount: parseFloat(autoAmount) })
      });
      setAutoRecharge(!autoRecharge);
      showToast(autoRecharge ? 'Auto-recharge disabled' : 'Auto-recharge enabled');
    } catch { showToast('Failed to update', true); }
  };

  const QUICK_AMOUNTS = [10, 25, 50, 100, 200];

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Sample transactions for display when empty
  const displayTx = transactions.length > 0 ? transactions : [];

  return (
    <Layout title="Wallet">
      <style>{`
        @media (max-width: 767px) {
          .wallet-wrap { padding-left: 16px !important; padding-right: 16px !important; }
          .wallet-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {toast && (
        <div style={{ position: 'fixed', top: 68, right: 16, background: toast.err ? P.red : P.text, color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontFamily: P.font }}>
          {toast.err ? '' : '✓ '}{toast.msg}
        </div>
      )}

      <div className="wallet-wrap" style={{ fontFamily: P.font, fontSize: P.fontSize, color: P.text, padding: '24px 28px 80px', maxWidth: 900 }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Wallet</h1>
          <p style={{ color: P.textSubdued, margin: 0 }}>Add funds to automatically pay for orders when customers buy from your store.</p>
        </div>

        {/* Balance + Top up */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Balance card */}
          <Card>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 8, fontWeight: 500 }}>Available balance</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 750, color: P.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {loading ? '—' : `$${Number(balance).toFixed(2)}`}
              </div>
              <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 6 }}>USD · Used for auto-buy fulfillment</div>
              <button
                onClick={() => setTopupModal(true)}
                style={{ marginTop: 16, padding: '8px 20px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 600, fontFamily: P.font }}
              >
                Add funds
              </button>
            </div>
          </Card>

          {/* How it works */}
          <Card>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 14 }}>How it works</div>
              {[
                { icon: '1', text: 'Add funds to your wallet' },
                { icon: '2', text: 'Customer places an order in your store' },
                { icon: '3', text: 'Onshipy deducts cost + shipping from wallet' },
                { icon: '4', text: 'Order is automatically placed with supplier' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 10 : 0, alignItems: 'flex-start' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#cdfed4', color: '#006847', fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{step.icon}</div>
                  <div style={{ fontSize: P.fontSize, color: P.textSubdued, lineHeight: 1.5 }}>{step.text}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Auto-recharge */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: autoRecharge ? `1px solid ${P.border}` : 'none' }}>
            <div>
              <div style={{ fontWeight: 600, color: P.text, marginBottom: 2 }}>Auto-recharge</div>
              <div style={{ color: P.textSubdued }}>Automatically add funds when balance drops below a threshold</div>
            </div>
            <div
              onClick={handleAutoRecharge}
              style={{ width: 40, height: 22, background: autoRecharge ? P.green : P.border, borderRadius: 11, cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', top: 3, left: autoRecharge ? 21 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
            </div>
          </div>
          {autoRecharge && (
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 6 }}>Recharge when balance falls below</label>
                <div style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '8px 12px', background: P.bg, color: P.textSubdued, borderRight: `1px solid ${P.border}` }}>$</span>
                  <input type="number" value={autoThreshold} onChange={e => setAutoThreshold(e.target.value)} min="5"
                    style={{ flex: 1, padding: '8px 12px', border: 'none', outline: 'none', fontSize: P.fontSize, fontFamily: P.font }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 6 }}>Recharge amount</label>
                <div style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '8px 12px', background: P.bg, color: P.textSubdued, borderRight: `1px solid ${P.border}` }}>$</span>
                  <input type="number" value={autoAmount} onChange={e => setAutoAmount(e.target.value)} min="10"
                    style={{ flex: 1, padding: '8px 12px', border: 'none', outline: 'none', fontSize: P.fontSize, fontFamily: P.font }} />
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => showToast('Auto-recharge settings saved')}
                  style={{ padding: '7px 18px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>
                  Save settings
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Transaction history */}
        <Card>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, color: P.text }}>Transaction history</div>
            {displayTx.length > 0 && (
              <button style={{ background: 'none', border: 'none', color: P.green, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>
                Download CSV
              </button>
            )}
          </div>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: P.textSubdued }}>Loading...</div>
          ) : displayTx.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 40px' }}>
              <div style={{ display: 'inline-flex', marginBottom: 20 }}>
                <WalletIllustration />
              </div>
              <div style={{ fontWeight: 650, fontSize: '1rem', color: P.text, marginBottom: 6 }}>No transactions yet</div>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 }}>
                Add funds to start fulfilling orders automatically
              </div>
              <button onClick={() => setTopupModal(true)}
                style={{ padding: '8px 20px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>
                Add funds
              </button>
            </div>
          ) : (
            <div>
              {displayTx.map((tx, i) => {
                const style = TX_ICONS[tx.type] || TX_ICONS.topup;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: i < displayTx.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                      {style.symbol}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: P.text }}>{tx.description || 'Transaction'}</div>
                      <div style={{ color: P.textSubdued, fontSize: '0.75rem', marginTop: 2 }}>
                        {formatDate(tx.created_at)} · {formatTime(tx.created_at)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 650, color: tx.type === 'debit' ? P.red : P.green, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
                      {tx.type === 'debit' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued, minWidth: 60, textAlign: 'right' }}>
                      ${Number(tx.balance_after || 0).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* TOP UP MODAL */}
      {topupModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: P.font }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 650, color: P.text, margin: 0 }}>Add funds</h2>
              <button onClick={() => setTopupModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, padding: 4, display: 'flex' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Current balance */}
            <div style={{ background: P.bg, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: P.textSubdued }}>Current balance</span>
              <span style={{ fontWeight: 650, color: P.text }}>${Number(balance).toFixed(2)}</span>
            </div>

            {/* Quick amounts */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 10 }}>Select amount</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {QUICK_AMOUNTS.map(amt => (
                  <button key={amt} onClick={() => setTopupAmount(String(amt))}
                    style={{ padding: '7px 16px', background: topupAmount === String(amt) ? P.text : P.surface, color: topupAmount === String(amt) ? '#fff' : P.text, border: `1px solid ${topupAmount === String(amt) ? P.text : P.border}`, borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>
                    ${amt}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '9px 12px', background: P.bg, color: P.textSubdued, borderRight: `1px solid ${P.border}` }}>$</span>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  min="5"
                  style={{ flex: 1, padding: '9px 12px', border: 'none', outline: 'none', fontSize: P.fontSize, fontFamily: P.font, color: P.text }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 6 }}>Minimum top-up: $5 · Paid securely via Stripe</div>
            </div>

            {/* New balance preview */}
            {topupAmount && parseFloat(topupAmount) > 0 && (
              <div style={{ background: '#cdfed4', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: P.fontSize }}>
                <span style={{ color: '#006847' }}>New balance after top-up</span>
                <span style={{ fontWeight: 650, color: '#006847' }}>${(Number(balance) + parseFloat(topupAmount || 0)).toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setTopupModal(false)}
                style={{ padding: '9px 20px', background: '#fff', border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontFamily: P.font, color: P.text }}>
                Cancel
              </button>
              <button onClick={handleTopup} disabled={topupLoading || !topupAmount || parseFloat(topupAmount) < 5}
                style={{ padding: '9px 20px', background: topupLoading || !topupAmount || parseFloat(topupAmount) < 5 ? P.bg : P.text, color: topupLoading || !topupAmount || parseFloat(topupAmount) < 5 ? P.textSubdued : '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 600, fontFamily: P.font }}>
                {topupLoading ? 'Redirecting...' : `Add $${topupAmount || '0'} via Stripe`}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}