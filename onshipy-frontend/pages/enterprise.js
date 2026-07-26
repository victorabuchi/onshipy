import Link from 'next/link';
import Head from 'next/head';
import { BuildingOffice2Icon, KeyIcon, SwatchIcon, UsersIcon, PhoneIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import AuthNav from '../components/AuthNav';
import AuthFooter from '../components/AuthFooter';

const PERKS = [
  { Icon: BuildingOffice2Icon, title: '10 connected stores', desc: 'Run multiple storefronts from a single account.' },
  { Icon: KeyIcon,             title: 'API access',          desc: 'Integrate imports, pricing and orders into your own tools.' },
  { Icon: SwatchIcon,          title: 'White label',         desc: 'Remove Onshipy branding from customer-facing pages.' },
  { Icon: UsersIcon,           title: 'Dedicated manager',    desc: 'A single point of contact who knows your setup.' },
  { Icon: PhoneIcon,           title: 'Priority support',     desc: 'Faster response times, direct line to our team.' },
  { Icon: ChartBarIcon,        title: 'Advanced analytics',   desc: 'Deeper reporting across every store you run.' },
];

export default function Enterprise() {
  return (
    <>
      <Head>
        <title>Onshipy Enterprise: Built for scale</title>
        <meta name="description" content="Dedicated support, API access and white-label tools for sellers running multiple stores at scale." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { width:100%; min-height:100vh; background:#1a1a1a; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; -webkit-font-smoothing:antialiased; }
        .ent-shell { display:flex; flex-direction:column; min-height:100vh; }

        .ent-hero { padding:80px 32px 56px; text-align:center; }
        .ent-eyebrow { font-size:11px; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:.1em; margin-bottom:14px; }
        .ent-title { font-size:44px; font-weight:900; color:#fff; letter-spacing:-1.5px; margin-bottom:16px; }
        .ent-sub { font-size:16px; color:rgba(255,255,255,0.45); max-width:520px; margin:0 auto 32px; line-height:1.6; }
        .ent-cta-row { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
        .btn-primary { padding:14px 28px; background:#fff; color:#1a1a1a; border-radius:26px; font-size:15px; font-weight:700; text-decoration:none; transition:opacity .15s; }
        .btn-primary:hover { opacity:.88; }
        .btn-secondary { padding:13px 24px; background:transparent; color:rgba(255,255,255,0.65); border:1px solid rgba(255,255,255,0.15); border-radius:26px; font-size:15px; font-weight:600; text-decoration:none; transition:color .15s, border-color .15s; }
        .btn-secondary:hover { color:#fff; border-color:rgba(255,255,255,0.35); }

        .perk-grid { max-width:1100px; margin:0 auto; padding:24px 32px 96px; display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .perk-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:24px; }
        .perk-icon { width:38px; height:38px; border-radius:10px; background:rgba(124,58,237,0.14); color:#7c3aed; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
        .perk-card h3 { font-size:16px; font-weight:700; color:#fff; margin-bottom:8px; letter-spacing:-0.2px; }
        .perk-card p { font-size:13px; color:rgba(255,255,255,0.45); line-height:1.6; }

        .ent-band { text-align:center; padding:80px 32px; border-top:1px solid rgba(255,255,255,0.07); }
        .ent-band h2 { font-size:28px; font-weight:800; color:#fff; letter-spacing:-0.6px; margin-bottom:14px; }
        .ent-band p { font-size:14px; color:rgba(255,255,255,0.45); margin-bottom:28px; }

        @media (max-width:800px) {
          .perk-grid { grid-template-columns:1fr; }
          .ent-title { font-size:32px; }
        }
        @media (min-width:801px) and (max-width:1000px) {
          .perk-grid { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="ent-shell">
        <AuthNav startHref="/register" />

        <section className="ent-hero">
          <div className="ent-eyebrow">Enterprise</div>
          <h1 className="ent-title">Built for sellers who scale.</h1>
          <p className="ent-sub">
            Run more stores, move faster with the API, and get a dedicated manager who knows your setup.
            Everything in Pro, plus the tools larger operations need.
          </p>
          <div className="ent-cta-row">
            <Link href="/register" className="btn-primary">Start for free</Link>
            <Link href="/pricing" className="btn-secondary">Compare plans</Link>
          </div>
        </section>

        <section className="perk-grid">
          {PERKS.map(p => (
            <div key={p.title} className="perk-card">
              <div className="perk-icon"><p.Icon width={20} height={20} /></div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </section>

        <section className="ent-band">
          <h2>Talk to us about your store.</h2>
          <p>Enterprise accounts start at $99/month, billed the same way as every other plan.</p>
          <Link href="/register" className="btn-primary">Get started</Link>
        </section>

        <AuthFooter />
      </div>
    </>
  );
}
