import { useEffect, useRef } from 'react';

interface Particle {
  y: number;
  offset: number;
  char: string;
  x: number;
  screenY: number;
  size: number;
  alpha: number;
}

export default function HeritageHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chars = ['T', 'I', 'M', 'E'];
    const totalRungs = 80;
    const radius = 120;
    const fov = 1000;

    // Create two strands
    const strand1: Particle[] = [];
    const strand2: Particle[] = [];

    for (let i = 0; i < totalRungs; i++) {
      strand1.push({
        y: i,
        offset: 0,
        char: chars[i % chars.length],
        x: 0,
        screenY: 0,
        size: 14,
        alpha: 1,
      });
      strand2.push({
        y: i,
        offset: Math.PI,
        char: chars[(i + 2) % chars.length],
        x: 0,
        screenY: 0,
        size: 14,
        alpha: 1,
      });
    }

    function updateSize() {
      const rect = container!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = rect.width + 'px';
      canvas!.style.height = rect.height + 'px';
      ctx!.scale(dpr, dpr);
    }

    updateSize();

    const ro = new ResizeObserver(() => {
      updateSize();
    });
    ro.observe(container);

    function updateParticle(p: Particle, t: number, canvasW: number, canvasH: number) {
      const angle = p.y * 0.05 + t + p.offset;
      const x3d = Math.sin(angle) * radius;
      const z3d = Math.cos(angle) * radius;
      const scale = fov / (fov + z3d);
      p.x = (canvasW * 0.5) + x3d * scale;
      p.screenY = (p.y * 18) * scale + (canvasH * 0.1);
      p.size = 14 * scale;
      p.alpha = scale > 1 ? 1.0 : 0.25;
    }

    function draw() {
      const rect = container!.getBoundingClientRect();
      const canvasW = rect.width;
      const canvasH = rect.height;

      ctx!.clearRect(0, 0, canvasW, canvasH);

      timeRef.current += 0.005;
      const t = timeRef.current;

      // Update all particles
      for (let i = 0; i < totalRungs; i++) {
        updateParticle(strand1[i], t, canvasW, canvasH);
        updateParticle(strand2[i], t, canvasW, canvasH);
      }

      // Draw connecting rungs
      for (let i = 0; i < totalRungs; i++) {
        const p1 = strand1[i];
        const p2 = strand2[i];
        ctx!.beginPath();
        ctx!.moveTo(p1.x, p1.screenY);
        ctx!.lineTo(p2.x, p2.screenY);
        ctx!.strokeStyle = 'rgba(24, 12, 4, 0.15)';
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      }

      // Sort by z-depth (smaller size = farther back, draw first)
      const allParticles = [...strand1, ...strand2].sort((a, b) => a.size - b.size);

      // Draw characters
      for (const p of allParticles) {
        ctx!.font = `${p.size}px "Cormorant Garamond", serif`;
        ctx!.fillStyle = `rgba(24, 12, 4, ${p.alpha})`;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.fillText(p.char, p.x, p.screenY);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
