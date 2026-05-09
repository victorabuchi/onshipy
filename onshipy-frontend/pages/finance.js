import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', red: '#d82c0d',
  font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem', fontWeight: '450', letterSpacing: '-0.00833em',
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const CardHead = ({ title, subtitle }) => (
  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}` }}>
    <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>{title}</div>
    {subtitle && <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>{subtitle}</div>}
  </div>
);

const PayoutsEmptyState = () => (
  <div style={{ padding: '64px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
    <img src="/empty-state-finance.svg" alt="" style={{ width: 160, height: 'auto' }} />
    <div>
      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text, marginBottom: 6 }}>Keep track of your payouts</div>
      <div style={{ fontSize: P.fontSize, color: P.textSubdued, maxWidth: 340, lineHeight: 1.6 }}>
        This is where you'll see a list of all your payouts and the details of each transaction.
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <button style={{ padding: '7px 16px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font, color: P.text }}>
        Learn more
      </button>
      <button style={{ padding: '7px 16px', background: P.text, border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font, color: '#fff' }}>
        View transactions
      </button>
    </div>
  </div>
);

export default function Finance() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [seller, setSeller] = useState(null);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('overview'); // 'overview' | 'payouts'

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) { try { const parsed = JSON.parse(s); setSeller(parsed); setCurrency(parsed.currency || 'USD'); } catch {} }
    fetchFinance(t);
  }, []);

  useEffect(() => {
    if (router.query.section === 'payouts') setView('payouts');
  }, [router.query]);

  const fetchFinance = async (t) => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      setBalance(data.balance ?? 0);
      setTransactions(data.transactions || []);
    } catch { setBalance(0); setTransactions([]); }
    setLoading(false);
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n ?? 0);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const TX_STATUS = {
    topup:  { label: 'Paid',    bg: '#cdfed4', color: '#006847' },
    debit:  { label: 'Debit',   bg: '#fee8eb', color: P.red },
    refund: { label: 'Refunded', bg: '#e3f1ff', color: '#0070c4' },
  };

  return (
    <Layout title="Finance">
      <style>{`
        .fin-link { color: ${P.green}; cursor: pointer; font-size: ${P.fontSize}; font-weight: 500; background: none; border: none; padding: 0; font-family: ${P.font}; }
        .fin-link:hover { text-decoration: underline; }
        .fin-row:hover { background: #fafafa !important; }
        .fin-tax-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; cursor: pointer; transition: background .1s; }
        .fin-tax-row:hover { background: #fafafa; }
        @media (max-width: 767px) {
          .fin-grid { grid-template-columns: 1fr !important; }
          .fin-wrap { padding: 16px !important; }
        }
      `}</style>

      <div className="fin-wrap" style={{ padding: '20px 24px', maxWidth: 1200 }}>

        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          {view === 'payouts' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <button onClick={() => { setView('overview'); router.replace('/finance', undefined, { shallow: true }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, fontSize: P.fontSize, fontFamily: P.font, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                Finance
              </button>
            </div>
          ) : null}
          <h1 style={{ fontSize: '1.25rem', fontWeight: 650, color: P.text, letterSpacing: '-0.03em', margin: 0 }}>
            {view === 'payouts' ? 'Payouts' : 'Finance'}
          </h1>
        </div>

        {/* ── PAYOUTS VIEW ── */}
        {view === 'payouts' && (
          <>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 4 }}>Payout balance</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 650, color: P.text, letterSpacing: '-0.04em', marginBottom: 2 }}>{loading ? '—' : fmt(balance)}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{currency}</div>
              </div>
            </Card>

            <Card>
              <CardHead title="Payout history" />
              {loading ? (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>Loading…</div>
              ) : transactions.length === 0 ? (
                <PayoutsEmptyState />
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px', background: P.bg, borderBottom: `1px solid ${P.border}` }}>
                    {['Date', 'Description', 'Amount', 'Status'].map(h => (
                      <div key={h} style={{ padding: '8px 16px', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                    ))}
                  </div>
                  {transactions.map((tx, i) => {
                    const st = TX_STATUS[tx.type] || TX_STATUS.topup;
                    return (
                      <div key={i} className="fin-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px', borderBottom: i < transactions.length - 1 ? `1px solid ${P.border}` : 'none', background: P.surface }}>
                        <div style={{ padding: '12px 16px', fontSize: P.fontSize, color: P.textSubdued }}>{formatDate(tx.created_at)}</div>
                        <div style={{ padding: '12px 16px', fontSize: P.fontSize, color: P.text, fontWeight: 500 }}>{tx.description || 'Transaction'}</div>
                        <div style={{ padding: '12px 16px', fontSize: P.fontSize, color: tx.type === 'debit' ? P.red : P.green, fontWeight: 600 }}>{tx.type === 'debit' ? '-' : '+'}{fmt(Math.abs(tx.amount))}</div>
                        <div style={{ padding: '12px 16px' }}>
                          <span style={{ background: st.bg, color: st.color, borderRadius: 20, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{st.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </Card>
          </>
        )}

        {/* ── FINANCE OVERVIEW ── */}
        {view === 'overview' && (
          <div className="fin-grid" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>

            {/* Left — Taxes */}
            <Card>
              <CardHead title="Taxes" />
              <div className="fin-tax-row" style={{ borderBottom: `1px solid ${P.border}` }} onClick={() => {}}>
                <div>
                  <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>Collecting in 1 region</div>
                </div>
                <svg width="16" height="16" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div className="fin-tax-row" onClick={() => {}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" stroke={P.textSubdued} strokeWidth="1.75" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>Automated filing</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>Inactive</div>
                  </div>
                </div>
                <svg width="16" height="16" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </Card>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Payout balance */}
              <Card>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 6 }}>Payout balance</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 650, color: P.text, letterSpacing: '-0.04em' }}>{loading ? '—' : fmt(balance)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: '6px 10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: P.text }}>{currency}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 16 }}>{fmt(balance)}</div>
                  <button className="fin-link" onClick={() => { setView('payouts'); router.replace('/finance?section=payouts', undefined, { shallow: true }); }}>
                    View payouts
                  </button>
                </div>
              </Card>

              {/* Payments provider status */}
              <Card>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: '#e6f5ef', border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <rect x="2" y="7" width="24" height="16" rx="3" fill={P.green} opacity="0.15"/>
                      <rect x="2" y="11" width="24" height="4" fill={P.green} opacity="0.3"/>
                      <rect x="5" y="16" width="8" height="3" rx="1.5" fill={P.green} opacity="0.6"/>
                      <polyline points="18 15 20.5 17.5 24 13" stroke={P.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: P.fontSize, fontWeight: 600, color: P.text, marginBottom: 3 }}>Onshipy Payments activated</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>Customers can now pay at checkout</div>
                  </div>
                </div>
              </Card>

              {/* Documents shortcut */}
              <Card>
                <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 2 }}>Financial documents</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>Download invoices and summaries</div>
                  </div>
                  <button style={{ padding: '6px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font, color: P.text, display: 'flex', alignItems: 'center', gap: 5 }}>
                    Documents
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>
              </Card>

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
