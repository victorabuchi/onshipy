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

const NAV = [
  { id: 'general',           label: 'General' },
  { id: 'plan',              label: 'Plan' },
  { id: 'billing',           label: 'Billing' },
  { id: 'users',             label: 'Users' },
  { id: 'payments',          label: 'Payments' },
  { id: 'checkout',          label: 'Checkout' },
  { id: 'customer-accounts', label: 'Customer accounts' },
  { id: 'shipping',          label: 'Shipping and delivery' },
  { id: 'taxes',             label: 'Taxes and duties' },
  { id: 'locations',         label: 'Locations' },
  { id: 'notifications',     label: 'Notifications' },
  { id: 'domains',           label: 'Domains' },
  { id: 'languages',         label: 'Languages' },
  { id: 'policies',          label: 'Policies' },
  { id: 'security',          label: 'Security' },
];

// Reusable components
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

const Inp = ({ label, value, onChange, type = 'text', placeholder, hint, prefix, readOnly }) => (
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
    {hint && <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 4 }}>{hint}</div>}
  </div>
);

const SaveBtn = ({ onClick, saving, label = 'Save' }) => (
  <button onClick={onClick} disabled={saving} style={{
    padding: '7px 18px', background: saving ? P.bg : P.text, color: saving ? P.textSubdued : '#fff',
    border: `1px solid ${P.border}`, borderRadius: 8, fontSize: P.fontSize, fontWeight: 500,
    cursor: saving ? 'not-allowed' : 'pointer', fontFamily: P.font, letterSpacing: P.letterSpacing,
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
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, background: P.bg, borderRadius: 12, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.border}` }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill={P.textSubdued}><path d="M11.013 2.513a1.75 1.75 0 0 0-2.027 0l-1.5 1.134a1.75 1.75 0 0 1-.59.28l-1.84.44a1.75 1.75 0 0 0-1.433 1.79l.065 1.9a1.75 1.75 0 0 1-.165.67l-.8 1.7a1.75 1.75 0 0 0 .492 2.21l1.49 1.147a1.75 1.75 0 0 1 .485.572l.84 1.716a1.75 1.75 0 0 0 2.127.817l1.78-.608a1.75 1.75 0 0 1 1.13 0l1.78.608a1.75 1.75 0 0 0 2.127-.817l.84-1.716a1.75 1.75 0 0 1 .485-.572l1.49-1.147a1.75 1.75 0 0 0 .492-2.21l-.8-1.7a1.75 1.75 0 0 1-.165-.67l.065-1.9a1.75 1.75 0 0 0-1.434-1.79l-1.84-.44a1.75 1.75 0 0 1-.59-.28l-1.499-1.134ZM10 7.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z"/></svg>
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text, marginBottom: 6 }}>{title} settings</div>
        <div style={{ fontSize: P.fontSize, color: P.textSubdued }}>This section is coming soon.</div>
      </div>
    </Card>
  </div>
);

export default function Settings() {
  const router = useRouter();
  const active = router.query.section || 'general';
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
      showToast('Changes saved successfully');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const handlePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm_password) { showToast('Passwords do not match', true); return; }
    if (pwForm.new_password.length < 8) { showToast('Minimum 8 characters', true); return; }
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
      showToast('Password updated successfully');
    } catch { showToast('Connection error', true); }
    setSaving(false);
  };

  const initials = seller?.full_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <Layout title="Settings">
      <style>{`
        .s-nav-btn { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; font-size: ${P.fontSize}; color: ${P.textSubdued}; cursor: pointer; border: none; background: none; width: 100%; text-align: left; font-family: ${P.font}; letter-spacing: ${P.letterSpacing}; border-radius: 8px; transition: background .1s, color .1s; font-weight: ${P.fontWeight}; }
        .s-nav-btn:hover { background: #f0f0f0; color: ${P.text}; }
        .s-nav-btn.active { background: #e8e8e8; color: ${P.text}; font-weight: 600; }
        .row-hover:hover { background: #fafafa !important; }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: toast.err ? '#d82c0d' : P.text, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: P.fontSize, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', fontFamily: P.font }}>
          {toast.err ? '' : '✓ '}{toast.msg}
        </div>
      )}

      {/* Full-width settings layout — overrides normal page padding */}
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)', fontFamily: P.font, fontSize: P.fontSize, letterSpacing: P.letterSpacing, color: P.text }}>

        {/* ── Settings left nav ── */}
        <div style={{ width: 280, flexShrink: 0, background: P.surface, borderRight: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

          {/* Store avatar + info */}
          <div style={{ padding: '16px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: P.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {seller?.store_name?.[0]?.toUpperCase() || 'N'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 650, fontSize: P.fontSize, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seller?.store_name || 'My Store'}</div>
                <div style={{ fontSize: '0.75rem', color: P.textSubdued }}>onshipy.com</div>
              </div>
            </div>
          </div>

          {/* Search settings */}
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: '6px 10px' }}>
              <svg width="13" height="13" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search settings" style={{ border: 'none', background: 'none', outline: 'none', fontSize: P.fontSize, color: P.text, flex: 1, fontFamily: P.font, letterSpacing: P.letterSpacing }}/>
            </div>
          </div>

          {/* Nav items */}
          <div style={{ padding: '6px 8px', flex: 1 }}>
            {NAV.map(item => (
              <button key={item.id}
                onClick={() => router.push(`/settings?section=${item.id}`, undefined, { shallow: true })}
                className={`s-nav-btn${active === item.id ? ' active' : ''}`}
              >
                {item.label}
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0.3, flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </div>

        {/* ── Settings content ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: P.bg, padding: '24px 28px 60px' }}>

          {/* GENERAL */}
          {active === 'general' && (
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>General</h1>
              <Card>
                <CardHead title="Store contact details" subtitle="Used for customer communications and account management"/>
                <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <Inp label="Store name" value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} placeholder="Neaoma"/>
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
                      <option>USD — US Dollar</option>
                      <option>EUR — Euro</option>
                      <option>GBP — British Pound</option>
                      <option>NGN — Nigerian Naira</option>
                      <option>CAD — Canadian Dollar</option>
                      <option>AUD — Australian Dollar</option>
                    </select>
                  </div>
                </div>
                <div style={{ padding: '0 20px 18px', display: 'flex', justifyContent: 'flex-end' }}>
                  <SaveBtn onClick={() => showToast('Saved')} saving={saving}/>
                </div>
              </Card>
            </div>
          )}

          {/* PLAN */}
          {active === 'plan' && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: 0, letterSpacing: '-0.02em' }}>Plan</h1>
              </div>

              {/* Current plan banner */}
              <Card>
                <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: P.text }}>Onshipy {seller?.plan ? seller.plan.charAt(0).toUpperCase() + seller.plan.slice(1) : 'Free'}</div>
                    <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>Your current plan</div>
                  </div>
                  <span style={{ padding: '3px 12px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {seller?.plan || 'free'}
                  </span>
                </div>
              </Card>

              {/* Plan cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {[
                  { id: 'free', name: 'Free', price: '$0', period: 'forever', color: P.textSubdued, features: ['5 product imports', '1 connected store', 'Basic scraper', 'Email support', 'Webhook integration'] },
                  { id: 'pro', name: 'Pro', price: '$29', period: 'per month', color: P.green, popular: true, features: ['Unlimited imports', '3 connected stores', 'Priority scraper', 'Auto-buy engine', 'Full analytics', 'Priority support', 'Shopify push'] },
                  { id: 'enterprise', name: 'Enterprise', price: '$99', period: 'per month', color: '#7c3aed', features: ['Everything in Pro', '10 connected stores', 'API access', 'White label', 'Custom domain', 'Dedicated manager', 'SLA guarantee'] },
                ].map((plan) => {
                  const isCurrent = (seller?.plan || 'free') === plan.id;
                  return (
                    <div key={plan.id} style={{ background: P.surface, borderRadius: 12, border: isCurrent ? `2px solid ${plan.color}` : `1px solid ${P.border}`, padding: '20px', position: 'relative' }}>
                      {plan.popular && !isCurrent && (
                        <div style={{ position: 'absolute', top: -10, right: 14, background: P.green, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>POPULAR</div>
                      )}
                      {isCurrent && (
                        <div style={{ position: 'absolute', top: -10, left: 14, background: P.textSubdued, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CURRENT</div>
                      )}
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: P.text, marginBottom: 2 }}>{plan.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: plan.color, letterSpacing: '-0.03em' }}>{plan.price}</span>
                        <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>{plan.period}</span>
                      </div>
                      {plan.features.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: P.fontSize, color: P.textSubdued }}>
                          <svg width="14" height="14" viewBox="0 0 20 20" fill={P.green} style={{ flexShrink: 0, marginTop: 1 }}><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"/></svg>
                          {f}
                        </div>
                      ))}
                      {!isCurrent && (
                        <button style={{ width: '100%', marginTop: 16, padding: '8px', background: plan.color, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: P.fontSize, fontFamily: P.font, letterSpacing: P.letterSpacing }}>
                          Upgrade to {plan.name}
                        </button>
                      )}
                      {isCurrent && (
                        <button disabled style={{ width: '100%', marginTop: 16, padding: '8px', background: P.bg, color: P.textSubdued, border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'not-allowed', fontWeight: 500, fontSize: P.fontSize, fontFamily: P.font }}>
                          Current plan
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BILLING */}
          {active === 'billing' && (
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Billing</h1>
              <Card>
                <CardHead title="Payment method"/>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 14, fontSize: P.fontSize, color: P.textSubdued }}>
                    No payment method added yet
                  </div>
                  <button style={{ padding: '7px 16px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>
                    Add payment method
                  </button>
                </div>
              </Card>
              <Card>
                <CardHead title="Billing history"/>
                <div style={{ padding: '60px 40px', textAlign: 'center', color: P.textSubdued, fontSize: P.fontSize }}>
                  No billing history yet
                </div>
              </Card>
            </div>
          )}

          {/* USERS */}
          {active === 'users' && (
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Users</h1>
              <Card>
                <CardHead title="Store owner" subtitle="Manage your account details"/>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${P.border}` }}>
                    <div style={{ width: 50, height: 50, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.125rem', fontWeight: 700, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 650, fontSize: '0.9375rem', color: P.text }}>{seller?.full_name}</div>
                      <div style={{ fontSize: P.fontSize, color: P.textSubdued, marginTop: 2 }}>{seller?.email}</div>
                      <span style={{ display: 'inline-block', marginTop: 4, fontSize: '0.6875rem', padding: '2px 8px', background: '#cdfed4', color: '#006847', borderRadius: 20, fontWeight: 600, textTransform: 'uppercase' }}>
                        {seller?.plan || 'free'} plan
                      </span>
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
          )}

          {/* PAYMENTS */}
          {active === 'payments' && (
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Payments</h1>
              <Card>
                <CardHead title="Payment providers" subtitle="Accept payments from your customers"/>
                {[
                  { name: 'Stripe', desc: 'Accept credit cards, Apple Pay, Google Pay worldwide', status: 'Connect' },
                  { name: 'PayPal', desc: 'Accept PayPal and Venmo payments', status: 'Connect' },
                  { name: 'Paystack', desc: 'Accept payments across Africa — cards, bank transfer, USSD', status: 'Connect' },
                ].map((p, i, arr) => (
                  <div key={i} className="row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none', background: P.surface }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>{p.desc}</div>
                    </div>
                    <button style={{ padding: '6px 14px', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font, color: P.text }}>
                      {p.status}
                    </button>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {active === 'notifications' && (
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Notifications</h1>
              <Card>
                <CardHead title="Email notifications" subtitle="Choose which events trigger an email to you"/>
                {[
                  { key: 'new_order', label: 'New order received', desc: 'When a customer places an order' },
                  { key: 'order_shipped', label: 'Order shipped', desc: 'When tracking is added to an order' },
                  { key: 'price_change', label: 'Price change alert', desc: 'When source price changes on imported products' },
                  { key: 'out_of_stock', label: 'Out of stock alert', desc: 'When a source product goes out of stock' },
                  { key: 'auto_buy_failed', label: 'Auto-buy failed', desc: 'When automatic purchase fails' },
                  { key: 'weekly_summary', label: 'Weekly summary', desc: 'Weekly performance report' },
                  { key: 'marketing', label: 'Marketing emails', desc: 'Tips, updates and new features' },
                ].map((n, i, arr) => (
                  <div key={n.key} className="row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none', background: P.surface }}>
                    <div>
                      <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>{n.label}</div>
                      <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>{n.desc}</div>
                    </div>
                    <Toggle on={notifs[n.key]} onChange={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}/>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* DOMAINS */}
          {active === 'domains' && (
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Domains</h1>
              <Card>
                <CardHead title="Your domains"/>
                <div style={{ padding: '18px 20px' }}>
                  {[
                    { domain: 'onshipy.com', type: 'Primary domain', status: 'Active' },
                    { domain: 'api.onshipy.com', type: 'API subdomain', status: 'Active' },
                    { domain: 'www.onshipy.com', type: 'Redirect', status: 'Active' },
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: P.bg, borderRadius: 8, marginBottom: 8, border: `1px solid ${P.border}` }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: P.fontSize, color: P.text }}>{d.domain}</div>
                        <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 1 }}>{d.type}</div>
                      </div>
                      <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>{d.status}</span>
                    </div>
                  ))}
                  <button style={{ marginTop: 8, padding: '7px 16px', background: P.text, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: P.fontSize, fontWeight: 500, fontFamily: P.font }}>
                    Connect existing domain
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* POLICIES */}
          {active === 'policies' && (
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Policies</h1>
              <Card>
                <CardHead title="Store policies" subtitle="Add policies to build trust with your customers"/>
                {['Refund policy', 'Privacy policy', 'Terms of service', 'Shipping policy', 'Contact information'].map((policy, i, arr) => (
                  <div key={i} className="row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none', cursor: 'pointer', background: P.surface }}>
                    <div style={{ fontSize: P.fontSize, fontWeight: 500, color: P.text }}>{policy}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: P.fontSize, color: P.textSubdued }}>Not created</span>
                      <svg width="12" height="12" fill="none" stroke={P.textSubdued} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* SECURITY */}
          {active === 'security' && (
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 650, color: P.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Security</h1>
              <Card>
                <CardHead title="Change password" subtitle="Use a strong password of at least 8 characters"/>
                <div style={{ padding: '18px 20px', maxWidth: 400 }}>
                  {[
                    { label: 'Current password', key: 'current_password' },
                    { label: 'New password', key: 'new_password' },
                    { label: 'Confirm new password', key: 'confirm_password' },
                  ].map(f => (
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
                    <div style={{ fontSize: '0.75rem', color: P.textSubdued, marginTop: 2 }}>Active now · {typeof navigator !== 'undefined' ? navigator.platform : 'Desktop'}</div>
                  </div>
                  <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 20, background: '#cdfed4', color: '#006847', fontWeight: 600 }}>Active</span>
                </div>
              </Card>
            </div>
          )}

          {/* COMING SOON sections */}
          {active === 'checkout' && <ComingSoon title="Checkout"/>}
          {active === 'customer-accounts' && <ComingSoon title="Customer accounts"/>}
          {active === 'shipping' && <ComingSoon title="Shipping and delivery"/>}
          {active === 'taxes' && <ComingSoon title="Taxes and duties"/>}
          {active === 'locations' && <ComingSoon title="Locations"/>}
          {active === 'languages' && <ComingSoon title="Languages"/>}
        </div>
      </div>
    </Layout>
  );
}