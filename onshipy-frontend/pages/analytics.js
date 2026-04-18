import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Analytics() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);

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
    }).catch(console.error);
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.amount_paid || 0), 0);
  const totalProfit = listings.reduce((s, l) => s + (parseFloat(l.selling_price || 0) - parseFloat(l.source_price_at_listing || 0)), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  const convRate = products.length > 0 ? ((listings.length / products.length) * 100).toFixed(1) : 0;
  const topListings = [...listings].sort((a, b) => (parseFloat(b.selling_price) - parseFloat(b.source_price_at_listing)) - (parseFloat(a.selling_price) - parseFloat(a.source_price_at_listing))).slice(0, 5);
  const sources = Object.entries(products.reduce((acc, p) => { acc[p.source_domain] = (acc[p.source_domain] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]);

  const card = { background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', padding: '20px 24px', marginBottom: '16px' };

  return (
    <Layout>
      <div style={{ padding: '24px 28px', background: '#f6f6f7', minHeight: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>Analytics</h1>
          <p style={{ color: '#6d7175', fontSize: '13px', margin: '3px 0 0 0' }}>Your store performance overview</p>
        </div>

        {/* UPDATED: 2-column KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Products', value: products.length, color: '#111' },
            { label: 'Listings', value: listings.length, color: '#1e40af' },
            { label: 'Orders', value: orders.length, color: '#7c3aed' },
            { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, color: '#00a47c' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={card}>
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>Store metrics</div>
            {[
              { label: 'Profit potential', value: `$${totalProfit.toFixed(2)}`, color: '#008060' },
              { label: 'Avg order value', value: `$${avgOrder.toFixed(2)}`, color: '#1a1a1a' },
              { label: 'Import-to-listing rate', value: `${convRate}%`, color: '#6d28d9' },
              { label: 'Unique sources', value: sources.length, color: '#1a1a1a' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: i === 0 ? 'none' : '1px solid #f1f1f1' }}>
                <span style={{ fontSize: '14px', color: '#6d7175' }}>{r.label}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>Top listings by profit</div>
            {topListings.length === 0 ? <div style={{ color: '#6d7175', fontSize: '14px' }}>No listings yet</div> : topListings.map((l, i) => {
              const profit = (parseFloat(l.selling_price) - parseFloat(l.source_price_at_listing)).toFixed(2);
              return (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid #f1f1f1' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.custom_title || l.original_title}</div>
                    <div style={{ fontSize: '12px', color: '#6d7175' }}>{l.source_domain}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#008060', marginLeft: '10px' }}>+${profit}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '14px' }}>Products by source</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {sources.map(([domain, count]) => (
              <div key={domain} style={{ background: '#f6f6f7', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a1a' }}>{domain}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#008060' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}