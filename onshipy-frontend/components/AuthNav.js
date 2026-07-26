import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  CloudArrowDownIcon, TagIcon, ShoppingBagIcon,
  TruckIcon, MapPinIcon, ChartBarIcon,
  CheckBadgeIcon, ShieldCheckIcon, LockClosedIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const MENUS = {
  why: {
    label: 'Why Onshipy',
    items: [
      { Icon: CheckBadgeIcon,  title: 'Verified suppliers', desc: 'Every source store is vetted' },
      { Icon: ShieldCheckIcon, title: 'Buyer protection',   desc: 'Orders tracked end-to-end' },
      { Icon: LockClosedIcon,  title: 'Secure payments',    desc: 'Encrypted checkout, always' },
    ],
  },
  products: {
    label: 'Products',
    items: [
      { Icon: CloudArrowDownIcon, title: 'Import',       desc: 'Pull products from 1,000+ stores' },
      { Icon: TagIcon,            title: 'Price & sell', desc: 'Set your margin, publish instantly' },
      { Icon: ShoppingBagIcon,    title: 'Shopify sync', desc: 'Keep your storefront up to date' },
    ],
  },
  features: {
    label: 'Features',
    items: [
      { Icon: TruckIcon,    title: 'Fulfillment',   desc: 'Auto purchase & ship on every order' },
      { Icon: MapPinIcon,   title: 'Order tracking', desc: 'Live status from source to customer' },
      { Icon: ChartBarIcon, title: 'Analytics',      desc: 'Profit per sale, per store, per day' },
    ],
  },
};

export default function AuthNav({ startHref = '/register', loginHref = '/login' }) {
  const [openMenu, setOpenMenu] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenMenu(null); };
    const onKey = e => { if (e.key === 'Escape') setOpenMenu(null); };
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

        .auth-nav-item { position:relative; }
        .auth-nav-trigger {
          display:flex; align-items:center; gap:4px; padding:6px 11px; font-size:13px; font-weight:500;
          color:rgba(255,255,255,0.6); background:none; border:none; border-radius:7px; cursor:pointer;
          font-family:inherit; transition:color 0.15s; white-space:nowrap;
        }
        .auth-nav-trigger:hover, .auth-nav-trigger[data-open="true"] { color:#fff; }
        .auth-nav-trigger svg { transition:transform 0.15s; }
        .auth-nav-trigger[data-open="true"] svg { transform:rotate(180deg); }

        .drop-panel {
          position:absolute; top:calc(100% + 10px); left:0; width:290px;
          background:#181818; border:1px solid rgba(255,255,255,0.08); border-radius:12px;
          box-shadow:0 24px 48px rgba(0,0,0,0.45); padding:10px;
        }
        .drop-item { display:flex; align-items:flex-start; gap:10px; padding:8px; border-radius:8px; text-decoration:none; transition:background 0.15s; }
        .drop-item:hover { background:rgba(255,255,255,0.05); }
        .drop-item-icon { width:28px; height:28px; border-radius:7px; background:rgba(0,184,124,0.12); color:#00b86c; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .drop-item-title { font-size:13px; font-weight:600; color:#fff; display:block; }
        .drop-item-desc { font-size:11px; color:rgba(255,255,255,0.4); margin-top:1px; }

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
        {Object.entries(MENUS).map(([key, menu]) => (
          <div key={key} className="auth-nav-item">
            <button
              type="button"
              className="auth-nav-trigger"
              data-open={openMenu === key}
              onClick={() => setOpenMenu(m => (m === key ? null : key))}
            >
              {menu.label}
              <ChevronDownIcon width={13} height={13} />
            </button>

            {openMenu === key && (
              <div className="drop-panel">
                {menu.items.map(item => (
                  <a key={item.title} href="#" className="drop-item">
                    <span className="drop-item-icon"><item.Icon width={15} height={15} /></span>
                    <span>
                      <span className="drop-item-title">{item.title}</span>
                      <span className="drop-item-desc">{item.desc}</span>
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        <Link href="/pricing" className="auth-nav-link">Pricing</Link>
        <Link href="/enterprise" className="auth-nav-link">Enterprise</Link>
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
