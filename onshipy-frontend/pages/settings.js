import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export default function Settings() {
  const router = useRouter();
  const tokenRef = useRef('');

  const [seller, setSeller] = useState(null);
  const [activeSection, setActiveSection] = useState('general');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    store_name: '',
    store_url: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', error: false });
  const [notificationPrefs, setNotificationPrefs] = useState({
    new_order: true,
    order_shipped: true,
    price_change: true,
    out_of_stock: true,
    auto_buy_failed: true,
    weekly_summary: false
  });

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');

    if (!t) {
      router.push('/login');
      return;
    }

    tokenRef.current = t;

    if (s) {
      const sd = JSON.parse(s);
      setSeller(sd);
      setForm({
        full_name: sd.full_name || '',
        email: sd.email || '',
        store_name: sd.store_name || '',
        store_url: sd.store_url || ''
      });
    }
  }, [router]);

  const showToast = (msg, error = false) => {
    setToast({ show: true, msg, error });
    setTimeout(() => {
      setToast({ show: false, msg: '', error: false });
    }, 4000);
  };

  const handleSave = async (body) => {
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/sellers/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenRef.current}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Save failed', true);
        return;
      }

      const updated = { ...(seller || {}), ...(data.seller || {}) };
      setSeller(updated);
      setForm({
        full_name: updated.full_name || '',
        email: updated.email || '',
        store_name: updated.store_name || '',
        store_url: updated.store_url || ''
      });
      localStorage.setItem('onshipy_seller', JSON.stringify(updated));
      showToast('Changes saved successfully');
    } catch (err) {
      showToast('Connection error: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('Passwords do not match', true);
      return;
    }

    if (passwordForm.new_password.length < 8) {
      showToast('Min 8 characters', true);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/sellers/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenRef.current}`
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed', true);
        return;
      }

      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      showToast('Password updated successfully');
    } catch (err) {
      showToast('Connection error: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const nav = [
    { id: 'general', label: 'General' },
    { id: 'plan', label: 'Plan' },
    { id: 'billing', label: 'Billing' },
    { id: 'users', label: 'Users' },
    { id: 'payments', label: 'Payments' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' }
  ];

  const notifications = [
    { key: 'new_order', label: 'New order received', desc: 'When a customer places an order' },
    { key: 'order_shipped', label: 'Order shipped', desc: 'When tracking is added to an order' },
    { key: 'price_change', label: 'Price change alert', desc: 'When source price changes on your products' },
    { key: 'out_of_stock', label: 'Out of stock', desc: 'When a source product goes out of stock' },
    { key: 'auto_buy_failed', label: 'Auto-buy failed', desc: 'When automatic purchase fails' },
    { key: 'weekly_summary', label: 'Weekly summary', desc: 'Weekly performance report' }
  ];

  const inp = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #c9cccf',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1a1a1a',
    background: '#fff'
  };

  const lbl = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: '5px'
  };

  const card = {
    background: '#fff',
    borderRadius: '10px',
    border: '1px solid #e1e3e5',
    marginBottom: '16px',
    overflow: 'hidden'
  };

  const cardHead = {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f1f1'
  };

  return (
    <Layout>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {toast.show && (
          <div style={{ position: 'fixed', top: '20px', right: '20px', background: toast.error ? '#cc0000' : '#1a1a1a', color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            {toast.error ? '' : '✓ '}
            {toast.msg}
          </div>
        )}

        <div style={{ width: '232px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e1e3e5', padding: '16px 0' }}>
          <div style={{ padding: '8px 16px 16px', borderBottom: '1px solid #f1f1f1', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: '#1a1a2e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                {seller?.store_name?.[0]?.toUpperCase() || 'O'}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a1a' }}>{seller?.store_name || 'My Store'}</div>
                <div style={{ fontSize: '12px', color: '#6d7175' }}>onshipy.com</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 8px' }}>
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '9px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  background: activeSection === item.id ? '#f0fdf6' : 'transparent',
                  color: activeSection === item.id ? '#008060' : '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: activeSection === item.id ? '500' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '1px'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: '#f6f6f7' }}>
          {activeSection === 'general' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>General</h1>

              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Business details</div>
                  <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '2px' }}>Used for payments, markets, and apps</div>
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f1f1', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#f6f6f7', borderRadius: '6px', border: '1px solid #e1e3e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                      {seller?.store_name?.[0] || 'O'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{seller?.store_name || 'My Store'}</div>
                      <div style={{ fontSize: '12px', color: '#6d7175' }}>Store entity</div>
                    </div>
                  </div>
                  <span style={{ color: '#6d7175', fontSize: '18px' }}>›</span>
                </div>
              </div>

              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Store contact details</div>
                </div>

                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={lbl}>Store name</label>
                    <input
                      value={form.store_name}
                      onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                      style={inp}
                      placeholder="My Store"
                    />
                  </div>

                  <div>
                    <label style={lbl}>Contact email</label>
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      type="email"
                      style={inp}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Store URL</label>
                    <div style={{ display: 'flex', border: '1px solid #c9cccf', borderRadius: '8px', overflow: 'hidden' }}>
                      <span style={{ padding: '9px 12px', background: '#f6f6f7', fontSize: '13px', color: '#6d7175', borderRight: '1px solid #c9cccf', whiteSpace: 'nowrap' }}>
                        onshipy.com/store/
                      </span>
                      <input
                        value={form.store_url}
                        onChange={(e) => setForm({ ...form, store_url: e.target.value })}
                        style={{ flex: 1, padding: '9px 12px', border: 'none', outline: 'none', fontSize: '14px' }}
                        placeholder="my-store"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleSave(form)}
                    disabled={saving}
                    style={{ padding: '9px 20px', background: saving ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Users</h1>

              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Store owner</div>
                  <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '2px' }}>Manage your profile and account</div>
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f1f1' }}>
                    <div style={{ width: '56px', height: '56px', background: '#008060', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: '700', flexShrink: 0 }}>
                      {seller?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{seller?.full_name}</div>
                      <div style={{ fontSize: '13px', color: '#6d7175' }}>{seller?.email}</div>
                      <div style={{ fontSize: '12px', color: '#008060', fontWeight: '500', marginTop: '3px' }}>Store owner</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={lbl}>Full name</label>
                      <input
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                        style={inp}
                      />
                    </div>

                    <div>
                      <label style={lbl}>Email address</label>
                      <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        type="email"
                        style={inp}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleSave({
                        full_name: form.full_name,
                        email: form.email,
                        store_name: form.store_name,
                        store_url: form.store_url
                      })
                    }
                    disabled={saving}
                    style={{ padding: '9px 20px', background: saving ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Security</h1>

              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Change password</div>
                </div>

                <div style={{ padding: '20px', maxWidth: '400px' }}>
                  {[
                    { label: 'Current password', key: 'current_password' },
                    { label: 'New password', key: 'new_password' },
                    { label: 'Confirm new password', key: 'confirm_password' }
                  ].map((f) => (
                    <div key={f.key} style={{ marginBottom: '14px' }}>
                      <label style={lbl}>{f.label}</label>
                      <input
                        type="password"
                        value={passwordForm[f.key]}
                        onChange={(e) => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                        style={inp}
                        placeholder="••••••••"
                      />
                    </div>
                  ))}

                  <button
                    onClick={handlePassword}
                    disabled={saving}
                    style={{ padding: '9px 20px', background: saving ? '#c9cccf' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}
                  >
                    {saving ? 'Updating...' : 'Update password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'plan' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Plan</h1>
              <div style={card}>
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
                  {[
                    { name: 'Free', price: '$0/mo', features: ['5 products', '1 store', 'Basic support'], color: '#6d7175', current: !seller?.plan || seller?.plan === 'free' },
                    { name: 'Pro', price: '$29/mo', features: ['Unlimited products', '3 stores', 'Auto-buy engine', 'Priority support', 'Analytics'], color: '#008060', current: seller?.plan === 'pro' },
                    { name: 'Enterprise', price: '$99/mo', features: ['Everything in Pro', '10 stores', 'API access', 'White label', 'Dedicated support'], color: '#6d28d9', current: seller?.plan === 'enterprise' }
                  ].map((plan, i) => (
                    <div key={i} style={{ border: plan.current ? `2px solid ${plan.color}` : '1px solid #e1e3e5', borderRadius: '10px', padding: '18px', position: 'relative' }}>
                      {plan.current && (
                        <div style={{ position: 'absolute', top: '-10px', left: '14px', background: plan.color, color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                          CURRENT
                        </div>
                      )}
                      <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{plan.name}</div>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: plan.color, marginBottom: '14px' }}>{plan.price}</div>
                      {plan.features.map((f, fi) => (
                        <div key={fi} style={{ fontSize: '13px', color: '#6d7175', marginBottom: '5px', display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#008060' }}>✓</span>
                          {f}
                        </div>
                      ))}
                      {!plan.current && (
                        <button style={{ width: '100%', marginTop: '14px', padding: '8px', background: plan.color, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                          Upgrade
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'billing' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Billing</h1>
              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Payment method</div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ border: '1px solid #e1e3e5', borderRadius: '8px', padding: '14px 16px', marginBottom: '14px', fontSize: '14px', color: '#6d7175' }}>
                    No payment method added yet
                  </div>
                  <button style={{ padding: '9px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '14px' }}>
                    Add payment method
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Payments</h1>
              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Payment providers</div>
                </div>
                <div style={{ padding: '4px 0' }}>
                  {[
                    { name: 'Stripe', desc: 'Accept credit cards, Apple Pay, Google Pay' },
                    { name: 'PayPal', desc: 'Accept PayPal and Venmo' },
                    { name: 'Paystack', desc: 'Payments in Africa' }
                  ].map((p, i, arr) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid #f1f1f1' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{p.name}</div>
                        <div style={{ fontSize: '13px', color: '#6d7175' }}>{p.desc}</div>
                      </div>
                      <button style={{ padding: '7px 16px', background: '#fff', border: '1px solid #c9cccf', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Notifications</h1>
              <div style={card}>
                <div style={cardHead}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Email notifications</div>
                </div>
                <div>
                  {notifications.map((n, i, arr) => {
                    const on = !!notificationPrefs[n.key];
                    return (
                      <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid #f1f1f1' : 'none' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{n.label}</div>
                          <div style={{ fontSize: '13px', color: '#6d7175', marginTop: '2px' }}>{n.desc}</div>
                        </div>

                        <div
                          onClick={() =>
                            setNotificationPrefs((prev) => ({
                              ...prev,
                              [n.key]: !prev[n.key]
                            }))
                          }
                          style={{ width: '40px', height: '22px', background: on ? '#008060' : '#c9cccf', borderRadius: '11px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                        >
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