import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const P = {
  bg: '#f1f1f1', surface: '#fff', border: 'rgba(227,227,227,1)',
  text: 'rgba(48,48,48,1)', textSubdued: 'rgba(97,97,97,1)',
  green: '#008060', font: '"Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif',
  fontSize: '0.8125rem', fontWeight: '450', letterSpacing: '-0.00833em',
};

const NAV = [
  { id: 'general',           label: 'General',               icon: '🏪' },
  { id: 'plan',              label: 'Plan',                  icon: '📋' },
  { id: 'billing',           label: 'Billing',               icon: '💳' },
  { id: 'users',             label: 'Users',                 icon: '👤' },
  { id: 'payments',          label: 'Payments',              icon: '💰' },
  { id: 'checkout',          label: 'Checkout',              icon: '🛒' },
  { id: 'customer-accounts', label: 'Customer accounts',     icon: '👥' },
  { id: 'shipping',          label: 'Shipping and delivery', icon: '🚚' },
  { id: 'taxes',             label: 'Taxes and duties',      icon: '🧾' },
  { id: 'locations',         label: 'Locations',             icon: '📍' },
  { id: 'notifications',     label: 'Notifications',         icon: '🔔' },
  { id: 'domains',           label: 'Domains',               icon: '🌐' },
  { id: 'languages',         label: 'Languages',             icon: '🗣️' },
  { id: 'policies',          label: 'Policies',              icon: '📄' },
  { id: 'security',          label: 'Security',              icon: '🔒' },
];

const Card = ({ children, style = {} }) => (
  <div style={{ background: P.surface, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'hidden', marginBottom: 16, ...style }}>
    {children}
  </div>
);

