import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ── Exact Polaris tokens ──────────────────────────────────────────────────────
const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem', fontWeight: '450', letterSpacing: '-0.00833em',
};

// Tiny sparkline SVG — just a flat dashed line like Shopify shows for no data
const Sparkline = ({ color = '#2fb3eb' }) => (
  <svg width="80" height="24" viewBox="0 0 80 24">
    <line x1="0" y1="20" x2="80" y2="20" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6"/>
    <circle cx="40" cy="20" r="2" fill={color}/>
  </svg>
);

const MiniChart = ({ label, color = '#2fb3eb', height = 120 }) => (
  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '20px 24px', minHeight: height + 80 }}>
    <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 4, fontWeight: P.fontWeight, letterSpacing: P.letterSpacing }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 650, color: P.text, marginBottom: 2, letterSpacing: '-0.03em' }}>€0.00</div>
    <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 16, letterSpacing: P.letterSpacing }}>—</div>
    <div style={{ height, background: '#f9f9f9', borderRadius: 6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '12px 0' }}>
      <svg width="100%" height={height - 24} viewBox={`0 0 400 ${height - 24}`} preserveAspectRatio="none">
        <line x1="0" y1={height - 28} x2="400" y2={height - 28} stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
      </svg>
    </div>
    <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: P.textSubdued }}>
        <div style={{ width: 8, height: 2, background: color, borderRadius: 1 }}/>
        29 Apr 2026
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: P.textSubdued }}>
        <div style={{ width: 8, height: 2, background: color, borderRadius: 1, opacity: 0.4 }}/>
        28 Apr 2026
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, sub }) => (
  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '20px 24px' }}>
    <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 6, fontWeight: P.fontWeight, letterSpacing: P.letterSpacing }}>{label}</div>
    <div style={{ fontSize: '1.25rem', fontWeight: 650, color: P.text, letterSpacing: '-0.02em' }}>{value}</div>
    {sub && <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2, letterSpacing: P.letterSpacing }}>{sub}</div>}
    <Sparkline/>
  </div>
);

