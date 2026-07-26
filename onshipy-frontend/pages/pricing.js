import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { CheckIcon } from '@heroicons/react/24/outline';
import AuthNav from '../components/AuthNav';
import AuthFooter from '../components/AuthFooter';

const PLANS = [
  { id: 'free', name: 'Free', price: '$0', period: 'forever', color: 'rgba(255,255,255,0.6)', features: ['5 product imports', '1 connected store', 'Basic scraper', 'Email support'] },
  { id: 'pro', name: 'Pro', price: '$29', period: 'per month', color: '#00b86c', popular: true, features: ['Unlimited imports', '3 stores', 'Auto-buy engine', 'Analytics', 'Priority support'] },
  { id: 'enterprise', name: 'Enterprise', price: '$99', period: 'per month', color: '#7c3aed', features: ['Everything in Pro', '10 stores', 'API access', 'White label', 'Dedicated manager'] },
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes. There are no contracts. Downgrade or cancel your plan at any time from your account settings.' },
  { q: 'What happens if I hit my import limit on the Free plan?', a: "You'll be prompted to upgrade to Pro for unlimited imports. Products you've already imported stay live." },
  { q: 'Do you take a cut of my sales?', a: 'No. Your subscription is the only fee. You keep 100% of the margin between the source price and your price.' },
  { q: 'Is Shopify integration included in every plan?', a: 'Yes, Shopify sync is available on all plans, including Free.' },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <Head>
        <title>Onshipy Pricing: Plans for every seller</title>
        <meta name="description" content="Simple, transparent pricing. Start free, upgrade to Pro or Enterprise as you grow." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { width:100%; min-height:100vh; background:#1a1a1a; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }
        .pricing-shell { display:flex; flex-direction:column; min-height:100vh; }

        .pricing-hero { padding:72px 32px 24px; text-align:center; }
        .pricing-title { font-size:44px; font-weight:900; color:#fff; letter-spacing:-1.5px; margin-bottom:14px; }
        .pricing-sub { font-size:16px; color:rgba(255,255,255,0.45); max-width:480px; margin:0 auto; line-height:1.6; }

        .plans-row { max-width:1040px; margin:48px auto 0; padding:0 32px; display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .plan-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:28px; position:relative; display:flex; flex-direction:column; }
        .plan-card.popular { border-color:rgba(0,184,124,0.4); background:rgba(0,184,124,0.04); }
        .plan-badge { position:absolute; top:-12px; left:28px; background:#00b86c; color:#1a1a1a; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; padding:4px 10px; border-radius:20px; }
        .plan-name { font-size:15px; font-weight:700; color:#fff; margin-bottom:6px; }
        .plan-price { font-size:36px; font-weight:800; letter-spacing:-1px; }
        .plan-period { font-size:13px; color:rgba(255,255,255,0.35); margin-left:6px; }
        .plan-features { list-style:none; margin:24px 0 28px; display:flex; flex-direction:column; gap:11px; flex:1; }
        .plan-features li { display:flex; align-items:flex-start; gap:9px; font-size:13px; color:rgba(255,255,255,0.65); line-height:1.4; }
        .plan-features svg { color:#00b86c; flex-shrink:0; margin-top:1px; }
        .plan-cta { display:block; text-align:center; padding:12px; border-radius:24px; font-size:14px; font-weight:700; text-decoration:none; transition:opacity .15s; }
        .plan-cta.solid { background:#fff; color:#1a1a1a; }
        .plan-cta.outline { background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.2); }
        .plan-cta:hover { opacity:0.85; }

        .faq-section { max-width:720px; margin:88px auto 0; padding:0 32px; width:100%; }
        .faq-title { font-size:26px; font-weight:800; color:#fff; letter-spacing:-0.5px; margin-bottom:24px; text-align:center; }
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.08); }
        .faq-q { width:100%; text-align:left; background:none; border:none; padding:18px 0; font-size:15px; font-weight:600; color:#fff; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-family:inherit; }
        .faq-a { font-size:13px; color:rgba(255,255,255,0.5); line-height:1.6; padding-bottom:18px; max-width:600px; }

        .pricing-cta-band { text-align:center; padding:96px 32px; margin-top:40px; }
        .pricing-cta-band h2 { font-size:30px; font-weight:800; color:#fff; letter-spacing:-0.7px; margin-bottom:14px; }
        .pricing-cta-band p { font-size:14px; color:rgba(255,255,255,0.45); margin-bottom:28px; }

        @media (max-width:800px) {
          .plans-row { grid-template-columns:1fr; }
          .pricing-title { font-size:32px; }
        }
      `}</style>

      <div className="pricing-shell">
        <AuthNav startHref="/register" />

        <section className="pricing-hero">
          <h1 className="pricing-title">Simple pricing, no surprises.</h1>
          <p className="pricing-sub">Start free. Upgrade to Pro or Enterprise whenever your store is ready to grow.</p>
        </section>

        <section className="plans-row">
          {PLANS.map(plan => (
            <div key={plan.id} className={`plan-card${plan.popular ? ' popular' : ''}`}>
              {plan.popular && <span className="plan-badge">Popular</span>}
              <div className="plan-name">{plan.name}</div>
              <div>
                <span className="plan-price" style={{ color: plan.color }}>{plan.price}</span>
                <span className="plan-period">{plan.period}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f}><CheckIcon width={15} height={15} />{f}</li>
                ))}
              </ul>
              <Link href="/register" className={`plan-cta ${plan.popular ? 'solid' : 'outline'}`}>
                Start for free
              </Link>
            </div>
          ))}
        </section>

        <section className="faq-section">
          <h2 className="faq-title">Frequently asked questions</h2>
          {FAQS.map((f, i) => (
            <div key={f.q} className="faq-item">
              <button className="faq-q" onClick={() => setOpenFaq(o => (o === i ? null : i))}>
                {f.q}
                <span>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </section>

        <section className="pricing-cta-band">
          <h2>Ready to start selling?</h2>
          <p>Join thousands of sellers already importing and shipping automatically.</p>
          <Link href="/register" className="plan-cta solid" style={{ display: 'inline-block', padding: '14px 32px' }}>
            Create your account
          </Link>
        </section>

        <AuthFooter />
      </div>
    </>
  );
}
