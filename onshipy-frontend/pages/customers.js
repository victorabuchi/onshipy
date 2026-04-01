import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Customers() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const customers = Object.values(orders.reduce((acc, o) => {
    if (!acc[o.customer_email]) acc[o.customer_email] = { email: o.customer_email, name: o.customer_name, orders: [], total_spent: 0 };
    acc[o.customer_email].orders.push(o);
    acc[o.customer_email].total_spent += parseFloat(o.amount_paid || 0);
    return acc;
  }, {}));

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));
  const th = { padding: '9px 16px', fontSize: '11px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e1e3e5', background: '#f9fafb' };
  const td = { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' };

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: '#f6f6f7' }}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>Customers</h1>
              <p style={{ color: '#6d7175', fontSize: '13px', margin: '3px 0 0 0' }}>{customers.length} customers</p>
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width: '320px', padding: '9px 12px', border: '1px solid #c9cccf', borderRadius: '8px', fontSize: '14px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }} />
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6d7175', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>Loading...</div>
            ) : customers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>No customers yet</div>
                <div style={{ color: '#6d7175', fontSize: '14px' }}>Customers appear after their first purchase</div>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}>Customer</th><th style={th}>Email</th><th style={th}>Orders</th><th style={th}>Spent</th></tr></thead>
                  <tbody>
                    {filtered.map((c, i) => {
                      const isSel = selected?.email === c.email;
                      return (
                        <tr key={c.email} onClick={() => setSelected(isSel ? null : c)} style={{ cursor: 'pointer', background: isSel ? '#f0fdf6' : '#fff' }}>
                          <td style={td}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '32px', height: '32px', background: '#1a1a2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>{c.name?.[0]?.toUpperCase() || '?'}</div><span style={{ fontWeight: '500' }}>{c.name}</span></div></td>
                          <td style={{ ...td, color: '#6d7175', fontSize: '13px' }}>{c.email}</td>
                          <td style={{ ...td, fontWeight: '500' }}>{c.orders.length}</td>
                          <td style={{ ...td, fontWeight: '600', color: '#008060' }}>${c.total_spent.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {selected && (
          <div style={{ width: '360px', flexShrink: 0, background: '#fff', borderLeft: '1px solid #e1e3e5', overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e1e3e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Customer</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6d7175' }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', background: '#1a1a2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 auto 10px' }}>{selected.name?.[0]?.toUpperCase() || '?'}</div>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{selected.name}</div>
                <div style={{ fontSize: '13px', color: '#6d7175' }}>{selected.email}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '12px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: '700' }}>{selected.orders.length}</div><div style={{ fontSize: '12px', color: '#6d7175', marginTop: '3px' }}>Orders</div></div>
                <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '12px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: '700', color: '#008060' }}>${selected.total_spent.toFixed(2)}</div><div style={{ fontSize: '12px', color: '#6d7175', marginTop: '3px' }}>Total spent</div></div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Order history</div>
              {selected.orders.map((o, i) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid #f1f1f1' }}>
                  <div><div style={{ fontSize: '13px', fontWeight: '500' }}>#{o.storefront_order_id || o.id.slice(0, 8)}</div><div style={{ fontSize: '12px', color: '#6d7175' }}>{new Date(o.created_at).toLocaleDateString()}</div></div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#008060' }}>${o.amount_paid}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}