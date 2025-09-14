/**
 * Avatar Animation System
 * Math Farm Community Forum - Special Effects and Animations for Avatars
 */

import React, { useEffect, useState, useRef } from 'react';
import type { AvatarEffect } from '../../types/avatar';
import { cn } from '../../../../lib/utils';

interface AvatarAnimationProps {
  effects: AvatarEffect[];
  size: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wrapper component that adds special effects and animations to avatars
 */
export function AvatarAnimations({
  effects,
  size,
  className = '',
  children,
}: AvatarAnimationProps) {
  const [activeEffects, setActiveEffects] = useState<AvatarEffect[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter effects based on triggers
  useEffect(() => {
    const alwaysActive = effects.filter(effect => effect.trigger === 'always');
    setActiveEffects(alwaysActive);
  }, [effects]);

  // Handle mouse events for hover effects
  const handleMouseEnter = () => {
    const hoverEffects = effects.filter(effect => effect.trigger === 'hover');
    setActiveEffects(prev => [
      ...prev.filter(e => e.trigger === 'always'),
      ...hoverEffects,
    ]);
  };

  const handleMouseLeave = () => {
    setActiveEffects(prev => prev.filter(e => e.trigger === 'always'));
  };

  const handleClick = () => {
    const clickEffects = effects.filter(effect => effect.trigger === 'click');
    setActiveEffects(prev => [...prev, ...clickEffects]);

    // Remove click effects after duration
    setTimeout(() => {
      setActiveEffects(prev => prev.filter(e => e.trigger !== 'click'));
    }, 2000);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ width: size, height: size }}
    >
      {/* Base avatar */}
      <div className='relative z-10'>{children}</div>

      {/* Effect overlays */}
      {activeEffects.map((effect, index) => (
        <EffectOverlay
          key={`${effect.type}-${index}`}
          effect={effect}
          size={size}
        />
      ))}
    </div>
  );
}

/**
 * Individual effect overlay component
 */
interface EffectOverlayProps {
  effect: AvatarEffect;
  size: number;
}

function EffectOverlay({ effect, size }: EffectOverlayProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (effect.type === 'particles' || effect.type === 'sparkle') {
      generateParticles();
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [effect]);

  const generateParticles = () => {
    const particleCount = Math.floor(effect.intensity * 20);
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * size,
        y: Math.random() * size,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color: getParticleColor(effect.type),
      });
    }

    setParticles(newParticles);
  };

  const startAnimation = () => {
    const animate = () => {
      setParticles(prev =>
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - particle.decay,
          }))
          .filter(particle => particle.life > 0)
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const getParticleColor = (type: AvatarEffect['type']): string => {
    switch (type) {
      case 'sparkle':
        return '#FFD700';
      case 'math-symbols':
        return '#8B5CF6';
      case 'particles':
        return '#60A5FA';
      default:
        return '#FFFFFF';
    }
  };

  const renderEffect = () => {
    switch (effect.type) {
      case 'sparkle':
        return (
          <div className='absolute inset-0 pointer-events-none'>
            {particles.map(particle => (
              <div
                key={particle.id}
                className='absolute animate-ping'
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: '50%',
                  opacity: particle.life,
                  transform: `scale(${particle.life})`,
                }}
              />
            ))}
          </div>
        );

      case 'glow':
        return (
          <div
            className='absolute inset-0 rounded-full animate-pulse'
            style={{
              boxShadow: `0 0 ${size * 0.5}px rgba(139, 92, 246, ${effect.intensity})`,
              animation: 'glow 2s ease-in-out infinite alternate',
            }}
          />
        );

      case 'math-symbols':
        return (
          <div className='absolute inset-0 pointer-events-none overflow-hidden rounded-full'>
            <MathSymbolsEffect size={size} intensity={effect.intensity} />
          </div>
        );

      case 'particles':
        return (
          <div className='absolute inset-0 pointer-events-none'>
            {particles.map(particle => (
              <div
                key={particle.id}
                className='absolute'
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: '50%',
                  opacity: particle.life * 0.8,
                }}
              />
            ))}
          </div>
        );

      case 'rainbow':
        return (
          <div
            className='absolute inset-0 rounded-full animate-spin'
            style={{
              background: `conic-gradient(from 0deg, 
                red, orange, yellow, green, blue, indigo, violet, red)`,
              opacity: effect.intensity * 0.3,
              animation: 'rainbow-spin 3s linear infinite',
            }}
          />
        );

      default:
        return null;
    }
  };

  return renderEffect();
}

/**
 * Math symbols floating effect
 */
interface MathSymbolsEffectProps {
  size: number;
  intensity: number;
}

function MathSymbolsEffect({ size, intensity }: MathSymbolsEffectProps) {
  const symbols = ['π', '∫', '∞', '∑', '√', '∆', '∂', '≈', '≠', '±'];
  const [floatingSymbols, setFloatingSymbols] = useState<FloatingSymbol[]>([]);

  useEffect(() => {
    const symbolCount = Math.floor(intensity * 8);
    const newSymbols: FloatingSymbol[] = [];

    for (let i = 0; i < symbolCount; i++) {
      newSymbols.push({
        id: i,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        x: Math.random() * (size - 20),
        y: Math.random() * (size - 20),
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.4,
        animationDelay: Math.random() * 2,
      });
    }

    setFloatingSymbols(newSymbols);
  }, [size, intensity]);

  return (
    <div className='relative w-full h-full'>
      {floatingSymbols.map(symbol => (
        <div
          key={symbol.id}
          className='absolute text-purple-400 font-bold animate-float'
          style={{
            left: symbol.x,
            top: symbol.y,
            transform: `rotate(${symbol.rotation}deg) scale(${symbol.scale})`,
            opacity: symbol.opacity,
            fontSize: size * 0.15,
            animationDelay: `${symbol.animationDelay}s`,
          }}
        >
          {symbol.symbol}
        </div>
      ))}
    </div>
  );
}

// Type definitions for particles and symbols
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
}

interface FloatingSymbol {
  id: number;
  symbol: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  animationDelay: number;
}

// Achievement-specific effect presets
export const ACHIEVEMENT_EFFECTS: Record<string, AvatarEffect[]> = {
  'math-master': [
    { type: 'glow', intensity: 0.8, trigger: 'always' },
    { type: 'math-symbols', intensity: 0.6, trigger: 'hover' },
  ],
  'community-champion': [
    { type: 'sparkle', intensity: 0.7, trigger: 'hover' },
    { type: 'glow', intensity: 0.5, trigger: 'always' },
  ],
  'calculus-master': [
    { type: 'math-symbols', intensity: 0.8, trigger: 'hover' },
  ],
  'infinity-seeker': [
    { type: 'particles', intensity: 0.6, trigger: 'hover' },
    { type: 'glow', intensity: 0.4, trigger: 'always' },
  ],
  'equation-artist': [
    { type: 'rainbow', intensity: 0.5, trigger: 'click' },
    { type: 'math-symbols', intensity: 0.4, trigger: 'hover' },
  ],
};

// Utility function to get effects for user achievements
export function getAchievementEffects(achievements: string[]): AvatarEffect[] {
  const effects: AvatarEffect[] = [];

  achievements.forEach(achievement => {
    const achievementEffects = ACHIEVEMENT_EFFECTS[achievement];
    if (achievementEffects) {
      effects.push(...achievementEffects);
    }
  });

  return effects;
}

export default AvatarAnimations;
