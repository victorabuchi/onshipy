import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Orders() {
  const router = useRouter();
  const tokenRef = useRef('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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

  const statusStyle = (s) => {
    const m = { pending: { bg: '#fff3cd', color: '#856404' }, processing: { bg: '#cce5ff', color: '#004085' }, shipped: { bg: '#d4edda', color: '#155724' }, delivered: { bg: '#e3f9ef', color: '#008060' }, cancelled: { bg: '#f8d7da', color: '#721c24' } };
    return m[s] || { bg: '#f1f1f1', color: '#6d7175' };
  };

  const th = { padding: '9px 16px', fontSize: '11px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: '1px solid #e1e3e5', background: '#f9fafb' };
  const td = { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #f1f1f1', verticalAlign: 'middle' };

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: '#f6f6f7' }}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>Orders</h1>
              <p style={{ color: '#6d7175', fontSize: '13px', margin: '3px 0 0 0' }}>{orders.length} total orders</p>
            </div>

            {/* UPDATED: 2-column stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total', value: orders.length, color: '#111' },
                { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#92400e' },
                { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#1e40af' },
                { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#00a47c' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6d7175', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>Loading...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5' }}>
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>No orders yet</div>
                <div style={{ color: '#6d7175', fontSize: '14px' }}>Orders will appear here when customers purchase from your store</div>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e1e3e5', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}>Order</th><th style={th}>Customer</th><th style={th}>Amount</th><th style={th}>Date</th><th style={th}>Status</th></tr></thead>
                  <tbody>
                    {orders.map(o => {
                      const s = statusStyle(o.status);
                      const isSel = selected?.id === o.id;
                      return (
                        <tr key={o.id} onClick={() => setSelected(isSel ? null : o)} style={{ cursor: 'pointer', background: isSel ? '#f0fdf6' : '#fff' }}>
                          <td style={{ ...td, fontWeight: '500' }}>#{o.storefront_order_id || o.id.slice(0, 8)}</td>
                          <td style={td}><div style={{ fontWeight: '500' }}>{o.customer_name}</div><div style={{ fontSize: '12px', color: '#6d7175' }}>{o.customer_email}</div></td>
                          <td style={{ ...td, fontWeight: '600' }}>${o.amount_paid}</td>
                          <td style={{ ...td, color: '#6d7175', fontSize: '13px' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td style={td}><span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: s.bg, color: s.color }}>{o.status}</span></td>
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
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Order #{selected.storefront_order_id || selected.id.slice(0, 8)}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6d7175' }}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Customer</div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>{selected.customer_name}</div>
                <div style={{ fontSize: '13px', color: '#6d7175' }}>{selected.customer_email}</div>
              </div>
              <div style={{ background: '#f6f6f7', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6d7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Order details</div>
                {[
                  { label: 'Amount paid', value: `$${selected.amount_paid}` },
                  { label: 'Quantity', value: selected.quantity },
                  { label: 'Status', value: selected.status },
                  { label: 'Date', value: new Date(selected.created_at).toLocaleString() },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: i === 0 ? 'none' : '1px solid #e1e3e5' }}>
                    <span style={{ fontSize: '13px', color: '#6d7175' }}>{r.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{r.value}</span>
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