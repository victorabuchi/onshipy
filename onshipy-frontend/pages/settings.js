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
      showToast('Changes saved successfully');
    } catch { showToast('Connection error', true); }
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
      showToast('Password updated successfully');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const navSections = [
    { id: 'general', label: 'General' },
    { id: 'plan', label: 'Plan' },
    { id: 'billing', label: 'Billing' },
    { id: 'users', label: 'Users' },
    { id: 'payments', label: 'Payments' },
    { id: 'checkout', label: 'Checkout' },
    { id: 'customer-accounts', label: 'Customer accounts' },
    { id: 'shipping', label: 'Shipping and delivery' },
    { id: 'taxes', label: 'Taxes and duties' },
    { id: 'locations', label: 'Locations' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'domains', label: 'Domains' },
    { id: 'languages', label: 'Languages' },
    { id: 'policies', label: 'Policies' },
    { id: 'security', label: 'Security' },
  ];

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#111', background: '#fff', fontFamily: 'inherit', transition: 'border-color 0.15s' };
  const lbl = { display: 'block', fontSize: '13px', fontWeight: '500', color: '#111', marginBottom: '5px' };
  const card = { background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '14px', overflow: 'hidden' };
  const cardHead = { padding: '14px 18px', borderBottom: '1px solid #f3f4f6' };
  const saveBtn = {
    padding: '9px 20px', background: saving ? '#9ca3af' : '#111', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
    fontWeight: '500', fontSize: '14px', fontFamily: 'inherit'
  };

  const ComingSoon = ({ title }) => (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>{title}</h1>
      <div style={card}>
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', background: '#f3f4f6', borderRadius: '10px', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔧</div>
          <div style={{ fontWeight: '600', fontSize: '15px', color: '#111', marginBottom: '6px' }}>{title} settings</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>This section is coming soon. Check back later.</div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <style>{`
        .settings-layout { display: flex; min-height: 100vh; background: #f1f2f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .settings-left { width: 260px; flex-shrink: 0; background: #fff; border-right: 1px solid #e5e7eb; padding: 0; overflow-y: auto; }
        .settings-right { flex: 1; padding: 28px 32px; overflow-y: auto; min-width: 0; }
        .s-nav-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 16px; font-size: 14px; color: #374151; cursor: pointer; border: none; background: none; width: 100%; text-align: left; font-family: inherit; transition: background 0.1s; }
        .s-nav-item:hover { background: #f9fafb; }
        .s-nav-item.active { background: #f0fdf4; color: #00a47c; font-weight: 500; }
        .inp-focus:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }
        @media (max-width: 767px) {
          .settings-layout { flex-direction: column; }
          .settings-left { width: 100%; border-right: none; border-bottom: 1px solid #e5e7eb; display: flex; flex-wrap: wrap; gap: 2px; padding: 8px; }
          .s-nav-item { width: auto; border-radius: 6px; padding: 7px 12px; font-size: 13px; }
          .s-nav-item.active { border-right: none !important; }
          .settings-right { padding: 16px; }
        }
      `}</style>

      {toast.show && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: toast.error ? '#dc2626' : '#111', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast.error ? '' : '✓ '}{toast.msg}
        </div>
      )}

      <div className="settings-layout">

        {/* Settings left sidebar */}
        <div className="settings-left">

          {/* Store info */}
          <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: '#1a1a2e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                {seller?.store_name?.[0]?.toUpperCase() || 'O'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.store_name || 'My Store'}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>onshipy.com</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px 12px' }}>
              <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search settings" style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', color: '#111', flex: 1, fontFamily: 'inherit' }} />
            </div>
          </div>

          {/* Nav items */}
          <div style={{ padding: '6px 0' }}>
            {navSections.map(item => (
              <button
                key={item.id}
                onClick={() => router.push(`/settings?section=${item.id}`, undefined, { shallow: true })}
                className={`s-nav-item${active === item.id ? ' active' : ''}`}
              >
                {item.label}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0.3, flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </div>

        {/* Settings content */}
        <div className="settings-right">

          {/* GENERAL */}
          {active === 'general' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>General</h1>
              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Business details</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Used for payments, markets, and apps</div>
                </div>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: '#f3f4f6', borderRadius: '6px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: '#374151' }}>
                      {seller?.store_name?.[0]?.toUpperCase() || 'O'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{seller?.store_name || 'My Store'} — entity</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>Store business entity</div>
                    </div>
                  </div>
                  <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>

              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Store contact details</div>
                </div>
                <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={lbl}>Store name</label>
                    <input value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} style={inp} placeholder="My Store" className="inp-focus" />
                  </div>
                  <div>
                    <label style={lbl}>Contact email</label>
                    <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" style={inp} className="inp-focus" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Store URL</label>
                    <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                      <span style={{ padding: '9px 12px', background: '#f9fafb', fontSize: '13px', color: '#6b7280', borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>onshipy.com/store/</span>
                      <input value={form.store_url} onChange={e => setForm({ ...form, store_url: e.target.value })} style={{ flex: 1, padding: '9px 12px', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit' }} placeholder="my-store" />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0 18px 18px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleSave(form)} disabled={saving} style={saveBtn}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>

              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Store defaults</div>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ maxWidth: '240px' }}>
                    <label style={lbl}>Default currency</label>
                    <select style={{ ...inp, cursor: 'pointer' }}>
                      <option>USD — US Dollar</option>
                      <option>EUR — Euro</option>
                      <option>GBP — British Pound</option>
                      <option>CAD — Canadian Dollar</option>
                      <option>AUD — Australian Dollar</option>
                      <option>NGN — Nigerian Naira</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS / PROFILE */}
          {active === 'users' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Users</h1>
              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Store owner</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Manage your account details</div>
                </div>
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ width: '54px', height: '54px', background: '#00a47c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: '700', flexShrink: 0 }}>
                      {seller?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>{seller?.full_name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{seller?.email}</div>
                      <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '11px', padding: '2px 8px', background: '#f0fdf4', color: '#00a47c', borderRadius: '20px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{seller?.plan || 'free'} plan</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={lbl}>Full name</label>
                      <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} style={inp} className="inp-focus" />
                    </div>
                    <div>
                      <label style={lbl}>Email address</label>
                      <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" style={inp} className="inp-focus" />
                    </div>
                  </div>
                  <button onClick={() => handleSave({ full_name: form.full_name, email: form.email, store_name: form.store_name, store_url: form.store_url })} disabled={saving} style={saveBtn}>
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {active === 'security' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Security</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Change password</div></div>
                <div style={{ padding: '18px', maxWidth: '400px' }}>
                  {[{ label: 'Current password', key: 'current_password' }, { label: 'New password', key: 'new_password' }, { label: 'Confirm new password', key: 'confirm_password' }].map(f => (
                    <div key={f.key} style={{ marginBottom: '14px' }}>
                      <label style={lbl}>{f.label}</label>
                      <input type="password" value={passwordForm[f.key]} onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })} style={inp} placeholder="••••••••" className="inp-focus" />
                    </div>
                  ))}
                  <button onClick={handlePassword} disabled={saving} style={saveBtn}>{saving ? 'Updating...' : 'Update password'}</button>
                </div>
              </div>
            </div>
          )}

          {/* PLAN */}
          {active === 'plan' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Plan</h1>
              <div style={card}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>Onshipy {seller?.plan || 'Free'}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Your current plan</div>
                  </div>
                  <span style={{ padding: '3px 12px', background: '#f0fdf4', color: '#00a47c', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>{seller?.plan || 'free'}</span>
                </div>
                <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  {[
                    { name: 'Free', price: '$0/mo', features: ['5 products', '1 store', 'Basic support'], color: '#6b7280', current: !seller?.plan || seller?.plan === 'free' },
                    { name: 'Pro', price: '$29/mo', features: ['Unlimited products', '3 stores', 'Auto-buy engine', 'Priority support', 'Analytics'], color: '#00a47c', current: seller?.plan === 'pro' },
                    { name: 'Enterprise', price: '$99/mo', features: ['Everything in Pro', '10 stores', 'API access', 'White label', 'Dedicated support'], color: '#7c3aed', current: seller?.plan === 'enterprise' },
                  ].map((plan, i) => (
                    <div key={i} style={{ border: plan.current ? `2px solid ${plan.color}` : '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', position: 'relative' }}>
                      {plan.current && <div style={{ position: 'absolute', top: '-10px', left: '14px', background: plan.color, color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>CURRENT</div>}
                      <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{plan.name}</div>
                      <div style={{ fontSize: '22px', fontWeight: '800', color: plan.color, marginBottom: '14px' }}>{plan.price}</div>
                      {plan.features.map((f, fi) => <div key={fi} style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px', display: 'flex', gap: '6px' }}><span style={{ color: '#00a47c' }}>✓</span>{f}</div>)}
                      {!plan.current && <button style={{ width: '100%', marginTop: '14px', padding: '9px', background: plan.color, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'inherit' }}>Upgrade</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BILLING */}
          {active === 'billing' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Billing</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Payment method</div></div>
                <div style={{ padding: '18px' }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px', marginBottom: '14px', fontSize: '14px', color: '#6b7280' }}>No payment method added yet</div>
                  <button style={{ padding: '9px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', fontFamily: 'inherit' }}>Add payment method</button>
                </div>
              </div>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Billing history</div></div>
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No billing history yet</div>
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {active === 'payments' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Payments</h1>
              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Payment providers</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Accept payments from your customers</div>
                </div>
                <div>
                  {[
                    { name: 'Stripe', desc: 'Accept credit cards, Apple Pay, Google Pay', logo: '💳' },
                    { name: 'PayPal', desc: 'Accept PayPal and Venmo payments', logo: '🅿️' },
                    { name: 'Paystack', desc: 'Accept payments in Africa', logo: '💚' },
                  ].map((p, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '22px' }}>{p.logo}</span>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '14px', color: '#111' }}>{p.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{p.desc}</div>
                        </div>
                      </div>
                      <button style={{ padding: '7px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit' }}>Connect</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {active === 'notifications' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Notifications</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Email notifications</div></div>
                <div>
                  {[
                    { label: 'New order received', desc: 'When a customer places an order', on: true },
                    { label: 'Order shipped', desc: 'When tracking is added to an order', on: true },
                    { label: 'Price change alert', desc: 'When source price changes on imported products', on: true },
                    { label: 'Out of stock alert', desc: 'When a source product goes out of stock', on: true },
                    { label: 'Auto-buy failed', desc: 'When automatic purchase fails', on: true },
                    { label: 'Weekly summary', desc: 'Weekly performance report', on: false },
                    { label: 'Marketing emails', desc: 'Tips, updates and new features', on: false },
                  ].map((n, i, arr) => {
                    const [on, setOn] = useState(n.on);
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{n.label}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{n.desc}</div>
                        </div>
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

          {/* DOMAINS */}
          {active === 'domains' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Domains</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Your domains</div></div>
                <div style={{ padding: '18px' }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '14px', color: '#111' }}>onshipy.com</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Primary domain</div>
                    </div>
                    <span style={{ fontSize: '12px', padding: '2px 10px', background: '#f0fdf4', color: '#00a47c', borderRadius: '20px', fontWeight: '600' }}>Active</span>
                  </div>
                  <button style={{ padding: '9px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px', fontFamily: 'inherit' }}>Connect existing domain</button>
                </div>
              </div>
            </div>
          )}

          {/* POLICIES */}
          {active === 'policies' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Policies</h1>
              <div style={card}>
                <div style={cardHead}><div style={{ fontWeight: '600', fontSize: '14px' }}>Store policies</div></div>
                <div>
                  {['Refund policy', 'Privacy policy', 'Terms of service', 'Shipping policy'].map((policy, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer' }}>
                      <div style={{ fontSize: '14px', color: '#111', fontWeight: '500' }}>{policy}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>Not created</span>
                        <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHECKOUT */}
          {active === 'checkout' && <ComingSoon title="Checkout" />}
          {active === 'customer-accounts' && <ComingSoon title="Customer accounts" />}
          {active === 'shipping' && <ComingSoon title="Shipping and delivery" />}
          {active === 'taxes' && <ComingSoon title="Taxes and duties" />}
          {active === 'locations' && <ComingSoon title="Locations" />}
          {active === 'languages' && <ComingSoon title="Languages" />}
        </div>
      </div>
    </Layout>
  );
}