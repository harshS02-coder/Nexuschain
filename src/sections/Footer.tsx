import { footerConfig } from '../config';

export default function Footer() {
  const hasFooterContent =
    footerConfig.ageGateText ||
    footerConfig.brandName ||
    footerConfig.brandTaglineLines.length > 0 ||
    footerConfig.columns.length > 0 ||
    footerConfig.copyright;

  if (!hasFooterContent) {
    return null;
  }

  return (
    <footer
      style={{
        backgroundColor: '#f0ecd7',
        position: 'relative',
        zIndex: 2,
        borderTop: '1px solid rgba(24, 12, 4, 0.1)',
      }}
    >
      {/* Age Gate */}
      <div
        style={{
          textAlign: 'center',
          padding: '80px 24px 60px',
        }}
      >
        {footerConfig.ageGateText && (
          <p
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: '#180c04',
              lineHeight: 1.3,
              maxWidth: '500px',
              margin: '0 auto',
              textWrap: 'balance',
            }}
          >
            {footerConfig.ageGateText}
          </p>
        )}
      </div>

      {/* Footer Columns */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
        }}
      >
        {/* Brand Column */}
        <div>
          {footerConfig.brandName && (
            <p
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: '18px',
                fontWeight: 500,
                color: '#180c04',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              {footerConfig.brandName}
            </p>
          )}
          {footerConfig.brandTaglineLines.length > 0 && (
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: 1.6,
                color: '#696969',
              }}
            >
              {footerConfig.brandTaglineLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < footerConfig.brandTaglineLines.length - 1 && <br />}
                </span>
              ))}
            </p>
          )}
        </div>

        {footerConfig.columns.map((column) => (
          <div key={column.heading}>
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: '#938977',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              {column.heading}
            </p>
            {column.links.map((item) => (
              <a
                key={`${column.heading}-${item.label}`}
                href={item.href}
                onClick={(e) => {
                  if (!item.href || item.href === '#') e.preventDefault();
                }}
                style={{
                  display: 'block',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#696969',
                  textDecoration: 'none',
                  marginBottom: '10px',
                  transition: 'color 0.4s ease',
                }}
                onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = '#180c04'; }}
                onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = '#696969'; }}
              >
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: '1px solid rgba(24, 12, 4, 0.08)',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        {footerConfig.copyright && (
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 400,
              color: '#696969',
              letterSpacing: '0.5px',
            }}
          >
            {footerConfig.copyright}
          </p>
        )}
      </div>
    </footer>
  );
}
