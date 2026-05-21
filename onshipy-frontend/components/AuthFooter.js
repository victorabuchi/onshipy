import Link from 'next/link';

const COLS = [
  {
    heading: 'Onshipy',
    links: [
      { label: 'What is Onshipy?',  href: '#' },
      { label: 'How it Works',      href: '#' },
      { label: 'Pricing',           href: '#' },
      { label: 'Changelog',         href: '#' },
    ],
  },
  {
    heading: 'Sellers',
    links: [
      { label: 'Getting Started',    href: '#' },
      { label: 'Import Products',    href: '#' },
      { label: 'Shopify Integration',href: '#' },
      { label: 'Analytics',          href: '#' },
      { label: 'Affiliate Program',  href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog',        href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Guides',      href: '#' },
      { label: 'Courses',     href: '#' },
      { label: 'Free Tools',  href: '#' },
      { label: 'Community',   href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',    href: '#' },
      { label: 'Careers',     href: '#' },
      { label: 'Contact Us',  href: '#' },
      { label: 'Legal',       href: '#' },
    ],
  },
];

const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const IconYouTube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
  </svg>
);
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const IconTikTok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
  </svg>
);

export default function AuthFooter() {
  const link = { fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', lineHeight: '2', display: 'block', transition: 'color 0.15s' };
  const heading = { fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14, letterSpacing: '-0.1px' };
  const iconBtn = {
    width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s',
    flexShrink: 0,
  };

  return (
    <footer style={{
      background: '#1a1a1a',
      fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
      padding: '64px 48px 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Top row: logo + columns */}
        <div style={{ display: 'flex', gap: 48, marginBottom: 64 }}>
          {/* Logo */}
          <div style={{ flexShrink: 0, width: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <img src="/favicon-32x32.png" alt="Onshipy" width={22} height={22} style={{ filter: 'brightness(0) invert(1)' }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>Onshipy</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginTop: 10, maxWidth: 140 }}>
              Drop shipping, simplified.
            </p>
          </div>

          {/* Link columns */}
          <div style={{ display: 'flex', flex: 1, gap: 0, justifyContent: 'space-between' }}>
            {COLS.map(col => (
              <div key={col.heading}>
                <p style={heading}>{col.heading}</p>
                {col.links.map(l => (
                  <a
                    key={l.label}
                    href={l.href}
                    style={link}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 28 }} />

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Legal links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginRight: 12 }}>
              © {new Date().getFullYear()} Onshipy Inc.
            </span>
            {['Terms of Service', 'Privacy Policy', 'Legal', 'Sitemap'].map((t, i) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 2px' }}>·</span>}
                <a
                  href="#"
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  {t}
                </a>
              </span>
            ))}
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[
              { Icon: IconFacebook, label: 'Facebook' },
              { Icon: IconX,        label: 'X' },
              { Icon: IconYouTube,  label: 'YouTube' },
              { Icon: IconInstagram,label: 'Instagram' },
              { Icon: IconTikTok,   label: 'TikTok' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                style={iconBtn}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
