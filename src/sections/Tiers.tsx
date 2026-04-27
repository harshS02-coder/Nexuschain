import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tiersConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Tiers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const tierRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tiers = tiersConfig.tiers;

  useEffect(() => {
    const ctx = gsap.context(() => {
      tierRefs.current.forEach((el) => {
        if (!el) return;
        const textEl = el.querySelector('.tier-text-content');
        if (textEl) {
          gsap.fromTo(
            textEl,
            { opacity: 0, x: 40 },
            {
              opacity: 1,
              x: 0,
              duration: 1.0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!tiersConfig.sectionLabel && !tiersConfig.title && tiers.length === 0) {
    return null;
  }

  return (
    <section
      id="tiers"
      ref={sectionRef}
      style={{
        backgroundColor: '#fcfaee',
        position: 'relative',
        zIndex: 2,
        padding: '100px 0 80px',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          textAlign: 'center',
          padding: '0 24px 80px',
        }}
      >
        {tiersConfig.sectionLabel && (
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              color: '#938977',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            {tiersConfig.sectionLabel}
          </p>
        )}
        {tiersConfig.title && (
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '42px',
              fontWeight: 500,
              lineHeight: 1.2,
              color: '#180c04',
            }}
          >
            {tiersConfig.title}
          </h2>
        )}
      </div>

      {/* Tier Rows */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {tiers.map((tier, i) => (
          <div
            key={tier.name}
            ref={(el) => { tierRefs.current[i] = el; }}
            style={{
              display: 'flex',
              flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
              gap: '60px',
              marginBottom: i < tiers.length - 1 ? '100px' : '0',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* Image */}
            <div
              className="tier-image-placeholder"
              style={{
                width: '100%',
                maxWidth: '460px',
                flex: '0 0 auto',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                boxShadow: '0px 8px 10px 0px rgba(168, 142, 113, 0.2)',
              }}
            >
              {tier.image && (
                <img
                  src={tier.image}
                  alt={tier.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                  }}
                />
              )}
            </div>

            {/* Text Content */}
            <div
              className="tier-text-content"
              style={{
                flex: '1 1 400px',
                minWidth: '300px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#938977',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                }}
              >
                {tier.journeys}
              </p>
              <h3
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: '32px',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: '#180c04',
                  marginBottom: '8px',
                }}
              >
                {tier.name}
              </h3>
              <p
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: '28px',
                  fontWeight: 400,
                  color: '#938977',
                  marginBottom: '24px',
                }}
              >
                <span style={{ fontStyle: 'italic' }}>${tier.price}</span>
                <span
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: '#696969',
                    marginLeft: '8px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {tier.frequency}
                </span>
              </p>
              <p
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: '#696969',
                  marginBottom: '28px',
                  maxWidth: '440px',
                }}
              >
                {tier.description}
              </p>

              {/* Amenities List */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                {tier.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13px',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: '#696969',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(24, 12, 4, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: '#938977',
                        flexShrink: 0,
                      }}
                    />
                    {amenity}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {tier.ctaText && (
                <a
                  href={tier.ctaHref || '#'}
                  onClick={(e) => {
                    if (!tier.ctaHref || tier.ctaHref === '#') e.preventDefault();
                  }}
                  style={{
                    display: 'inline-block',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#180c04',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    padding: '14px 36px',
                    border: '1px solid rgba(24, 12, 4, 0.25)',
                    borderRadius: '2px',
                    transition: 'all 0.6s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.backgroundColor = '#180c04';
                    el.style.color = '#fcfaee';
                    el.style.borderColor = '#180c04';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.backgroundColor = 'transparent';
                    el.style.color = '#180c04';
                    el.style.borderColor = 'rgba(24, 12, 4, 0.25)';
                  }}
                >
                  {tier.ctaText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
