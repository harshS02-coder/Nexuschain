import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeritageHelix from '../effects/HeritageHelix';
import { anatomyConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Anatomy() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pillars = anatomyConfig.pillars;

  useEffect(() => {
    const ctx = gsap.context(() => {
      pillarRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 75%',
              end: 'top 40%',
              scrub: false,
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!anatomyConfig.sectionLabel && !anatomyConfig.title && pillars.length === 0) {
    return null;
  }

  return (
    <section
      id="anatomy"
      ref={sectionRef}
      style={{
        backgroundColor: '#f0ecd7',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Section Header */}
      <div
        style={{
          textAlign: 'center',
          padding: '100px 24px 40px',
        }}
      >
        {anatomyConfig.sectionLabel && (
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
            {anatomyConfig.sectionLabel}
          </p>
        )}
        {anatomyConfig.title && (
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: '42px',
              fontWeight: 500,
              lineHeight: 1.2,
              color: '#180c04',
            }}
          >
            {anatomyConfig.title}
          </h2>
        )}
      </div>

      {/* Split Layout */}
      <div
        style={{
          display: 'flex',
          maxWidth: '1400px',
          margin: '0 auto',
          minHeight: '100vh',
        }}
      >
        {/* Left: Sticky HeritageHelix */}
        <div
          style={{
            width: '50%',
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="hidden md:flex"
        >
          <div style={{ width: '100%', height: '80vh' }}>
            <HeritageHelix />
          </div>
        </div>

        {/* Right: Scrolling Content */}
        <div
          style={{
            width: '50%',
            padding: '0 48px',
          }}
          className="w-full md:w-1/2"
        >
          {pillars.map((pillar, i) => (
            <div
              key={pillar.label}
              ref={(el) => { pillarRefs.current[i] = el; }}
              style={{
                padding: '15vh 0',
                borderBottom: i < pillars.length - 1 ? '1px solid rgba(24, 12, 4, 0.1)' : 'none',
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
                  marginBottom: '24px',
                }}
              >
                {pillar.label}
              </p>
              <h3
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: '26px',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: '#180c04',
                  marginBottom: '20px',
                }}
              >
                {pillar.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: '#696969',
                  maxWidth: '480px',
                }}
              >
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