const CardHead = ({ title, subtitle }) => (
  <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}` }}>
    <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text }}>{title}</div>
    {subtitle && <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>{subtitle}</div>}
  </div>
);

const Inp = ({ label, value, onChange, type = 'text', placeholder, prefix, readOnly }) => (
  <div>
    {label && <label style={{ display: 'block', fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 5 }}>{label}</label>}
    {prefix ? (
      <div style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <span style={{ padding: '7px 12px', background: P.bg, fontSize: P.fontSize, color: P.textSubdued, borderRight: `1px solid ${P.border}`, whiteSpace: 'nowrap' }}>{prefix}</span>
        <input value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          style={{ flex: 1, padding: '7px 12px', border: 'none', outline: 'none', fontSize: P.fontSize, fontFamily: P.font, color: P.text, background: readOnly ? P.bg : P.surface }}/>
      </div>
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        style={{ width: '100%', padding: '7px 12px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, color: P.text, background: readOnly ? P.bg : P.surface, boxSizing: 'border-box' }}/>
    )}
  </div>
);

const SaveBtn = ({ onClick, saving, label = 'Save' }) => (
  <button onClick={onClick} disabled={saving} style={{
    padding: '7px 18px', background: saving ? P.bg : P.text, color: saving ? P.textSubdued : '#fff',
    border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500,
    cursor: saving ? 'not-allowed' : 'pointer', fontFamily: P.font,
  }}>{saving ? 'Saving...' : label}</button>
);

const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{ width: 36, height: 20, background: on ? P.green : P.border, borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
  </div>
);

const ComingSoon = ({ title }) => (
  <div>
    <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>{title}</h1>
    <Card>
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', marginBottom: 12 }}>🔧</div>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text, marginBottom: 6 }}>{title} settings</div>
        <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>This section is coming soon.</div>
      </div>
    </Card>
  </div>
);

export default function Settings() {
  const router = useRouter();
  const active = router.query.section || null; // null = show nav list on mobile
  const tokenRef = useRef('');
  const [seller, setSeller] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', store_name: '', store_url: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifs, setNotifs] = useState({
    new_order: true, order_shipped: true, price_change: true,
    out_of_stock: true, auto_buy_failed: true, weekly_summary: false, marketing: false
  });

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    tokenRef.current = t;
    if (s) {
      try {
        const sd = JSON.parse(s);
        setSeller(sd);
        setForm({ full_name: sd.full_name || '', email: sd.email || '', store_name: sd.store_name || '', store_url: sd.store_url || '' });
      } catch {}
    }
  }, []);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
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
      showToast('Changes saved');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const handlePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) { showToast('Passwords do not match', true); return; }
    if (pwForm.new_password.length < 8) { showToast('Min 8 characters', true); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/sellers/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ current_password: pwForm.current_password, new_password: pwForm.new_password })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed', true); return; }
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      showToast('Password updated');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const goSection = (id) => router.push(`/settings?section=${id}`, undefined, { shallow: true });
  const goBack    = () => router.push('/settings', undefined, { shallow: true });
  const initials  = seller?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const activeNav = NAV.find(n => n.id === active);

  const SectionContent = () => {
    if (active === 'general') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>General</h1>
        <Card>
          <CardHead title="Store contact details" subtitle="Used for customer communications"/>
          <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <Inp label="Store name" value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} placeholder="My Store"/>
            <Inp label="Contact email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email"/>
            <div style={{ gridColumn: '1 / -1' }}>
              <Inp label="Store URL" value={form.store_url} onChange={e => setForm({ ...form, store_url: e.target.value })} prefix="onshipy.com/store/" placeholder="my-store"/>
            </div>
          </div>
          <div style={{ padding: '0 20px 18px', display: 'flex', justifyContent: 'flex-end' }}>
            <SaveBtn onClick={() => handleSave(form)} saving={saving}/>
          </div>
        </Card>
        <Card>
          <CardHead title="Store defaults"/>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ maxWidth: 240 }}>
              <label style={{ display: 'block', fontSize: P.fontSize, fontWeight: 500, color: P.text, marginBottom: 5 }}>Default currency</label>
              <select style={{ width: '100%', padding: '7px 12px', border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, outline: 'none', fontFamily: P.font, color: P.text, background: P.surface }}>
                <option>USD — US Dollar</option><option>EUR — Euro</option><option>GBP — British Pound</option>
                <option>NGN — Nigerian Naira</option><option>CAD — Canadian Dollar</option><option>AUD — Australian Dollar</option>
              </select>
            </div>
          </div>
          <div style={{ padding: '0 20px 18px', display: 'flex', justifyContent: 'flex-end' }}>
            <SaveBtn onClick={() => showToast('Saved')} saving={saving}/>
          </div>
        </Card>
      </div>
    );

    if (active === 'plan') return (
      <div style={{ maxWidth: 880 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Plan</h1>
        <Card>
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text }}>Onshipy {seller?.plan ? seller.plan.charAt(0).toUpperCase() + seller.plan.slice(1) : 'Free'}</div>
              <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>Your current plan</div>
            </div>
            <span style={{ padding: '3px 12px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'capitalize' }}>{seller?.plan || 'free'}</span>
          </div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { id: 'free', name: 'Free', price: '$0', period: 'forever', color: P.textSubdued, features: ['5 product imports', '1 connected store', 'Basic scraper', 'Email support'] },
            { id: 'pro', name: 'Pro', price: '$29', period: 'per month', color: P.green, popular: true, features: ['Unlimited imports', '3 stores', 'Auto-buy engine', 'Analytics', 'Priority support'] },
            { id: 'enterprise', name: 'Enterprise', price: '$99', period: 'per month', color: '#7c3aed', features: ['Everything in Pro', '10 stores', 'API access', 'White label', 'Dedicated manager'] },
          ].map((plan) => {
            const isCurrent = (seller?.plan || 'free') === plan.id;
            return (
              <div key={plan.id} style={{ background: P.surface, borderRadius: 12, border: isCurrent ? `2px solid ${plan.color}` : `1px solid ${P.border}`, padding: 20, position: 'relative' }}>
                {isCurrent && <div style={{ position: 'absolute', top: -10, left: 14, background: plan.color, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>CURRENT</div>}
                {plan.popular && !isCurrent && <div style={{ position: 'absolute', top: -10, right: 14, background: P.green, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' }}>POPULAR</div>}
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: P.text, marginBottom: 2 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: plan.color, letterSpacing: '-0.03em' }}>{plan.price}</span>
                  <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>{plan.period}</span>
                </div>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: P.fontSize, color: P.textSubdued }}>
                    <span style={{ color: P.green }}>✓</span>{f}
                  </div>
                ))}
                {!isCurrent ? (
                  <button onClick={() => router.push('/plans')} style={{ width: '100%', marginTop: 14, padding: 8, background: plan.color, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: P.fontSize, fontFamily: P.font }}>
                    Upgrade to {plan.name}
                  </button>
                ) : (
                  <button disabled style={{ width: '100%', marginTop: 14, padding: 8, background: P.bg, color: P.textSubdued, border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'not-allowed', fontWeight: 500, fontSize: P.fontSize, fontFamily: P.font }}>Current plan</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );

    if (active === 'billing') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Billing</h1>
        <Card>
          <CardHead title="Payment method"/>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 14, fontSize: P.fontSize, color: P.textSubdued }}>No payment method added yet</div>
            <button onClick={() => router.push('/plans')} style={{ padding: '7px 16px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>Add payment method</button>
          </div>
        </Card>
        <Card>
          <CardHead title="Billing history"/>
          <div style={{ padding: '48px 40px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>No billing history yet</div>
        </Card>
      </div>
    );

    if (active === 'users') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Users</h1>
        <Card>
          <CardHead title="Store owner" subtitle="Manage your account details"/>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${P.border}` }}>
              <div style={{ width: 50, height: 50, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.125rem', fontWeight: 700, flexShrink: 0 }}>{initials}</div>
              <div>
                <div style={{ fontWeight: 650, fontSize: '0.9375rem', color: P.text }}>{seller?.full_name}</div>
                <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>{seller?.email}</div>
                <span style={{ fontSize: '0.6875rem', padding: '2px 8px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase', display: 'inline-block', marginTop: 4 }}>{seller?.plan || 'free'} plan</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
              <Inp label="Full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}/>
              <Inp label="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email"/>
            </div>
            <SaveBtn onClick={() => handleSave({ full_name: form.full_name, email: form.email, store_name: form.store_name })} saving={saving} label="Save changes"/>
          </div>
        </Card>
      </div>
    );

    if (active === 'payments') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Payments</h1>
        <Card>
          <CardHead title="Payment providers" subtitle="Accept payments from your customers"/>
          {[
            { name: 'Stripe', desc: 'Credit cards, Apple Pay, Google Pay worldwide' },
            { name: 'PayPal', desc: 'PayPal and Venmo payments' },
            { name: 'Paystack', desc: 'Cards, bank transfer, USSD across Africa' },
          ].map((p, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none', background: P.surface }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>{p.desc}</div>
              </div>
              <button style={{ padding: '6px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font, color: P.text }}>Connect</button>
            </div>
          ))}
        </Card>
      </div>
    );

    if (active === 'notifications') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Notifications</h1>
        <Card>
          <CardHead title="Email notifications" subtitle="Choose which events trigger an email"/>
          {[
            { key: 'new_order', label: 'New order received', desc: 'When a customer places an order' },
            { key: 'order_shipped', label: 'Order shipped', desc: 'When tracking is added to an order' },
            { key: 'price_change', label: 'Price change alert', desc: 'When source price changes' },
            { key: 'out_of_stock', label: 'Out of stock alert', desc: 'When a source product goes out of stock' },
            { key: 'auto_buy_failed', label: 'Auto-buy failed', desc: 'When automatic purchase fails' },
            { key: 'weekly_summary', label: 'Weekly summary', desc: 'Weekly performance report' },
            { key: 'marketing', label: 'Marketing emails', desc: 'Tips, updates and new features' },
          ].map((n, i, arr) => (
            <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none', background: P.surface }}>
              <div>
                <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>{n.label}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>{n.desc}</div>
              </div>
              <Toggle on={notifs[n.key]} onChange={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}/>
            </div>
          ))}
        </Card>
      </div>
    );

    if (active === 'domains') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Domains</h1>
        <Card>
          <CardHead title="Your domains"/>
          <div style={{ padding: '18px 20px' }}>
            {[
              { domain: 'onshipy.com', type: 'Primary domain' },
              { domain: 'api.onshipy.com', type: 'API subdomain' },
              { domain: 'www.onshipy.com', type: 'Redirect' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: P.bg, borderRadius: 8, marginBottom: 8, border: `1px solid ${P.border}` }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{d.domain}</div>
                  <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>{d.type}</div>
                </div>
                <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Active</span>
              </div>
            ))}
            <button style={{ marginTop: 8, padding: '7px 16px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>
              Connect existing domain
            </button>
          </div>
        </Card>
      </div>
    );

    if (active === 'policies') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Policies</h1>
        <Card>
          <CardHead title="Store policies" subtitle="Build trust with your customers"/>
          {['Refund policy', 'Privacy policy', 'Terms of service', 'Shipping policy', 'Contact information'].map((policy, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none', cursor: 'pointer', background: P.surface }}>
              <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>{policy}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>Not created</span>
                <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          ))}
        </Card>
      </div>
    );

    if (active === 'security') return (
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Security</h1>
        <Card>
          <CardHead title="Change password" subtitle="Use a strong password of at least 8 characters"/>
          <div style={{ padding: '18px 20px', maxWidth: 400 }}>
            {[{ label: 'Current password', key: 'current_password' }, { label: 'New password', key: 'new_password' }, { label: 'Confirm new password', key: 'confirm_password' }].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <Inp label={f.label} type="password" value={pwForm[f.key]} onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} placeholder="••••••••"/>
              </div>
            ))}
            <SaveBtn onClick={handlePassword} saving={saving} label="Update password"/>
          </div>
        </Card>
        <Card>
          <CardHead title="Login sessions" subtitle="Manage where you're logged in"/>
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>Current session</div>
              <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>Active now</div>
            </div>
            <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Active</span>
          </div>
        </Card>
      </div>
    );

    return <ComingSoon title={activeNav?.label || 'Settings'}/>;
  };

  return (
    <>
      <Head>
        <title>Settings — Onshipy</title>
        <link rel="icon" type="image/png" href="/favicon.png"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet"/>
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: "Inter var","Inter",-apple-system,BlinkMacSystemFont,sans-serif;
          font-size: 0.8125rem; font-weight: 450; letter-spacing: -0.00833em;
          color: rgba(48,48,48,1); background: #f1f1f1;
          -webkit-font-smoothing: antialiased;
        }
        .row-hover:hover { background: #f7f7f7; }

        /* ── TOPBAR ── */
        .st-topbar {
          position: fixed; top: 0; left: 0; right: 0; height: 56px;
          background: #1a1a1a; z-index: 500;
          display: flex; align-items: center; padding: 0 16px; gap: 12px;
        }

        /* ── DESKTOP: side by side ── */
        .st-shell {
          display: flex; min-height: 100vh; padding-top: 56px;
        }
        .st-nav {
          width: 260px; flex-shrink: 0; background: #fff;
          border-right: 1px solid rgba(227,227,227,1);
          min-height: calc(100vh - 56px); overflow-y: auto;
          position: sticky; top: 56px; align-self: flex-start;
          height: calc(100vh - 56px);
        }
        .st-content {
          flex: 1; padding: 24px 28px 60px; min-width: 0; background: #f1f1f1;
        }

        /* ── MOBILE: full-screen list then full-screen content ── */
        @media (max-width: 767px) {
          .st-shell { flex-direction: column; }
          /* Nav takes full screen on mobile when no section selected */
          .st-nav {
            width: 100%; min-height: auto; height: auto;
            position: static; border-right: none;
            border-bottom: 1px solid rgba(227,227,227,1);
          }
          .st-nav.mob-hidden { display: none; }
          .st-content { padding: 0 0 40px; }
          .st-content.mob-hidden { display: none; }
        }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 72, right: 16, background: toast.err ? '#d82c0d' : P.text, color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', fontFamily: P.font }}>
          {toast.err ? '' : '✓ '}{toast.msg}
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div className="st-topbar">
        <button
          onClick={() => active ? goBack() : router.push('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', padding: 6, borderRadius: 6 }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 624, padding: '0 14px', height: 34, maxWidth: 480, width: '100%' }}>
            <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: P.fontSize, color: 'rgba(255,255,255,0.35)', flex: 1 }}>Search</span>
          </div>
        </div>
        <div style={{ width: 30, height: 30, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
          {initials}
        </div>
      </div>

      {/* ── MAIN SHELL ── */}
      <div className="st-shell">

        {/* ── LEFT NAV — hidden on mobile when a section is active ── */}
        <div className={`st-nav${active ? ' mob-hidden' : ''}`}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill={P.textSubdued}><path d="M11.013 2.513a1.75 1.75 0 0 0-2.027 0l-1.5 1.134a1.75 1.75 0 0 1-.59.28l-1.84.44a1.75 1.75 0 0 0-1.433 1.79l.065 1.9a1.75 1.75 0 0 1-.165.67l-.8 1.7a1.75 1.75 0 0 0 .492 2.21l1.49 1.147a1.75 1.75 0 0 1 .485.572l.84 1.716a1.75 1.75 0 0 0 2.127.817l1.78-.608a1.75 1.75 0 0 1 1.13 0l1.78.608a1.75 1.75 0 0 0 2.127-.817l.84-1.716a1.75 1.75 0 0 1 .485-.572l1.49-1.147a1.75 1.75 0 0 0 .492-2.21l-.8-1.7a1.75 1.75 0 0 1-.165-.67l.065-1.9a1.75 1.75 0 0 0-1.434-1.79l-1.84-.44a1.75 1.75 0 0 1-.59-.28l-1.499-1.134Z"/></svg>
              <span style={{ fontWeight: 650, fontSize: '1rem', color: P.text }}>Settings</span>
            </div>
            {/* Store pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: P.bg, borderRadius: 8, border: `1px solid ${P.border}` }}>
              <div style={{ width: 32, height: 32, background: P.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {seller?.store_name?.[0]?.toUpperCase() || 'O'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: P.fontSize, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.store_name || 'My Store'}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>onshipy.com</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: '6px 10px' }}>
              <svg width="13" height="13" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search settings" style={{ border: 'none', background: 'none', outline: 'none', fontSize: P.fontSize, color: P.text, flex: 1, fontFamily: P.font }}/>
            </div>
          </div>

          {/* Nav list — bigger items on mobile like Shopify */}
          <div style={{ padding: '6px 0' }}>
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => goSection(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', width: '100%', padding: '12px 16px',
                  background: active === item.id ? '#f0f0f0' : 'none',
                  border: 'none', borderBottom: `1px solid ${P.border}`,
                  cursor: 'pointer', fontFamily: P.font, gap: 12,
                  color: active === item.id ? P.text : P.text,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: '0.9375rem', fontWeight: active === item.id ? 600 : 450, letterSpacing: P.letterSpacing }}>{item.label}</span>
                <svg width="14" height="14" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>

          {/* Back to app */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${P.border}` }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: P.textSubdued, fontSize: P.fontSize, fontFamily: P.font, padding: '6px 0', width: '100%' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Onshipy
            </button>
          </div>
        </div>

        {/* ── CONTENT — hidden on mobile when no section selected ── */}
        <div className={`st-content${!active ? ' mob-hidden' : ''}`}>
          {/* Mobile back button */}
          {active && (
            <div style={{ display: 'none' }} className="mob-section-back">
              <button
                onClick={goBack}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '14px 16px', background: P.surface, border: 'none', borderBottom: `1px solid ${P.border}`, cursor: 'pointer', fontSize: P.fontSize, fontFamily: P.font, color: P.textSubdued }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                Settings
              </button>
            </div>
          )}
          <div style={{ padding: 0 }}>
            <SectionContent/>
          </div>
        </div>
      </div>

      {/* Mobile: show back button inside content on small screens */}
      <style>{`
        @media (max-width: 767px) {
          .mob-section-back { display: block !important; }
          .st-content { padding: 0 !important; }
          .st-content > div { padding: 16px; }
        }
      `}</style>
    </>
  );
}