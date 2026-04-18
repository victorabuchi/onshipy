import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Settings() {
  const router = useRouter();
  const { section } = router.query;
  const active = section || 'general';
  const tokenRef = useRef('');
  const [seller, setSeller] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', store_name: '', store_url: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', error: false });

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) {
      const sd = JSON.parse(s);
      setSeller(sd);
      setForm({ full_name: sd.full_name || '', email: sd.email || '', store_name: sd.store_name || '', store_url: sd.store_url || '' });
    }
  }, []);

  const showToast = (msg, error = false) => {
    setToast({ show: true, msg, error });
    setTimeout(() => setToast({ show: false, msg: '', error: false }), 4000);
  };

  const handleSave = async (body) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sellers/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Save failed', true); return; }
      const updated = { ...seller, ...data.seller };
      setSeller(updated);
      localStorage.setItem('onshipy_seller', JSON.stringify(updated));
      showToast('Saved successfully');
    } catch (err) { showToast('Connection error', true); }
    setSaving(false);
  };

  const handlePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) { showToast('Passwords do not match', true); return; }
    if (passwordForm.new_password.length < 8) { showToast('Minimum 8 characters', true); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sellers/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ current_password: passwordForm.current_password, new_password: passwordForm.new_password })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed', true); return; }
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      showToast('Password updated');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const navItems = [
    { id: 'general', label: 'General' },
    { id: 'plan', label: 'Plan' },
    { id: 'billing', label: 'Billing' },
    { id: 'users', label: 'Users' },
    { id: 'payments', label: 'Payments' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ];

  const inp = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111', background: '#fff' };
  const lbl = { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#111' };
  const card = { background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '16px', overflow: 'hidden' };
  const cardHead = { padding: '16px 20px', borderBottom: '1px solid #f3f4f6' };
  const saveBtn = { padding: '10px 24px', background: saving ? '#9ca3af' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '500', fontSize: '14px' };

  return (
    <Layout>
      <style>{`
        .settings-wrap { display: flex; min-height: 100vh; }
        .settings-sidebar { width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e5e7eb; padding: 16px 0; }
        .settings-content { flex: 1; padding: 28px 32px; overflow-y: auto; background: #f1f2f4; }
        .settings-nav-link { display: block; padding: 9px 16px; font-size: 14px; color: #374151; text-decoration: none; border-radius: 0; cursor: pointer; border: none; background: none; width: 100%; text-align: left; }
        .settings-nav-link:hover { background: #f3f4f6; color: #111; }
        .settings-nav-link.active { background: #f0fdf4; color: #00a47c; font-weight: 600; border-right: 3px solid #00a47c; }
        @media (max-width: 767px) {
          .settings-wrap { flex-direction: column; }
          .settings-sidebar { width: 100%; border-right: none; border-bottom: 1px solid #e5e7eb; padding: 8px; display: flex; flex-wrap: wrap; gap: 4px; }
          .settings-nav-link { padding: 8px 12px; border-radius: 6px; font-size: 13px; width: auto; border-right: none !important; }
          .settings-content { padding: 16px; }
        }
      `}</style>

      {toast.show && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: toast.error ? '#dc2626' : '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast.error ? '' : '✓ '}{toast.msg}
        </div>
      )}

      <div className="settings-wrap">
        {/* Settings sidebar */}
        <div className="settings-sidebar">
          <div style={{ padding: '0 16px 12px', borderBottom: '1px solid #f3f4f6', marginBottom: '8px' }} className="hide-mobile">
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settings</div>
          </div>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => router.push(`/settings?section=${item.id}`, undefined, { shallow: true })}
              className={`settings-nav-link${active === item.id ? ' active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">

          {active === 'general' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>General</h1>
              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Store contact details</div>
                </div>
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div><label style={lbl}>Store name</label><input value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} style={inp} placeholder="My Store" /></div>
                  <div><label style={lbl}>Contact email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" style={inp} /></div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Store URL</label>
                    <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                      <span style={{ padding: '10px 12px', background: '#f9fafb', fontSize: '13px', color: '#6b7280', borderRight: '1px solid #d1d5db', whiteSpace: 'nowrap' }}>onshipy.com/store/</span>
                      <input value={form.store_url} onChange={e => setForm({ ...form, store_url: e.target.value })} style={{ flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '14px' }} placeholder="my-store" />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleSave(form)} disabled={saving} style={saveBtn}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            </div>
          )}

          {active === 'users' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Users</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Store owner</div></div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ width: '52px', height: '52px', background: '#00a47c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
                      {seller?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{seller?.full_name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{seller?.email}</div>
                      <div style={{ fontSize: '11px', color: '#00a47c', fontWeight: '600', marginTop: '3px', textTransform: 'uppercase' }}>{seller?.plan || 'free'} plan</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                    <div><label style={lbl}>Full name</label><input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} style={inp} /></div>
                    <div><label style={lbl}>Email address</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" style={inp} /></div>
                  </div>
                  <button onClick={() => handleSave({ full_name: form.full_name, email: form.email, store_name: form.store_name, store_url: form.store_url })} disabled={saving} style={saveBtn}>
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === 'security' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Security</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Change password</div></div>
                <div style={{ padding: '20px', maxWidth: '400px' }}>
                  {[{ label: 'Current password', key: 'current_password' }, { label: 'New password', key: 'new_password' }, { label: 'Confirm new password', key: 'confirm_password' }].map(f => (
                    <div key={f.key} style={{ marginBottom: '14px' }}>
                      <label style={lbl}>{f.label}</label>
                      <input type="password" value={passwordForm[f.key]} onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })} style={inp} placeholder="••••••••" />
                    </div>
                  ))}
                  <button onClick={handlePassword} disabled={saving} style={saveBtn}>{saving ? 'Updating...' : 'Update password'}</button>
                </div>
              </div>
            </div>
          )}

          {active === 'plan' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Plan</h1>
              <div style={card}>
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {[
                    { name: 'Free', price: '$0/mo', features: ['5 products', '1 store', 'Basic support'], color: '#6b7280', current: !seller?.plan || seller?.plan === 'free' },
                    { name: 'Pro', price: '$29/mo', features: ['Unlimited products', '3 stores', 'Auto-buy engine', 'Priority support'], color: '#00a47c', current: seller?.plan === 'pro' },
                    { name: 'Enterprise', price: '$99/mo', features: ['Everything in Pro', '10 stores', 'API access', 'White label'], color: '#7c3aed', current: seller?.plan === 'enterprise' },
                  ].map((plan, i) => (
                    <div key={i} style={{ border: plan.current ? `2px solid ${plan.color}` : '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', position: 'relative' }}>
                      {plan.current && <div style={{ position: 'absolute', top: '-10px', left: '14px', background: plan.color, color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>CURRENT</div>}
                      <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{plan.name}</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: plan.color, marginBottom: '14px' }}>{plan.price}</div>
                      {plan.features.map((f, fi) => <div key={fi} style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', display: 'flex', gap: '6px' }}><span style={{ color: '#00a47c' }}>✓</span>{f}</div>)}
                      {!plan.current && <button style={{ width: '100%', marginTop: '14px', padding: '9px', background: plan.color, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Upgrade to {plan.name}</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === 'billing' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Billing</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Payment method</div></div>
                <div style={{ padding: '20px' }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px', marginBottom: '14px', fontSize: '14px', color: '#6b7280' }}>No payment method added yet</div>
                  <button style={{ padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>Add payment method</button>
                </div>
              </div>
            </div>
          )}

          {active === 'payments' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Payments</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Payment providers</div></div>
                <div>
                  {[{ name: 'Stripe', desc: 'Accept credit cards, Apple Pay, Google Pay' }, { name: 'PayPal', desc: 'Accept PayPal and Venmo' }, { name: 'Paystack', desc: 'Payments in Africa' }].map((p, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <div><div style={{ fontWeight: '500', fontSize: '14px' }}>{p.name}</div><div style={{ fontSize: '13px', color: '#6b7280' }}>{p.desc}</div></div>
                      <button style={{ padding: '7px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Connect</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Notifications</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Email notifications</div></div>
                <div>
                  {[
                    { label: 'New order received', desc: 'When a customer places an order', on: true },
                    { label: 'Order shipped', desc: 'When tracking is added', on: true },
                    { label: 'Price change alert', desc: 'When source price changes', on: true },
                    { label: 'Out of stock', desc: 'When a source product goes out of stock', on: true },
                    { label: 'Auto-buy failed', desc: 'When automatic purchase fails', on: true },
                    { label: 'Weekly summary', desc: 'Weekly performance report', on: false },
                  ].map((n, i, arr) => {
                    const [on, setOn] = useState(n.on);
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <div><div style={{ fontSize: '14px', fontWeight: '500' }}>{n.label}</div><div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{n.desc}</div></div>
                        <div onClick={() => setOn(!on)} style={{ width: '40px', height: '22px', background: on ? '#00a47c' : '#d1d5db', borderRadius: '11px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', top: '2px', left: on ? '20px' : '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}