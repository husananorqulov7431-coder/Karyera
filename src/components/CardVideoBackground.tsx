import React, { useRef, useEffect, useMemo } from 'react';

interface CardVideoBackgroundProps {
  videoType?: string; // 'epic-gold' | 'cosmic-lightning' | 'magma-fire' | 'stadium-tunnel' | URL (direct video or YouTube)
  className?: string;
  isEpic?: boolean;
  opacity?: number;
}

function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const CardVideoBackground: React.FC<CardVideoBackgroundProps> = ({
  videoType = 'epic-gold',
  className = '',
  isEpic = true,
  opacity = 0.65
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const youtubeId = useMemo(() => {
    if (typeof videoType === 'string' && (videoType.includes('youtube') || videoType.includes('youtu.be'))) {
      return parseYouTubeId(videoType);
    }
    return null;
  }, [videoType]);

  // Check if videoType is a direct video URL (http, https, blob, data)
  const isDirectUrl =
    !youtubeId &&
    (videoType.startsWith('http://') ||
      videoType.startsWith('https://') ||
      videoType.startsWith('blob:') ||
      videoType.startsWith('data:video'));

  useEffect(() => {
    if (isDirectUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 300);
    let height = (canvas.height = canvas.offsetHeight || 450);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 300;
      height = canvas.height = canvas.offsetHeight || 450;
    };
    window.addEventListener('resize', handleResize);

    // Particle system configuration based on videoType
    const type = videoType || (isEpic ? 'epic-gold' : 'cosmic-lightning');
    const particleCount = type === 'epic-gold' ? 38 : 32;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      maxOpacity: number;
      pulse: number;
      pulseSpeed: number;
      color: string;
    }> = [];

    const getColors = () => {
      switch (type) {
        case 'cosmic-lightning':
          return ['#38bdf8', '#818cf8', '#67e8f9', '#ffffff'];
        case 'magma-fire':
          return ['#f97316', '#ef4444', '#eab308', '#ffffff'];
        case 'stadium-tunnel':
          return ['#e2e8f0', '#94a3b8', '#38bdf8', '#ffffff'];
        case 'epic-gold':
        default:
          return ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff'];
      }
    };

    const colors = getColors();

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.8 + 0.8,
        speedY: -(Math.random() * 0.9 + 0.3),
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.6 + 0.2,
        maxOpacity: Math.random() * 0.5 + 0.4,
        pulse: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Light energetic radial burst from center
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        10,
        width * 0.5,
        height * 0.5,
        height * 0.7
      );

      if (type === 'epic-gold') {
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
        gradient.addColorStop(0.5, 'rgba(180, 83, 9, 0.12)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (type === 'cosmic-lightning') {
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        gradient.addColorStop(0.5, 'rgba(30, 58, 138, 0.12)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (type === 'magma-fire') {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
        gradient.addColorStop(0.5, 'rgba(185, 28, 28, 0.12)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        gradient.addColorStop(0.5, 'rgba(51, 65, 85, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Moving energy beams / auroras
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const beamAngle = Math.sin(time * 0.5) * 0.15;
      ctx.translate(width / 2, height / 2);
      ctx.rotate(beamAngle);
      ctx.translate(-width / 2, -height / 2);

      const beamGrad = ctx.createLinearGradient(0, 0, width, height);
      if (type === 'epic-gold') {
        beamGrad.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
        beamGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.18)');
        beamGrad.addColorStop(1, 'rgba(251, 191, 36, 0.04)');
      } else {
        beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        beamGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.15)');
        beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.04)');
      }
      ctx.fillStyle = beamGrad;
      ctx.fillRect(-width * 0.2, -height * 0.2, width * 1.4, height * 1.4);
      ctx.restore();

      // Render floating particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = Math.max(
          0.05,
          p.maxOpacity * (0.6 + 0.4 * Math.sin(p.pulse))
        );

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentOpacity;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoType, isEpic, isDirectUrl, youtubeId]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {youtubeId ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1`}
            title="Card Video Background"
            className="w-[180%] h-[180%] max-w-none object-cover pointer-events-none mix-blend-screen scale-125"
            style={{ opacity }}
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
        </div>
      ) : isDirectUrl ? (
        <video
          src={videoType}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover mix-blend-screen"
          style={{ opacity }}
        />
      ) : (
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      )}
      {/* Subtle vignette darkening towards edges to ensure card stats remain crystal clear */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
    </div>
  );
};
