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

const Sparkline = ({ color = '#2fb3eb', up = false }) => (
  <svg width="64" height="20" viewBox="0 0 64 20">
    <polyline points={up ? "0,16 12,12 24,8 36,10 48,4 64,2" : "0,14 16,14 28,14 40,14 56,14 64,14"}
      fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
  </svg>
);

const STATUS_COLORS = {
  pending:    { bg: '#fff8db', color: '#7c5a00' },
  processing: { bg: '#eaf4ff', color: '#1d4ed8' },
  shipped:    { bg: '#f0f2ff', color: '#4338ca' },
  delivered:  { bg: '#cdfed4', color: '#006847' },
  cancelled:  { bg: '#fee8eb', color: '#d82c0d' },
  failed:     { bg: '#fee8eb', color: '#d82c0d' },
};

const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: P.bg, color: P.textSubdued };
  return (
    <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
};

const TABS = [
  { id: 'all',       label: 'All' },
  { id: 'unfulfilled', label: 'Unfulfilled' },
  { id: 'drafts',    label: 'Drafts' },
  { id: 'abandoned', label: 'Abandoned checkouts' },
];

export default function Orders() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [showAnalytics, setShowAnalytics] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(data => { if (data.orders) setOrders(data.orders); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortArrow = ({ col }) => sortBy !== col ? null : (
    <svg width="10" height="10" viewBox="0 0 10 10" fill={P.textSubdued} style={{ marginLeft: 3 }}>
      {sortDir === 'asc' ? <path d="M5 2L8 7H2Z"/> : <path d="M5 8L2 3H8Z"/>}
    </svg>
  );

  // Filter
  const tabFiltered = orders.filter(o => {
    if (tab === 'unfulfilled') return ['pending','processing'].includes(o.status);
    if (tab === 'drafts') return o.status === 'draft';
    if (tab === 'abandoned') return o.status === 'abandoned';
    return true;
  });

  const searched = search
    ? tabFiltered.filter(o =>
        (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.customer_email || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.storefront_order_id || o.id || '').toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered;

  const sorted = [...searched].sort((a, b) => {
    let av, bv;
    if (sortBy === 'date') { av = new Date(a.created_at); bv = new Date(b.created_at); }
    else if (sortBy === 'amount') { av = parseFloat(a.amount_paid || 0); bv = parseFloat(b.amount_paid || 0); }
    else if (sortBy === 'customer') { av = a.customer_name || ''; bv = b.customer_name || ''; return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); }
    else return 0;
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  // KPI stats
  const today = new Date(); today.setHours(0,0,0,0);
  const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.amount_paid || 0), 0);
  const fulfilled = orders.filter(o => o.status === 'delivered').length;
  const returned = orders.filter(o => o.status === 'cancelled').length;
  const avgOrderVal = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00';

  const kpis = [
    { label: 'Orders', value: orders.length, sub: `${todayOrders.length} today`, spark: true },
    { label: 'Items ordered', value: orders.reduce((s, o) => s + (o.quantity || 1), 0), sub: '—', spark: true },
    { label: 'Returns', value: `€${returned > 0 ? (returned * 50).toFixed(2) : '0'}`, sub: '—', spark: false },
    { label: 'Orders fulfilled', value: fulfilled, sub: '—', spark: true },
    { label: 'Orders delivered', value: fulfilled, sub: '—', spark: true },
    { label: 'Avg order value', value: `$${avgOrderVal}`, sub: '—', spark: true },
  ];

  const th = {
    padding: '8px 14px', fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued,
    textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left',
    borderBottom: `1px solid ${P.border}`, background: '#fafafa',
    cursor: 'pointer', userSelect: 'none', fontFamily: P.font,
  };
  const td = {
    padding: '11px 14px', fontSize: P.fontSize, borderBottom: `1px solid ${P.border}`,
    verticalAlign: 'middle', color: P.text, letterSpacing: P.letterSpacing,
  };

  return (
    <Layout title="Orders">
      <style>{`
        .ord-row:hover { background: #fafafa !important; }
        .ord-tab { padding: 7px 14px; background: none; border: none; border-bottom: 2px solid transparent; font-size: ${P.fontSize}; color: ${P.textSubdued}; cursor: pointer; font-family: ${P.font}; letter-spacing: ${P.letterSpacing}; font-weight: ${P.fontWeight}; white-space: nowrap; }
        .ord-tab.active { color: ${P.text}; font-weight: 600; border-bottom-color: ${P.text}; }
        .ord-tab:hover { color: ${P.text}; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ fontFamily: P.font, fontSize: P.fontSize, letterSpacing: P.letterSpacing, color: P.text, display: 'flex', height: 'calc(100vh - 56px)' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: P.bg, minWidth: 0 }}>

          {/* ── Page header ── */}
          <div style={{ background: P.surface, borderBottom: `1px solid ${P.border}` }}>

            {/* Analytics bar — Shopify style horizontal KPI strip */}
            {showAnalytics && (
              <div style={{ borderBottom: `1px solid ${P.border}`, overflowX: 'auto', scrollbarWidth: 'none' }}>
                <div style={{ display: 'flex', minWidth: 'max-content' }}>
                  {/* Date pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRight: `1px solid ${P.border}`, flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 20 20" fill={P.textSubdued}><path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4H16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V2.75A.75.75 0 0 1 5.75 2ZM3.5 8v8a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V8h-13Z"/></svg>
                    <span style={{ fontSize: P.fontSize, color: P.text, fontWeight: 500 }}>Today</span>
                  </div>
                  {kpis.map((kpi, i) => (
                    <div key={i} style={{ padding: '10px 20px', borderRight: `1px solid ${P.border}`, flexShrink: 0, minWidth: 130 }}>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginBottom: 3 }}>{kpi.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 650, color: P.text, letterSpacing: '-0.02em' }}>{kpi.value}</span>
                        <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>{kpi.sub}</span>
                      </div>
                      <Sparkline color="#2fb3eb" up={kpi.spark && kpi.value > 0} />
                    </div>
                  ))}
                  {/* Hide analytics bar */}
                  <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                    <button onClick={() => setShowAnalytics(false)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: P.fontSize, color: P.textSubdued, fontFamily: P.font, padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      Hide analytics bar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Title + actions */}
            <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill={P.textSubdued}>
                  <path d="M7.5 3.5a.75.75 0 0 0-1.5 0v.75H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1H14V3.5a.75.75 0 0 0-1.5 0v.75h-5V3.5Z"/>
                </svg>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: 0, letterSpacing: '-0.02em' }}>Orders</h1>
                {!showAnalytics && (
                  <button onClick={() => setShowAnalytics(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: P.fontSize, color: P.textSubdued, fontFamily: P.font, padding: '3px 8px', borderRadius: 6 }}>
                    Show analytics
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, cursor: 'pointer', fontFamily: P.font, color: P.text }}>
                  More actions
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button onClick={() => router.push('/products')} style={{ padding: '6px 14px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>
                  Create order
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '0 20px', gap: 0, marginBottom: -1, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {TABS.map(t => (
                <button key={t.id} className={`ord-tab${tab === t.id ? ' active' : ''}`}
                  onClick={() => { setTab(t.id); setSelected(null); }}>
                  {t.label}
                  {t.id === 'all' && (
                    <span style={{ marginLeft: 5, fontSize: '0.625rem', background: P.bg, color: P.textSubdued, padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
                      {orders.length}
                    </span>
                  )}
                  {t.id === 'unfulfilled' && (
                    <span style={{ marginLeft: 5, fontSize: '0.625rem', background: '#fff8db', color: '#7c5a00', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
                      {orders.filter(o => ['pending','processing'].includes(o.status)).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '16px 20px 60px' }}>

            {/* Drafts tab */}
            {tab === 'drafts' && (
              <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '80px 40px', textAlign: 'center', animation: 'fadeIn .3s ease' }}>
                <div style={{ width: 80, height: 80, margin: '0 auto 16px', background: 'linear-gradient(135deg, #00b894, #008060)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="36" height="36" viewBox="0 0 20 20" fill="white"><path d="M7.5 3.5a.75.75 0 0 0-1.5 0v.75H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1H14V3.5a.75.75 0 0 0-1.5 0v.75h-5V3.5ZM5 8.5h10v9H5v-9Zm5 2a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5H10.75V16.5a.75.75 0 0 1-1.5 0v-1.75H7.5a.75.75 0 0 1 0-1.5h1.75V11.25A.75.75 0 0 1 10 10.5Z"/></svg>
                </div>
                <div style={{ fontWeight: 650, fontSize: '1rem', color: P.text, marginBottom: 6 }}>Manually create orders and invoices</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
                  Use draft orders to take orders over the phone, email invoices to customers, and collect payments.
                </div>
                <button style={{ padding: '8px 20px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>
                  Create draft order
                </button>
                <div style={{ marginTop: 16, fontSize: P.fontSize }}>
                  <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>Learn more about creating draft orders</span>
                </div>
              </div>
            )}

            {/* Abandoned checkouts tab */}
            {tab === 'abandoned' && (
              <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '48px 40px', animation: 'fadeIn .3s ease' }}>
                <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ fontWeight: 650, fontSize: '1rem', color: P.text, marginBottom: 8 }}>Abandoned checkouts will show here</div>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued, lineHeight: 1.6, marginBottom: 20 }}>
                      See when customers put an item in their cart but don't check out. You can also email customers a link to their cart.
                    </div>
                    <div style={{ background: P.bg, borderRadius: 10, border: `1px solid ${P.border}`, padding: '14px 16px', marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, marginBottom: 4 }}>Recover sales with abandoned checkout email</div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued, lineHeight: 1.6 }}>
                        An automated email is already created for you. Review the email and make any adjustments.
                      </div>
                      <button style={{ marginTop: 10, padding: '6px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, cursor: 'pointer', fontFamily: P.font, color: P.text }}>
                        Review email
                      </button>
                    </div>
                    <div style={{ fontSize: P.fontSize }}>
                      <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>Learn more about abandoned checkouts</span>
                    </div>
                  </div>
                  <div style={{ width: 120, height: 120, flexShrink: 0, background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, background: '#d82c0d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All / Unfulfilled tabs */}
            {(tab === 'all' || tab === 'unfulfilled') && (
              <>
                {/* Search bar */}
                <div style={{ position: 'relative', marginBottom: 12, maxWidth: 360 }}>
                  <svg width="14" height="14" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search orders..."
                    style={{ width: '100%', padding: '7px 12px 7px 32px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, letterSpacing: P.letterSpacing, color: P.text, background: P.surface, boxSizing: 'border-box' }}/>
                </div>

                {/* Empty state */}
                {!loading && orders.length === 0 && (
                  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '80px 40px', textAlign: 'center', animation: 'fadeIn .3s ease' }}>
                    <div style={{ width: 80, height: 80, margin: '0 auto 16px', background: 'linear-gradient(135deg, #00b894, #008060)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="36" height="36" viewBox="0 0 20 20" fill="white"><path d="M7.5 3.5a.75.75 0 0 0-1.5 0v.75H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1H14V3.5a.75.75 0 0 0-1.5 0v.75h-5V3.5Z"/></svg>
                    </div>
                    <div style={{ fontWeight: 650, fontSize: '1rem', color: P.text, marginBottom: 6 }}>Your orders will show here</div>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 20 }}>
                      This is where you'll fulfill orders, collect payments, and track order progress.
                    </div>
                    <button onClick={() => router.push('/products')} style={{ padding: '8px 20px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>
                      Create order
                    </button>
                    <div style={{ marginTop: 14, fontSize: P.fontSize }}>
                      <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>Learn more about orders</span>
                    </div>
                  </div>
                )}

                {/* Orders table */}
                {(loading || sorted.length > 0) && (
                  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
                    {loading ? (
                      <div style={{ padding: '60px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>Loading orders...</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ ...th, width: 40, paddingRight: 0 }}>
                              <input type="checkbox" style={{ accentColor: P.green }}/>
                            </th>
                            {[
                              { label: 'Order', col: null },
                              { label: 'Date', col: 'date' },
                              { label: 'Customer', col: 'customer' },
                              { label: 'Channel', col: null },
                              { label: 'Total', col: 'amount' },
                              { label: 'Payment', col: null },
                              { label: 'Fulfillment', col: null },
                              { label: 'Items', col: null },
                            ].map(({ label, col }) => (
                              <th key={label} style={th} onClick={() => col && toggleSort(col)}>
                                {label}<SortArrow col={col}/>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sorted.map(o => (
                            <tr key={o.id} className="ord-row"
                              onClick={() => setSelected(selected?.id === o.id ? null : o)}
                              style={{ cursor: 'pointer', background: selected?.id === o.id ? '#f0fdf6' : P.surface }}>
                              <td style={{ ...td, width: 40, paddingRight: 0 }} onClick={e => e.stopPropagation()}>
                                <input type="checkbox" style={{ accentColor: P.green }}/>
                              </td>
                              <td style={td}>
                                <span style={{ fontWeight: 500, color: '#2b6cb0' }}>
                                  #{o.storefront_order_id || o.id.slice(0, 8).toUpperCase()}
                                </span>
                              </td>
                              <td style={{ ...td, color: P.textSubdued }}>
                                {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td style={td}>
                                <div style={{ fontWeight: 500 }}>{o.customer_name || '—'}</div>
                                {o.customer_email && <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{o.customer_email}</div>}
                              </td>
                              <td style={{ ...td, color: P.textSubdued, fontSize: '0.75rem' }}>
                                {o.source_channel || 'Online Store'}
                              </td>
                              <td style={{ ...td, fontWeight: 600 }}>
                                ${parseFloat(o.amount_paid || 0).toFixed(2)}
                              </td>
                              <td style={td}>
                                <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Paid</span>
                              </td>
                              <td style={td}><Badge status={o.status}/></td>
                              <td style={{ ...td, color: P.textSubdued }}>{o.quantity || 1}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {!loading && sorted.length === 0 && orders.length > 0 && (
                  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text, marginBottom: 4 }}>No orders match your filter</div>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>Try a different search or tab</div>
                  </div>
                )}
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: P.fontSize, color: P.textSubdued }}>
              <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>Learn more about orders</span>
            </div>
          </div>
        </div>

        {/* ── Order detail panel ── */}
        {selected && (
          <div style={{ width: 320, flexShrink: 0, background: P.surface, borderLeft: `1px solid ${P.border}`, overflowY: 'auto', animation: 'fadeIn .2s ease' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: P.surface, zIndex: 10 }}>
              <span style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>
                Order #{selected.storefront_order_id || selected.id.slice(0, 8).toUpperCase()}
              </span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: P.textSubdued, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '16px' }}>
              {/* Status */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Badge status={selected.status}/>
                <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Paid</span>
              </div>

              {/* Customer */}
              <div style={{ background: P.bg, borderRadius: 8, border: `1px solid ${P.border}`, padding: '12px', marginBottom: 12 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Customer</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: P.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>
                    {selected.customer_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: P.fontSize }}>{selected.customer_name || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{selected.customer_email}</div>
                  </div>
                </div>
                {selected.shipping_address && (
                  <div style={{ fontSize: '0.75rem', color: P.textSubdued, lineHeight: 1.6 }}>{selected.shipping_address}</div>
                )}
              </div>

              {/* Order summary */}
              <div style={{ background: P.bg, borderRadius: 8, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ padding: '10px 12px', borderBottom: `1px solid ${P.border}` }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order summary</div>
                </div>
                {[
                  { label: 'Order date', value: new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  { label: 'Items', value: selected.quantity || 1 },
                  { label: 'Subtotal', value: `$${parseFloat(selected.amount_paid || 0).toFixed(2)}` },
                  { label: 'Shipping', value: '$0.00' },
                  { label: 'Total', value: `$${parseFloat(selected.amount_paid || 0).toFixed(2)}`, bold: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: i < 4 ? `1px solid ${P.border}` : 'none', background: i === 4 ? '#f0fdf6' : 'transparent' }}>
                    <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>{r.label}</span>
                    <span style={{ fontSize: P.fontSize, fontWeight: r.bold ? 650 : 500, color: r.bold ? P.green : P.text }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.status === 'pending' && (
                  <button style={{ padding: '8px', background: P.green, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>
                    Fulfill order
                  </button>
                )}
                <button style={{ padding: '8px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, cursor: 'pointer', fontFamily: P.font, color: P.text }}>
                  View full order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}