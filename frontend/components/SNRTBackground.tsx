// RH Live / SNRT Availability Constellation : fond d'ambiance plein écran,
// pensé comme un flux de ressources humaines en profondeur derrière le
// cockpit (Sidebar + contenu). Adapté du prototype de direction artistique
// "Neon Human Mesh" (Canvas 2D — pas de WebGL — pour rester léger).
import React, { useEffect, useRef } from 'react';

interface SNRTBackgroundProps {
  // Nombre réel de ressources par fonction (StatsGlobales.parFonction).
  // Détermine quels pins sont "actifs" (lime) vs "non suivis" (muted) —
  // aucune donnée n'est inventée : une fonction à 0 ressource reste grise.
  parFonction?: Record<string, number>;
}

type Particle = {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  phase: number;
  tone: 'cyan' | 'lime' | 'muted';
};

// Les 9 métiers RH Live (identiques à FONCTIONS_LIST, hors "Toutes les fonctions").
const ROLES = [
  { label: 'Cameraman', x: 14, y: 24 },
  { label: 'Réalisateur', x: 30, y: 16 },
  { label: 'Ingénieur du son', x: 47, y: 28 },
  { label: 'Éclairagiste', x: 66, y: 17 },
  { label: 'Scripte', x: 83, y: 30 },
  { label: 'Chef de car', x: 19, y: 66 },
  { label: 'Monteur', x: 38, y: 78 },
  { label: 'Journaliste', x: 61, y: 69 },
  { label: 'Truquiste', x: 82, y: 80 },
] as const;

const TONES: Record<Particle['tone'], [number, number, number]> = {
  cyan: [88, 213, 255],
  lime: [183, 255, 74],
  muted: [96, 138, 148],
};

export const SNRTBackground: React.FC<SNRTBackgroundProps> = ({ parFonction = {} }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0 };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let particles: Particle[] = [];

    const createParticles = () => {
      const amount = width < 700 ? 42 : 92;
      particles = Array.from({ length: amount }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        z: 0.18 + Math.random() * 0.82,
        size: 0.7 + Math.random() * 2.1,
        speed: 0.12 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        tone: index % 7 === 0 ? 'lime' : index % 3 === 0 ? 'cyan' : 'muted',
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
      draw(0);
    };

    const project = (particle: Particle, elapsed: number) => {
      const flow = (elapsed * particle.speed * 0.000025 + particle.phase * 0.0001) % 1;
      const depth = (particle.z + flow) % 1;
      const scale = 0.3 + depth * 1.15;
      const driftX = Math.sin(elapsed * 0.00018 + particle.phase) * 18 * depth;
      const driftY = Math.cos(elapsed * 0.00013 + particle.phase) * 10 * depth;
      const parallaxX = pointer.x * 22 * depth;
      const parallaxY = pointer.y * 14 * depth;
      return {
        x: width * 0.5 + (particle.x - 0.5) * width * scale + driftX + parallaxX,
        y: height * 0.47 + (particle.y - 0.5) * height * scale + driftY + parallaxY,
        scale,
        depth,
      };
    };

    const draw = (elapsed: number) => {
      context.clearRect(0, 0, width, height);

      const vignette = context.createRadialGradient(
        width * 0.62, height * 0.38, 0,
        width * 0.62, height * 0.38, Math.max(width, height) * 0.72
      );
      vignette.addColorStop(0, 'rgba(5, 18, 22, 0.08)');
      vignette.addColorStop(0.52, 'rgba(4, 10, 13, 0.18)');
      vignette.addColorStop(1, 'rgba(2, 5, 7, 0.72)');
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);

      const projected = particles
        .map((particle) => ({ particle, point: project(particle, elapsed) }))
        .sort((a, b) => a.point.depth - b.point.depth);

      const maxLinkDistance = width < 700 ? 115 : 180;
      for (let i = 0; i < projected.length; i++) {
        const current = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const candidate = projected[j];
          const dx = current.point.x - candidate.point.x;
          const dy = current.point.y - candidate.point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > maxLinkDistance) continue;
          const alpha = (1 - distance / maxLinkDistance) * 0.1 * current.point.depth;
          const [r, g, b] = TONES[current.particle.tone];
          context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          context.lineWidth = current.point.depth * 0.65;
          context.beginPath();
          context.moveTo(current.point.x, current.point.y);
          context.lineTo(candidate.point.x, candidate.point.y);
          context.stroke();
        }
      }

      const centerX = width * 0.63 + pointer.x * 18;
      const centerY = height * 0.48 + pointer.y * 12;
      [0.25, 0.42, 0.63].forEach((radius, index) => {
        context.save();
        context.translate(centerX, centerY);
        context.rotate(-0.18 + Math.sin(elapsed * 0.0001 + index) * 0.025);
        context.scale(1, 0.32);
        context.beginPath();
        context.arc(0, 0, Math.min(width, height) * radius, 0, Math.PI * 2);
        context.strokeStyle = index === 1 ? 'rgba(183, 255, 74, 0.14)' : 'rgba(88, 213, 255, 0.12)';
        context.lineWidth = 1;
        context.stroke();
        context.restore();
      });

      projected.forEach(({ particle, point }) => {
        if (point.x < -30 || point.x > width + 30 || point.y < -30 || point.y > height + 30) return;
        const [r, g, b] = TONES[particle.tone];
        const radius = particle.size * point.scale;
        const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 8);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.5 * point.depth})`);
        glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(point.x, point.y, radius * 8, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.26 + point.depth * 0.72})`;
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      });

      const beam = context.createLinearGradient(width * 0.64, height * 0.12, width * 0.64, height * 0.85);
      beam.addColorStop(0, 'rgba(183, 255, 74, 0)');
      beam.addColorStop(0.42, 'rgba(183, 255, 74, 0.12)');
      beam.addColorStop(0.58, 'rgba(88, 213, 255, 0.06)');
      beam.addColorStop(1, 'rgba(88, 213, 255, 0)');
      context.fillStyle = beam;
      context.fillRect(width * 0.63, height * 0.08, 2, height * 0.82);
    };

    const animate = (elapsed: number) => {
      draw(elapsed);
      if (!reducedMotion) frame = requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / width - 0.5;
      pointer.y = event.clientY / height - 0.5;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    if (!reducedMotion) frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <div className="snrt-background-layer" aria-hidden="true">
      <div className="snrt-dunes" />
      <canvas ref={canvasRef} className="snrt-background" />
      <div className="role-constellation">
        {ROLES.map((role) => {
          const count = parFonction[role.label] || 0;
          const tone = count > 0 ? 'lime' : 'muted';
          return (
            <span
              key={role.label}
              className={`role-pin role-pin-${tone}`}
              style={{ left: `${role.x}%`, top: `${role.y}%` }}
              title={`${role.label} : ${count} ressource(s) suivie(s)`}
            >
              <i />
              {role.label}
              {count > 0 && <b className="role-pin-count">{count}</b>}
            </span>
          );
        })}
      </div>
    </div>
  );
};