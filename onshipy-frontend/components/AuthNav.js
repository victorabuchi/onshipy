import Link from 'next/link';

const NAV_LINKS = ['Why Onshipy', 'Products', 'Pricing', 'Enterprise'];

export default function AuthNav({ startHref = '/register', loginHref = '/login' }) {
  return (
    <nav className="auth-nav">
      <style>{`
        .auth-nav {
          background:#1a1a1a; height:60px; display:flex; align-items:center;
          padding:0 32px; border-bottom:1px solid rgba(255,255,255,0.07);
          position:relative; z-index:100; flex-shrink:0; gap:12px;
          font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
        }
        .auth-nav-logo { display:flex; align-items:center; gap:9px; text-decoration:none; flex-shrink:0; }
        .auth-nav-links { display:flex; align-items:center; gap:2px; flex:1; min-width:0; }
        .auth-nav-link {
          padding:6px 11px; font-size:13px; font-weight:500; color:rgba(255,255,255,0.6);
          text-decoration:none; border-radius:7px; white-space:nowrap; transition:color 0.15s;
        }
        .auth-nav-link:hover { color:#fff; }
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
      <div className="auth-nav-links">
        {NAV_LINKS.map(label => (
          <a key={label} href="#" className="auth-nav-link">
            {label}
          </a>
        ))}
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
