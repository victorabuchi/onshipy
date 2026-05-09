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

const Sparkline = ({ flat = true }) => (
  <svg width="72" height="18" viewBox="0 0 72 18" style={{ display: 'block', marginTop: 4 }}>
    {flat
      ? <line x1="0" y1="12" x2="72" y2="12" stroke="#2fb3eb" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.55"/>
      : <polyline points="0,14 14,10 28,8 42,11 56,5 72,3" fill="none" stroke="#2fb3eb" strokeWidth="1.5" opacity="0.7"/>}
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
  { id: 'all',         label: 'All' },
  { id: 'unfulfilled', label: 'Unfulfilled' },
  { id: 'drafts',      label: 'Drafts' },
  { id: 'abandoned',   label: 'Abandoned checkouts' },
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
  const [showActionsMenu, setShowActionsMenu] = useState(false);

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

  const tabFiltered = orders.filter(o => {
    if (tab === 'unfulfilled') return ['pending', 'processing'].includes(o.status);
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

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
  const fulfilled = orders.filter(o => o.status === 'delivered').length;
  const returned = orders.filter(o => o.status === 'cancelled').length;

  const kpis = [
    { label: 'Orders',                   value: orders.length || 0,   sub: orders.length === 0 ? '—' : `${todayOrders.length} today` },
    { label: 'Items ordered',            value: orders.reduce((s, o) => s + (o.quantity || 1), 0) || 0, sub: '—' },
    { label: 'Returns',                  value: `€${returned > 0 ? (returned * 50).toFixed(0) : '0'}`, sub: '—' },
    { label: 'Orders fulfilled',         value: fulfilled || 0,        sub: '—' },
    { label: 'Orders delivered',         value: fulfilled || 0,        sub: '—' },
    { label: 'Order to fulfillment time', value: '0',                  sub: '—' },
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
        .ord-tab {
          padding: 9px 14px; background: none; border: none;
          border-bottom: 2.5px solid transparent;
          font-size: ${P.fontSize}; color: ${P.textSubdued};
          cursor: pointer; font-family: ${P.font};
          letter-spacing: ${P.letterSpacing}; font-weight: ${P.fontWeight};
          white-space: nowrap; transition: color .1s;
        }
        .ord-tab.active { color: ${P.text}; font-weight: 600; border-bottom-color: ${P.text}; }
        .ord-tab:hover:not(.active) { color: ${P.text}; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 767px) {
          .ord-detail { position: fixed !important; inset: 0 !important; width: 100% !important; z-index: 200 !important; overflow-y: auto !important; }
        }
      `}</style>

      <div style={{ fontFamily: P.font, fontSize: P.fontSize, letterSpacing: P.letterSpacing, color: P.text, background: P.bg, minHeight: 'calc(100vh - 56px)', display: 'flex', gap: 0 }}
        onClick={() => showActionsMenu && setShowActionsMenu(false)}>

        {/* ── Main column ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* ── 1. Header row — on gray background, above stats card ── */}
          <div style={{ padding: '12px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: 0, letterSpacing: '-0.02em' }}>Orders</h1>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, color: P.text, fontFamily: P.font }}>
                All locations
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
              {/* More actions with dropdown */}
              <div style={{ position: 'relative' }}>
                <button onClick={e => { e.stopPropagation(); setShowActionsMenu(v => !v); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, cursor: 'pointer', fontFamily: P.font, color: P.text }}>
                  More actions
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showActionsMenu && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 100, minWidth: 200, overflow: 'hidden' }}>
                    <button onClick={e => { e.stopPropagation(); setShowAnalytics(v => !v); setShowActionsMenu(false); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: P.fontSize, cursor: 'pointer', fontFamily: P.font, color: P.text, display: 'flex', alignItems: 'center', gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = P.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      {showAnalytics ? 'Hide analytics bar' : 'Show analytics bar'}
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => router.push('/products')} style={{ padding: '6px 14px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>
                Create order
              </button>
            </div>
          </div>

          {/* ── 2. Stats card — rounded card below header ── */}
          {showAnalytics && (
            <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0, margin: '0 16px 12px' }}>
              <div style={{ display: 'flex', minWidth: 'max-content', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px', borderRight: `1px solid ${P.border}`, flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill={P.textSubdued}>
                    <path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4H16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V2.75A.75.75 0 0 1 5.75 2ZM3.5 8v8a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V8h-13Z"/>
                  </svg>
                  <span style={{ fontSize: P.fontSize, color: P.text, fontWeight: 500 }}>Today</span>
                </div>
                {kpis.map((kpi, i) => (
                  <div key={i} style={{ padding: '10px 22px 10px 18px', borderRight: `1px solid ${P.border}`, flexShrink: 0, minWidth: 140 }}>
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginBottom: 1 }}>{kpi.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 650, color: P.text, letterSpacing: '-0.02em' }}>{kpi.value}</span>
                      <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>{kpi.sub}</span>
                    </div>
                    <Sparkline flat={kpi.value === 0 || kpi.value === '0' || kpi.value === '€0'} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 3. White main card — tabs + content ── */}
          <div style={{ background: P.surface, margin: '0 16px 16px', borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', flex: '0 0 auto' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '0 20px', borderBottom: `1px solid ${P.border}`, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {TABS.map(t => (
                <button key={t.id} className={`ord-tab${tab === t.id ? ' active' : ''}`}
                  onClick={() => { setTab(t.id); setSelected(null); }}>
                  {t.label}
                  {t.id === 'all' && orders.length > 0 && (
                    <span style={{ marginLeft: 5, fontSize: '0.625rem', background: P.bg, color: P.textSubdued, padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
                      {orders.length}
                    </span>
                  )}
                  {t.id === 'unfulfilled' && orders.filter(o => ['pending', 'processing'].includes(o.status)).length > 0 && (
                    <span style={{ marginLeft: 5, fontSize: '0.625rem', background: '#fff8db', color: '#7c5a00', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
                      {orders.filter(o => ['pending', 'processing'].includes(o.status)).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}

            {/* DRAFTS */}
            {tab === 'drafts' && (
              <div style={{ textAlign: 'center', padding: '64px 40px', animation: 'fadeIn .25s ease' }}>
                <img src="/empty-state-orders.svg" alt="" style={{ width: 160, height: 'auto', marginBottom: 20 }} />
                <div style={{ fontWeight: 650, fontSize: '1rem', color: P.text, marginBottom: 6 }}>Manually create orders and invoices</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued, maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Use draft orders to take orders over the phone, email invoices to customers, and collect payments.
                </div>
                <button style={{ padding: '8px 20px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>
                  Create draft order
                </button>
              </div>
            )}

            {/* ABANDONED */}
            {tab === 'abandoned' && (
              <div style={{ textAlign: 'center', padding: '64px 40px', animation: 'fadeIn .25s ease' }}>
                <img src="/empty-state-orders.svg" alt="" style={{ width: 160, height: 'auto', marginBottom: 20 }} />
                <div style={{ fontWeight: 650, fontSize: '1rem', color: P.text, marginBottom: 6 }}>Abandoned checkouts will show here</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued, maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 }}>
                  See when customers put an item in their cart but don't check out.
                </div>
              </div>
            )}

            {/* ALL / UNFULFILLED */}
            {(tab === 'all' || tab === 'unfulfilled') && (
              <div style={{ minHeight: 300 }}>

                {/* Loading */}
                {loading && (
                  <div style={{ padding: '80px', textAlign: 'center', color: P.textSubdued }}>Loading orders...</div>
                )}

                {/* Empty state */}
                {!loading && orders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '64px 40px', animation: 'fadeIn .25s ease' }}>
                    <img src="/empty-state-orders.svg" alt="" style={{ width: 160, height: 'auto', marginBottom: 20 }} />
                    <div style={{ fontWeight: 650, fontSize: '1rem', color: P.text, marginBottom: 8 }}>Your orders will show here</div>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued, maxWidth: 340, margin: '0 auto 20px', lineHeight: 1.6 }}>
                      This is where you'll fulfill orders, collect payments, and track order progress.
                    </div>
                    <button onClick={() => router.push('/products')} style={{ padding: '8px 20px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>
                      Create order
                    </button>
                  </div>
                )}

                {/* Orders table */}
                {!loading && sorted.length > 0 && (
                  <div>
                    {/* Search */}
                    <div style={{ padding: '12px 20px', borderBottom: `1px solid ${P.border}` }}>
                      <div style={{ position: 'relative', maxWidth: 320 }}>
                        <svg width="14" height="14" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"
                          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                          placeholder="Search orders..."
                          style={{ width: '100%', padding: '7px 12px 7px 32px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, color: P.text, background: P.surface, boxSizing: 'border-box' }}/>
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
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
                              <td style={td}><span style={{ fontWeight: 500, color: '#2b6cb0' }}>#{o.storefront_order_id || o.id.slice(0, 8).toUpperCase()}</span></td>
                              <td style={{ ...td, color: P.textSubdued }}>{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              <td style={td}>
                                <div style={{ fontWeight: 500 }}>{o.customer_name || '—'}</div>
                                {o.customer_email && <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{o.customer_email}</div>}
                              </td>
                              <td style={{ ...td, color: P.textSubdued, fontSize: '0.75rem' }}>{o.source_channel || 'Online Store'}</td>
                              <td style={{ ...td, fontWeight: 600 }}>${parseFloat(o.amount_paid || 0).toFixed(2)}</td>
                              <td style={td}><span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Paid</span></td>
                              <td style={td}><Badge status={o.status}/></td>
                              <td style={{ ...td, color: P.textSubdued }}>{o.quantity || 1}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* No search match */}
                {!loading && orders.length > 0 && sorted.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{ fontWeight: 500, color: P.text, marginBottom: 4 }}>No orders match your search</div>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>Try a different search term</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Learn more — gray area ── */}
          <div style={{ padding: '4px 20px 32px', textAlign: 'center' }}>
            <span style={{ color: '#2b6cb0', cursor: 'pointer', fontSize: P.fontSize, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Learn more about orders
            </span>
          </div>
        </div>

        {/* ── Order detail side panel ── */}
        {selected && (
          <div className="ord-detail" style={{ width: 320, flexShrink: 0, background: P.surface, borderLeft: `1px solid ${P.border}`, overflowY: 'auto' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: P.surface, zIndex: 10 }}>
              <span style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Order #{selected.storefront_order_id || selected.id.slice(0, 8).toUpperCase()}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: P.textSubdued, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Badge status={selected.status}/>
                <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Paid</span>
              </div>
              <div style={{ background: P.bg, borderRadius: 8, border: `1px solid ${P.border}`, padding: 12, marginBottom: 12 }}>
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
                {selected.shipping_address && <div style={{ fontSize: '0.75rem', color: P.textSubdued, lineHeight: 1.6 }}>{selected.shipping_address}</div>}
              </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.status === 'pending' && (
                  <button style={{ padding: '8px', background: P.green, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer', fontFamily: P.font }}>Fulfill order</button>
                )}
                <button style={{ padding: '8px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, cursor: 'pointer', fontFamily: P.font, color: P.text }}>View full order</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