export default function Analytics() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateLabel, setDateLabel] = useState('Today');

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    Promise.all([
      fetch(`${API_BASE}/api/products`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/products/listings/all`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch(`${API_BASE}/api/orders`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
    ]).then(([p, l, o]) => {
      if (p.products) setProducts(p.products);
      if (l.listings) setListings(l.listings);
      if (o.orders) setOrders(o.orders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.amount_paid || 0), 0);
  const totalProfit = listings.reduce((s, l) => s + (parseFloat(l.selling_price || 0) - parseFloat(l.source_price_at_listing || 0)), 0);
  const avgOrder = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00';
  const convRate = products.length > 0 ? ((listings.length / products.length) * 100).toFixed(1) : '0';
  const topListings = [...listings].sort((a, b) =>
    (parseFloat(b.selling_price) - parseFloat(b.source_price_at_listing)) -
    (parseFloat(a.selling_price) - parseFloat(a.source_price_at_listing))
  ).slice(0, 5);
  const sources = Object.entries(
    products.reduce((acc, p) => { acc[p.source_domain] = (acc[p.source_domain] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const baseStyle = { fontFamily: P.font, fontSize: P.fontSize, fontWeight: P.fontWeight, letterSpacing: P.letterSpacing, color: P.text };

  return (
    <Layout title="Analytics">
      <style>{`
        @media (max-width: 767px) {
          .an-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .an-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .an-grid-2 { grid-template-columns: 1fr !important; }
          .an-grid-side { grid-template-columns: 1fr !important; }
          .an-grid-conv { grid-template-columns: 1fr 1fr !important; }
          .an-pad { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
      <div style={{ ...baseStyle, background: P.bg, minHeight: '100vh', padding: '0 0 40px' }}>

        {/* ── Page header ────────────────────────────────────────────────── */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="rgba(97,97,97,1)">
              <path d="M4.5 12.25a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-1.5 0V13a.75.75 0 0 1 .75-.75ZM10 8.5a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0V9.25A.75.75 0 0 1 10 8.5ZM15.5 4.5a.75.75 0 0 1 .75.75v11a.75.75 0 0 1-1.5 0v-11a.75.75 0 0 1 .75-.75Z"/>
            </svg>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 650, color: P.text, margin: 0, letterSpacing: '-0.02em' }}>Analytics</h1>
            <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>Last refreshed: {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* Date filter */}
            {['Today', dateStr, 'EUR €'].map((label, i) => (
              <button key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', background: P.surface,
                border: `1px solid ${P.border}`, borderRadius: 8,
                fontSize: P.fontSize, color: P.text, cursor: 'pointer',
                fontFamily: P.font, fontWeight: P.fontWeight
              }}>
                {i === 0 && <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4H16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V2.75A.75.75 0 0 1 5.75 2ZM3.5 8v8a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V8h-13Z"/></svg>}
                {i === 1 && <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4H16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V2.75A.75.75 0 0 1 5.75 2ZM3.5 8v8a.5.5 0 0 0 .5.5h12a.5.5 0 0 0 .5-.5V8h-13Z"/></svg>}
                {i === 2 && <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1a9 9 0 1 0 0 18A9 9 0 0 0 10 1ZM8.25 6.5a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0ZM10 9.5a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4A.75.75 0 0 1 10 9.5Z"/></svg>}
                {label}
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M5.72 8.47a.75.75 0 0 1 1.06 0L10 11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 9.53a.75.75 0 0 1 0-1.06Z"/></svg>
              </button>
            ))}
            <button style={{ padding: '6px 12px', background: P.green, color: '#fff', border: 'none', borderRadius: 8, fontSize: P.fontSize, fontWeight: 600, cursor: 'pointer', fontFamily: P.font }}>
              New exploration
            </button>
          </div>
        </div>

        <div className="an-pad" style={{ padding: '0 24px' }}>
          {/* ── Top 4 KPI cards ──────────────────────────────────────────── */}
          <div className="an-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            <StatCard label="Gross sales" value={`$${totalRevenue.toFixed(2)}`} sub="—"/>
            <StatCard label="Returning customer rate" value={`${orders.length > 0 ? '0' : '0'} %`} sub="—"/>
            <StatCard label="Orders fulfilled" value={orders.filter(o => o.status === 'delivered').length} sub="—"/>
            <StatCard label="Orders" value={orders.length} sub="—"/>
          </div>

          {/* ── Total sales over time + breakdown ──────────────────────── */}
          <div className="an-grid-side" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, marginBottom: 12 }}>
            <MiniChart label="Total sales over time" height={140}/>

            {/* Sales breakdown */}
            <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '20px 24px' }}>
              <div style={{ fontSize: P.fontSize, fontWeight: 600, color: P.text, marginBottom: 16, letterSpacing: P.letterSpacing }}>Total sales breakdown</div>
              {[
                { label: 'Gross sales', value: `$${totalRevenue.toFixed(2)}` },
                { label: 'Discounts', value: '$0.00' },
                { label: 'Returns', value: '$0.00' },
                { label: 'Net sales', value: `$${totalRevenue.toFixed(2)}` },
                { label: 'Shipping charges', value: '$0.00' },
                { label: 'Return fees', value: '$0.00' },
                { label: 'Taxes', value: '$0.00' },
                { label: 'Total sales', value: `$${totalRevenue.toFixed(2)}` },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 7 ? `1px solid ${P.border}` : 'none' }}>
                  <span style={{ fontSize: P.fontSize, color: '#2b6cb0', fontWeight: 500, letterSpacing: P.letterSpacing }}>{row.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: P.fontSize, color: P.text, fontWeight: 600 }}>{row.value}</span>
                    <span style={{ color: P.textSubdued, fontSize: '0.75rem' }}>—</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3-column row ─────────────────────────────────────────────── */}
          <div className="an-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <MiniChart label="Total sales by sales channel" height={100}/>
            <MiniChart label="Average order value over time" height={100}/>
            <MiniChart label="Total sales by product" height={100}/>
          </div>

          {/* ── Sessions + conversion ─────────────────────────────────── */}
          <div className="an-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <MiniChart label="Sessions over time" color="#2fb3eb" height={100}/>
            <MiniChart label="Conversion rate over time" color="#2fb3eb" height={100}/>
            {/* Conversion breakdown */}
            <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '20px 24px' }}>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 4, letterSpacing: P.letterSpacing }}>Conversion rate breakdown</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 650, color: P.text, marginBottom: 2, letterSpacing: '-0.02em' }}>0 %</div>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginBottom: 16 }}>—</div>
              <div className="an-grid-conv" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Sessions', val: '100 %', sub: '2→0%' },
                  { label: 'Added to cart', val: '0 %', sub: '0→0%' },
                  { label: 'Reached checkout', val: '0 %', sub: '0→0%' },
                  { label: 'Completed...', val: '0 %', sub: '0→0%' },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.6875rem', color: P.textSubdued, marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: P.fontSize, fontWeight: 600, color: P.text }}>{s.val}</div>
                    <div style={{ fontSize: '0.6875rem', color: P.textSubdued }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, height: 60, background: '#e8f0ff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, background: '#4361ee', borderRadius: 4 }}/>
              </div>
            </div>
          </div>

          {/* ── Onshipy-specific data ─────────────────────────────────── */}
          <div className="an-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {/* Store metrics */}
            <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '20px 24px' }}>
              <div style={{ fontSize: P.fontSize, fontWeight: 600, color: P.text, marginBottom: 16, letterSpacing: P.letterSpacing }}>Store metrics</div>
              {[
                { label: 'Profit potential', value: `$${totalProfit.toFixed(2)}`, color: P.green },
                { label: 'Avg order value', value: `$${avgOrder}`, color: P.text },
                { label: 'Import-to-listing rate', value: `${convRate}%`, color: '#6d28d9' },
                { label: 'Products imported', value: products.length, color: P.text },
                { label: 'Unique sources', value: sources.length, color: P.text },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
                  <span style={{ fontSize: P.fontSize, color: P.textSubdued, letterSpacing: P.letterSpacing }}>{r.label}</span>
                  <span style={{ fontSize: P.fontSize, fontWeight: 650, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Top listings */}
            <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '20px 24px' }}>
              <div style={{ fontSize: P.fontSize, fontWeight: 600, color: P.text, marginBottom: 16, letterSpacing: P.letterSpacing }}>Top listings by profit</div>
              {topListings.length === 0 ? (
                <div style={{ color: P.textSubdued, fontSize: P.fontSize, padding: '24px 0', textAlign: 'center' }}>
                  No listings yet. <span style={{ color: '#2b6cb0', cursor: 'pointer' }} onClick={() => router.push('/products')}>Add a listing</span>
                </div>
              ) : topListings.map((l, i) => {
                const profit = (parseFloat(l.selling_price) - parseFloat(l.source_price_at_listing)).toFixed(2);
                return (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i === 0 ? 'none' : `1px solid ${P.border}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: P.fontSize, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: P.letterSpacing }}>{l.custom_title || l.original_title}</div>
                      <div style={{ fontSize: '0.6875rem', color: P.textSubdued }}>{l.source_domain}</div>
                    </div>
                    <span style={{ fontSize: P.fontSize, fontWeight: 650, color: P.green, marginLeft: 12 }}>+${profit}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Sources ──────────────────────────────────────────────────── */}
          <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, padding: '20px 24px' }}>
            <div style={{ fontSize: P.fontSize, fontWeight: 600, color: P.text, marginBottom: 16, letterSpacing: P.letterSpacing }}>Products by source</div>
            {sources.length === 0 ? (
              <div style={{ color: P.textSubdued, fontSize: P.fontSize, textAlign: 'center', padding: '24px 0' }}>No data for this date range</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {sources.map(([domain, count]) => (
                  <div key={domain} style={{ background: P.bg, borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${P.border}` }}>
                    <span style={{ fontSize: P.fontSize, fontWeight: 500, letterSpacing: P.letterSpacing }}>{domain}</span>
                    <span style={{ fontSize: P.fontSize, fontWeight: 650, color: P.green }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: P.fontSize, color: P.textSubdued, letterSpacing: P.letterSpacing }}>
            Learn more about <span style={{ color: '#2b6cb0', cursor: 'pointer' }}>analytics</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}