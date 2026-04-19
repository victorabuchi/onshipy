import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Plans() {
  const router = useRouter();
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('onshipy_token');
    const s = localStorage.getItem('onshipy_seller');
    if (!t) { router.push('/login'); return; }
    if (s) setSeller(JSON.parse(s));
  }, []);

  return (
    <Layout>
      <div style={{ padding: '28px 32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: '900px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>Onshipy Plans</h1>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>Choose the plan that works for your business</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['5 product imports', '1 connected store', 'Basic scraper', 'Email support', 'Webhook integration'], color: '#6b7280', current: !seller?.plan || seller?.plan === 'free' },
            { name: 'Pro', price: '$29', period: 'per month', features: ['Unlimited imports', '3 connected stores', 'Priority scraper', 'Auto-buy engine', 'Full analytics', 'Priority support', 'Shopify push'], color: '#00a47c', current: seller?.plan === 'pro', popular: true },
            { name: 'Enterprise', price: '$99', period: 'per month', features: ['Everything in Pro', '10 connected stores', 'API access', 'White label', 'Custom domain', 'Dedicated manager', 'SLA guarantee'], color: '#7c3aed', current: seller?.plan === 'enterprise' },
          ].map((plan, i) => (
            <div key={i} style={{ background: '#fff', border: plan.current ? `2px solid ${plan.color}` : '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              {plan.popular && !plan.current && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#00a47c', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Popular</div>
              )}
              {plan.current && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: plan.color, color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current</div>
              )}
              <div style={{ fontWeight: '700', fontSize: '18px', color: '#111', marginBottom: '4px' }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: plan.color, letterSpacing: '-1px' }}>{plan.price}</span>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>{plan.period}</span>
              </div>
              {plan.features.map((f, fi) => (
                <div key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <svg width="14" height="14" fill="none" stroke="#00a47c" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
              <button
                disabled={plan.current}
                style={{ width: '100%', marginTop: '20px', padding: '11px', background: plan.current ? '#f3f4f6' : plan.color, color: plan.current ? '#9ca3af' : '#fff', border: 'none', borderRadius: '8px', cursor: plan.current ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', fontFamily: 'inherit' }}
              >
                {plan.current ? 'Current plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}