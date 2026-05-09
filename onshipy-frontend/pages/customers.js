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

const Btn = ({ children, onClick, variant = 'secondary', style = {} }) => {
  const styles = {
    primary: { background: P.text, color: '#fff', border: 'none' },
    secondary: { background: P.surface, color: P.text, border: `1px solid ${P.border}` },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant], padding: '6px 14px', borderRadius: 8,
      fontSize: P.fontSize, fontWeight: 500, cursor: 'pointer',
      fontFamily: P.font, letterSpacing: P.letterSpacing, ...style
    }}>{children}</button>
  );
};

const SEGMENTS = [
  { id: 'all', label: 'All customers', filter: () => true },
  { id: 'repeat', label: 'Returning customers', filter: c => c.orders.length > 1 },
  { id: 'once', label: 'Purchased at least once', filter: c => c.orders.length >= 1 },
  { id: 'abandoned', label: 'High value (>$100)', filter: c => c.total_spent > 100 },
];

export default function Customers() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('all');
  const [sortBy, setSortBy] = useState('spent');
  const [sortDir, setSortDir] = useState('desc');

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

  const allCustomers = Object.values(orders.reduce((acc, o) => {
    const key = o.customer_email || o.id;
    if (!acc[key]) acc[key] = {
      email: o.customer_email || '—',
      name: o.customer_name || 'Unknown',
      orders: [], total_spent: 0,
      last_order: null, location: o.shipping_address || null
    };
    acc[key].orders.push(o);
    acc[key].total_spent += parseFloat(o.amount_paid || 0);
    const d = new Date(o.created_at);
    if (!acc[key].last_order || d > new Date(acc[key].last_order)) acc[key].last_order = o.created_at;
    return acc;
  }, {}));

  const segDef = SEGMENTS.find(s => s.id === segment);
  let filtered = allCustomers.filter(segDef.filter);
  if (search) filtered = filtered.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  filtered = [...filtered].sort((a, b) => {
    let av, bv;
    if (sortBy === 'spent') { av = a.total_spent; bv = b.total_spent; }
    else if (sortBy === 'orders') { av = a.orders.length; bv = b.orders.length; }
    else if (sortBy === 'name') { av = a.name; bv = b.name; return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); }
    else { av = new Date(a.last_order); bv = new Date(b.last_order); }
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => sortBy !== col ? null : (
    <svg width="10" height="10" viewBox="0 0 10 10" fill={P.textSubdued} style={{ marginLeft: 3 }}>
      {sortDir === 'asc' ? <path d="M5 2L8 7H2L5 2Z"/> : <path d="M5 8L2 3H8L5 8Z"/>}
    </svg>
  );

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const avatarColor = (name) => {
    const colors = ['#008060','#1d4ed8','#7c3aed','#b45309','#dc2626','#0284c7'];
    let h = 0; for (const c of (name || '')) h = ((h << 5) - h) + c.charCodeAt(0);
    return colors[Math.abs(h) % colors.length];
  };

  const th = {
    padding: '8px 16px', fontSize: '0.6875rem', fontWeight: 600,
    color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.06em',
    textAlign: 'left', borderBottom: `1px solid ${P.border}`,
    background: '#fafafa', cursor: 'pointer', userSelect: 'none',
    fontFamily: P.font,
  };
  const td = {
    padding: '11px 16px', fontSize: P.fontSize, borderBottom: `1px solid ${P.border}`,
    verticalAlign: 'middle', color: P.text, fontFamily: P.font,
    letterSpacing: P.letterSpacing,
  };

  return (
    <Layout title="Customers">
      <style>{`
        .cust-row:hover { background: #fafafa !important; }
        .seg-tab { padding: 7px 14px; background: none; border: none; border-bottom: 2px solid transparent; font-size: ${P.fontSize}; color: ${P.textSubdued}; cursor: pointer; font-family: ${P.font}; letter-spacing: ${P.letterSpacing}; font-weight: ${P.fontWeight}; white-space: nowrap; }
        .seg-tab.active { color: ${P.text}; font-weight: 600; border-bottom-color: ${P.text}; }
        .seg-tab:hover { color: ${P.text}; }
        @media (max-width: 767px) {
          .cust-detail { position: fixed !important; inset: 0 !important; width: 100% !important; z-index: 200 !important; overflow-y: auto !important; }
        }
      `}</style>

      <div style={{ fontFamily: P.font, fontSize: P.fontSize, letterSpacing: P.letterSpacing, color: P.text, display: 'flex', minHeight: 'calc(100vh - 56px)' }}>

        {/* ── Main panel ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: P.bg, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Header — floating on gray bg */}
          <div style={{ padding: '12px 20px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill={P.textSubdued}>
                  <path d="M13 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-1.5 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z"/>
                  <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2ZM3.5 10a6.5 6.5 0 1 1 11.573 4.089c-.46-.707-1.197-1.323-2.183-1.768C11.862 11.814 10.963 11.5 10 11.5s-1.862.314-2.89.821c-.986.445-1.723 1.06-2.183 1.768A6.476 6.476 0 0 1 3.5 10Z"/>
                </svg>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: 0, letterSpacing: '-0.02em' }}>Customers</h1>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn>Import customers</Btn>
                <Btn variant="primary">Add customer</Btn>
              </div>
            </div>

            {/* Segment tabs */}
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {SEGMENTS.map(s => (
                <button key={s.id} className={`seg-tab${segment === s.id ? ' active' : ''}`}
                  onClick={() => { setSegment(s.id); setSelected(null); }}>
                  {s.label}
                  <span style={{ marginLeft: 6, fontSize: '0.625rem', background: 'rgba(0,0,0,0.08)', color: P.textSubdued, padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>
                    {allCustomers.filter(s.filter).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main white card */}
          <div style={{ background: P.surface, margin: '0 16px 16px', borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Search bar */}
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                <svg width="14" height="14" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  style={{ width: '100%', padding: '7px 12px 7px 32px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, letterSpacing: P.letterSpacing, color: P.text, background: P.bg, boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ padding: '60px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>Loading customers...</div>
            )}

            {/* Empty state — no customers at all */}
            {!loading && allCustomers.length === 0 && (
              <div style={{ padding: '64px 40px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/empty-state-customers.svg" alt="" style={{ width: 160, height: 'auto', marginBottom: 20 }} />
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text, marginBottom: 6 }}>Everything customers-related in one place</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 20 }}>Manage customer details, see order history, and track spending</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <Btn variant="primary">Add customer</Btn>
                  <Btn>Import customers</Btn>
                </div>
              </div>
            )}

            {/* Table */}
            {!loading && filtered.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 40, paddingRight: 0 }}>
                      <input type="checkbox" style={{ accentColor: P.green }} />
                    </th>
                    {[
                      { label: 'Customer', col: 'name' },
                      { label: 'Email', col: null },
                      { label: 'Orders', col: 'orders' },
                      { label: 'Total spent', col: 'spent' },
                      { label: 'Last order', col: 'last' },
                    ].map(({ label, col }) => (
                      <th key={label} style={th} onClick={() => col && toggleSort(col)}>
                        {label}<SortIcon col={col} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const isSel = selected?.email === c.email;
                    return (
                      <tr key={c.email} className="cust-row"
                        onClick={() => setSelected(isSel ? null : c)}
                        style={{ cursor: 'pointer', background: isSel ? '#f0fdf6' : P.surface }}>
                        <td style={{ ...td, width: 40, paddingRight: 0 }} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" style={{ accentColor: P.green }} />
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarColor(c.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>
                              {initials(c.name)}
                            </div>
                            <span style={{ fontWeight: 500 }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ ...td, color: P.textSubdued }}>{c.email}</td>
                        <td style={td}>{c.orders.length}</td>
                        <td style={{ ...td, fontWeight: 600, color: P.green }}>${c.total_spent.toFixed(2)}</td>
                        <td style={{ ...td, color: P.textSubdued }}>
                          {c.last_order ? new Date(c.last_order).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* No search results */}
            {!loading && filtered.length === 0 && allCustomers.length > 0 && (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text, marginBottom: 4 }}>No customers found</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>Try changing your search or segment filter</div>
              </div>
            )}
          </div>

          {/* Learn more */}
          <div style={{ padding: '4px 20px 32px', textAlign: 'center', fontSize: P.fontSize }}>
            <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>Learn more about customers</span>
          </div>
        </div>

        {/* ── Customer detail panel ── */}
        {selected && (
          <div className="cust-detail" style={{ width: 320, flexShrink: 0, background: P.surface, borderLeft: `1px solid ${P.border}`, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: P.surface, zIndex: 10 }}>
              <span style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>Customer</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: P.textSubdued, lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>

            <div style={{ padding: '20px 16px', flex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: avatarColor(selected.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem', fontWeight: 700, margin: '0 auto 10px' }}>
                  {initials(selected.name)}
                </div>
                <div style={{ fontWeight: 650, fontSize: '0.9375rem', color: P.text, letterSpacing: '-0.02em' }}>{selected.name}</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>{selected.email}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'Orders', value: selected.orders.length, color: P.text },
                  { label: 'Total spent', value: `$${selected.total_spent.toFixed(2)}`, color: P.green },
                  { label: 'Avg order', value: `$${(selected.total_spent / selected.orders.length).toFixed(2)}`, color: P.text },
                  { label: 'Status', value: selected.orders.length > 1 ? 'Returning' : 'New', color: selected.orders.length > 1 ? P.green : P.textSubdued },
                ].map((s, i) => (
                  <div key={i} style={{ background: P.bg, borderRadius: 8, padding: '10px 12px', border: `1px solid ${P.border}` }}>
                    <div style={{ fontSize: '0.6875rem', color: P.textSubdued, marginBottom: 3, fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 650, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: P.textSubdued, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Order history</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {selected.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((o, i) => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < selected.orders.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: P.fontSize, color: '#2b6cb0', cursor: 'pointer' }}>
                        #{o.storefront_order_id || o.id.slice(0, 8)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>
                        {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>${o.amount_paid}</div>
                      <span style={{ fontSize: '0.625rem', padding: '1px 6px', borderRadius: 20, background: o.status === 'delivered' ? '#cdfed4' : o.status === 'shipped' ? '#eaf4ff' : '#fff8db', color: o.status === 'delivered' ? '#006847' : o.status === 'shipped' ? '#1d4ed8' : '#7c5a00', fontWeight: 600 }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
