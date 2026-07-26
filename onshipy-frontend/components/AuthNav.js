import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  CloudArrowDownIcon, TagIcon, ShoppingBagIcon,
  TruckIcon, MapPinIcon, ChartBarIcon,
  CheckBadgeIcon, ShieldCheckIcon, LockClosedIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const MEGA_COLUMNS = [
  {
    heading: 'SELL',
    items: [
      { Icon: CloudArrowDownIcon, title: 'Import',       desc: 'Pull products from 1,000+ stores' },
      { Icon: TagIcon,            title: 'Price & sell',  desc: 'Set your margin, publish instantly' },
      { Icon: ShoppingBagIcon,    title: 'Shopify sync',  desc: 'Keep your storefront up to date' },
    ],
  },
  {
    heading: 'OPERATE',
    items: [
      { Icon: TruckIcon,   title: 'Fulfillment',    desc: 'Auto purchase & ship on every order' },
      { Icon: MapPinIcon,  title: 'Order tracking',  desc: 'Live status from source to customer' },
      { Icon: ChartBarIcon, title: 'Analytics',      desc: 'Profit per sale, per store, per day' },
    ],
  },
  {
    heading: 'TRUST & SECURITY',
    items: [
      { Icon: CheckBadgeIcon,  title: 'Verified suppliers', desc: 'Every source store is vetted' },
      { Icon: ShieldCheckIcon, title: 'Buyer protection',   desc: 'Orders tracked end-to-end' },
      { Icon: LockClosedIcon,  title: 'Secure payments',    desc: 'Encrypted checkout, always' },
    ],
  },
  {
    heading: 'EXPLORE',
    items: [
      { title: 'Why Onshipy', href: '#' },
      { title: 'Pricing', href: '#' },
      { title: 'Blog', href: '#' },
      { title: 'Changelog', href: '#' },
      { title: 'Help Center', href: '#' },
    ],
  },
];

export default function AuthNav({ startHref = '/register', loginHref = '/login' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <nav className="auth-nav">
      <style>{`
        .auth-nav {
          background:#1a1a1a; height:60px; display:flex; align-items:center;
          padding:0 32px; border-bottom:1px solid rgba(255,255,255,0.07);
          position:sticky; top:0; z-index:100; flex-shrink:0; gap:12px;
          font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
        }
        .auth-nav-logo { display:flex; align-items:center; gap:9px; text-decoration:none; flex-shrink:0; }
        .auth-nav-links { display:flex; align-items:center; gap:2px; flex:1; min-width:0; }
        .auth-nav-link {
          padding:6px 11px; font-size:13px; font-weight:500; color:rgba(255,255,255,0.6);
          text-decoration:none; border-radius:7px; white-space:nowrap; transition:color 0.15s;
        }
        .auth-nav-link:hover { color:#fff; }

        .auth-nav-trigger {
          display:flex; align-items:center; gap:4px; padding:6px 11px; font-size:13px; font-weight:500;
          color:rgba(255,255,255,0.6); background:none; border:none; border-radius:7px; cursor:pointer;
          font-family:inherit; transition:color 0.15s;
        }
        .auth-nav-trigger:hover, .auth-nav-trigger[data-open="true"] { color:#fff; }
        .auth-nav-trigger svg { transition:transform 0.15s; }
        .auth-nav-trigger[data-open="true"] svg { transform:rotate(180deg); }

        .mega-panel {
          position:absolute; top:calc(100% + 1px); left:0; right:0;
          background:#181818; border-bottom:1px solid rgba(255,255,255,0.08);
          box-shadow:0 24px 48px rgba(0,0,0,0.45);
          padding:36px 0;
        }
        .mega-panel-inner { max-width:1200px; margin:0 auto; padding:0 32px; display:grid; grid-template-columns:repeat(4,1fr); gap:32px; }
        .mega-col-heading { font-size:10px; font-weight:700; color:rgba(255,255,255,0.3); text-transform:uppercase; letter-spacing:.1em; margin-bottom:18px; }
        .mega-item { display:flex; align-items:flex-start; gap:10px; padding:8px 0; text-decoration:none; }
        .mega-item + .mega-item { margin-top:2px; }
        .mega-item-icon { width:28px; height:28px; border-radius:7px; background:rgba(0,184,124,0.12); color:#00b86c; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .mega-item-title { font-size:13px; font-weight:600; color:#fff; }
        .mega-item-desc { font-size:11px; color:rgba(255,255,255,0.4); margin-top:1px; }
        .mega-plain-link { display:block; padding:6px 0; font-size:13px; color:rgba(255,255,255,0.55); text-decoration:none; transition:color 0.15s; }
        .mega-plain-link:hover { color:#fff; }

        .auth-nav-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .auth-nav-login {
          padding:7px 16px; font-size:13px; font-weight:600; color:rgba(255,255,255,0.75);
          text-decoration:none; border-radius:8px; white-space:nowrap; transition:color 0.15s;
        }
        .auth-nav-login:hover { color:#fff; }
        .auth-nav-cta {
          padding:8px 20px; font-size:13px; font-weight:700; color:#1a1a1a; background:#fff;
          text-decoration:none; border-radius:24px; white-space:nowrap; transition:opacity 0.15s;
        }
        .auth-nav-cta:hover { opacity:0.88; }

        @media (max-width:900px) {
          .mega-panel-inner { grid-template-columns:repeat(2,1fr); gap:28px; }
        }

        @media (max-width:640px) {
          .auth-nav { padding:0 16px; gap:8px; }
          .auth-nav-links { display:none; }
          .auth-nav-login { padding:7px 12px; font-size:12px; }
          .auth-nav-cta { padding:7px 14px; font-size:12px; }
        }
      `}</style>

      {/* Logo */}
      <Link href="/" className="auth-nav-logo">
        <img src="/favicon-32x32.png" alt="Onshipy" width={22} height={22} style={{ filter:'brightness(0) invert(1)', flexShrink:0 }} />
        <span style={{ fontSize:17, fontWeight:800, color:'#fff', letterSpacing:'-0.4px' }}>Onshipy</span>
      </Link>

      {/* Nav links */}
      <div className="auth-nav-links" ref={wrapRef}>
        <button type="button" className="auth-nav-trigger" data-open={open} onClick={() => setOpen(o => !o)}>
          Features
          <ChevronDownIcon width={13} height={13} />
        </button>
        <a href="#" className="auth-nav-link">Pricing</a>
        <a href="#" className="auth-nav-link">Enterprise</a>

        {open && (
          <div className="mega-panel">
            <div className="mega-panel-inner">
              {MEGA_COLUMNS.map(col => (
                <div key={col.heading}>
                  <div className="mega-col-heading">{col.heading}</div>
                  {col.items.map(item => (
                    item.Icon ? (
                      <a key={item.title} href="#" className="mega-item">
                        <span className="mega-item-icon"><item.Icon width={15} height={15} /></span>
                        <span>
                          <span className="mega-item-title" style={{ display:'block' }}>{item.title}</span>
                          <span className="mega-item-desc">{item.desc}</span>
                        </span>
                      </a>
                    ) : (
                      <a key={item.title} href={item.href} className="mega-plain-link">{item.title}</a>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="auth-nav-actions">
        <Link href={loginHref} className="auth-nav-login">
          Log in
        </Link>
        <Link href={startHref} className="auth-nav-cta">
          Start for free
        </Link>
      </div>
    </nav>
  );
}
