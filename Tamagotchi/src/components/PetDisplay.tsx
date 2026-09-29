'use client';

import React from 'react';
import { PetState, FeedingTracker, RandomEvent } from '@/types/tamagotchi';

export type ActionReactionType = 'feeding' | 'playing' | 'cleaning' | null;

interface PetDisplayProps {
  pet: PetState;
  feeding: FeedingTracker;
  randomEvent: RandomEvent;
  currentMessage: string;
  isGameOverCompleted?: boolean;
  actionReaction?: ActionReactionType;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({
  pet,
  feeding,
  randomEvent,
  currentMessage,
  isGameOverCompleted = false,
  actionReaction = null,
}) => {
  const { isAlive, isGhost, ghostReason, hunger, hygiene, fun, happiness } = pet;

  // Determine pet visual mood as strictly defined in design.md Section 4
  type MoodType =
    | 'normal'
    | 'hungry'
    | 'bored'
    | 'dirty'
    | 'ghost_starvation'
    | 'ghost_overfeeding'
    | 'victory';

  let mood: MoodType = 'normal';
  let asciiExpression = '(^ ‿ ^)';
  let moodStatusLabel = 'NORMAL / CONTENTO';

  if (isGhost) {
    if (ghostReason === 'overfeeding') {
      mood = 'ghost_overfeeding';
      asciiExpression = '(x ω x) 💥';
      moodStatusLabel = 'FANTASMA (SOBREALIMENTADO)';
    } else {
      mood = 'ghost_starvation';
      asciiExpression = '(x _ x) ☁';
      moodStatusLabel = 'FANTASMA (INANICIÓN)';
    }
  } else if (isGameOverCompleted) {
    mood = 'victory';
    asciiExpression = '\\(^o^)/ 🏆';
    moodStatusLabel = '¡CICLO 24H COMPLETADO!';
  } else if (feeding.isRequestingFood || hunger >= 70) {
    mood = 'hungry';
    asciiExpression = '( > ﹏ < )';
    moodStatusLabel = '¡HAMBRIENTO!';
  } else if (randomEvent.active && randomEvent.type === 'potty' || hygiene <= 30) {
    mood = 'dirty';
    asciiExpression = '( • ⌂ • )~💩';
    moodStatusLabel = '¡SUCIO!';
  } else if (randomEvent.active && randomEvent.type === 'play_request' || fun <= 30) {
    mood = 'bored';
    asciiExpression = '( - _ - )';
    moodStatusLabel = 'ABURRIDO';
  } else {
    mood = 'normal';
    asciiExpression = happiness >= 75 ? '(^ ‿ ^)' : '(• ‿ •)';
    moodStatusLabel = happiness >= 75 ? 'FELIZ' : 'NORMAL';
  }

  // Action reaction override for 800ms satisfaction
  const hasReaction = actionReaction !== null && !isGhost;

  return (
    <div className={`pet-display-component mood-${mood} ${hasReaction ? 'has-action-reaction' : ''}`}>
      {/* LCD Viewport with retro pixel screen and scanlines */}
      <div className={`lcd-screen-viewport ${feeding.isRequestingFood ? 'screen-urgent-red-alert' : ''}`}>
        <div className="lcd-matrix-grid" />
        <div className="lcd-scanlines-filter" />

        {/* Top internal badges */}
        <div className="lcd-top-badges">
          <span className="lcd-ascii-mood" aria-label={`Expresión ${asciiExpression}`}>
            {hasReaction ? '( ^ ᗜ ^ )*' : asciiExpression}
          </span>

          {feeding.isRequestingFood && isAlive && (
            <span className="lcd-alert-tag lcd-alert-hunger animate-blink">
              🍖 ¡HAMBRE (1/2)!
            </span>
          )}

          {randomEvent.active && isAlive && (
            <span className="lcd-alert-tag lcd-alert-event animate-pulse">
              {randomEvent.type === 'potty' ? '💩 ¡BAÑO!' : '🎾 ¡JUEGO!'}
            </span>
          )}

          {isGhost && (
            <span className="lcd-alert-tag lcd-alert-ghost">
              👻 {ghostReason === 'starvation' ? 'INANICIÓN' : 'SOBREALIMENTADO'}
            </span>
          )}
        </div>

        {/* Pet Avatar Stage with pixel art sprites */}
        <div className="pet-avatar-stage-area">
          {/* Reaction 800ms overlay */}
          {hasReaction && (
            <div className="avatar-reaction-effect animate-pop-scale">
              {actionReaction === 'feeding' && <span className="reaction-particle">🍖 ✨ ¡Ñam!</span>}
              {actionReaction === 'playing' && <span className="reaction-particle">⚽ 🎵 ¡Yaaay!</span>}
              {actionReaction === 'cleaning' && <span className="reaction-particle">✨ 🫧 ¡Limpio!</span>}
            </div>
          )}

          {/* 1. Normal / Contento Avatar: (^ ‿ ^) Bounce every 2s */}
          {mood === 'normal' && (
            <div className="avatar-sprite-container animate-lcd-bounce" title="Mascota contenta">
              <svg viewBox="0 0 96 96" className="pixel-pet-svg" width="96" height="96" shapeRendering="crispEdges">
                {/* Ears */}
                <rect x="20" y="16" width="12" height="12" fill="currentColor" />
                <rect x="24" y="12" width="4" height="4" fill="currentColor" />
                <rect x="64" y="16" width="12" height="12" fill="currentColor" />
                <rect x="68" y="12" width="4" height="4" fill="currentColor" />
                {/* Head / Body Base */}
                <rect x="16" y="28" width="64" height="44" rx="4" fill="currentColor" />
                <rect x="12" y="36" width="72" height="28" fill="currentColor" />
                {/* Paws */}
                <rect x="24" y="72" width="12" height="8" fill="currentColor" />
                <rect x="60" y="72" width="12" height="8" fill="currentColor" />
                {/* Eyes - Happy inverted arc pixels */}
                <rect x="28" y="44" width="8" height="4" fill="#A3B18A" />
                <rect x="24" y="48" width="4" height="4" fill="#A3B18A" />
                <rect x="36" y="48" width="4" height="4" fill="#A3B18A" />
                <rect x="60" y="44" width="8" height="4" fill="#A3B18A" />
                <rect x="56" y="48" width="4" height="4" fill="#A3B18A" />
                <rect x="68" y="48" width="4" height="4" fill="#A3B18A" />
                {/* Cheerful Smile */}
                <rect x="44" y="56" width="8" height="4" fill="#A3B18A" />
                <rect x="40" y="52" width="4" height="4" fill="#A3B18A" />
                <rect x="52" y="52" width="4" height="4" fill="#A3B18A" />
              </svg>
              <div className="lcd-ground-shadow" />
            </div>
          )}

          {/* 2. Hambriento Avatar: ( > ﹏ < ) + Pulsing meat icon 🍖 */}
          {mood === 'hungry' && (
            <div className="avatar-sprite-container animate-lcd-hungry" title="Mascota con hambre urgente">
              <div className="sprite-floating-accessory accessory-meat animate-blink-fast">
                <svg viewBox="0 0 32 32" width="28" height="28" shapeRendering="crispEdges">
                  {/* Pixel Meat Bone */}
                  <rect x="8" y="12" width="16" height="8" fill="currentColor" />
                  <rect x="4" y="8" width="4" height="4" fill="currentColor" />
                  <rect x="4" y="20" width="4" height="4" fill="currentColor" />
                  <rect x="24" y="8" width="4" height="4" fill="currentColor" />
                  <rect x="24" y="20" width="4" height="4" fill="currentColor" />
                  <rect x="12" y="14" width="8" height="4" fill="#A3B18A" />
                </svg>
              </div>
              <svg viewBox="0 0 96 96" className="pixel-pet-svg" width="96" height="96" shapeRendering="crispEdges">
                {/* Ears drooped */}
                <rect x="16" y="24" width="12" height="12" fill="currentColor" />
                <rect x="68" y="24" width="12" height="12" fill="currentColor" />
                {/* Head */}
                <rect x="16" y="32" width="64" height="40" fill="currentColor" />
                <rect x="12" y="40" width="72" height="24" fill="currentColor" />
                {/* Paws */}
                <rect x="24" y="72" width="12" height="8" fill="currentColor" />
                <rect x="60" y="72" width="12" height="8" fill="currentColor" />
                {/* Squeezed pleading eyes: > < */}
                <rect x="28" y="44" width="4" height="4" fill="#A3B18A" />
                <rect x="32" y="48" width="4" height="4" fill="#A3B18A" />
                <rect x="28" y="52" width="4" height="4" fill="#A3B18A" />
                <rect x="64" y="44" width="4" height="4" fill="#A3B18A" />
                <rect x="60" y="48" width="4" height="4" fill="#A3B18A" />
                <rect x="64" y="52" width="4" height="4" fill="#A3B18A" />
                {/* Open trembling mouth */}
                <rect x="44" y="56" width="8" height="8" fill="#A3B18A" />
                {/* Sweat droplet */}
                <rect x="76" y="32" width="4" height="8" fill="currentColor" />
              </svg>
              <div className="lcd-ground-shadow" />
            </div>
          )}

          {/* 3. Aburrido Avatar: ( - _ - ) Lateral slow drift */}
          {mood === 'bored' && (
            <div className="avatar-sprite-container animate-lcd-bored" title="Mascota aburrida">
              <svg viewBox="0 0 96 96" className="pixel-pet-svg" width="96" height="96" shapeRendering="crispEdges">
                {/* Slanted ears */}
                <rect x="16" y="20" width="12" height="8" fill="currentColor" />
                <rect x="68" y="20" width="12" height="8" fill="currentColor" />
                {/* Body */}
                <rect x="16" y="28" width="64" height="44" fill="currentColor" />
                <rect x="12" y="36" width="72" height="28" fill="currentColor" />
                {/* Paws */}
                <rect x="24" y="72" width="12" height="8" fill="currentColor" />
                <rect x="60" y="72" width="12" height="8" fill="currentColor" />
                {/* Flat bored eyes: - - */}
                <rect x="24" y="48" width="12" height="4" fill="#A3B18A" />
                <rect x="60" y="48" width="12" height="4" fill="#A3B18A" />
                {/* Straight mouth: _ */}
                <rect x="40" y="58" width="16" height="4" fill="#A3B18A" />
              </svg>
              <div className="lcd-ground-shadow" />
            </div>
          )}

          {/* 4. Sucio Avatar: ( • ⌂ • )~💩 + Orbiting flies */}
          {mood === 'dirty' && (
            <div className="avatar-sprite-container animate-lcd-dirty" title="Mascota sucia">
              {/* Little pixel poop beside pet */}
              <div className="sprite-floating-accessory accessory-poop">
                <svg viewBox="0 0 32 32" width="28" height="28" shapeRendering="crispEdges">
                  <rect x="14" y="6" width="4" height="4" fill="currentColor" />
                  <rect x="10" y="10" width="12" height="4" fill="currentColor" />
                  <rect x="6" y="14" width="20" height="6" fill="currentColor" />
                  <rect x="4" y="20" width="24" height="6" fill="currentColor" />
                </svg>
                {/* Orbiting pixel flies */}
                <div className="lcd-fly-particle fly-1" />
                <div className="lcd-fly-particle fly-2" />
              </div>
              <svg viewBox="0 0 96 96" className="pixel-pet-svg" width="96" height="96" shapeRendering="crispEdges">
                <rect x="20" y="16" width="12" height="12" fill="currentColor" />
                <rect x="64" y="16" width="12" height="12" fill="currentColor" />
                <rect x="16" y="28" width="64" height="44" fill="currentColor" />
                <rect x="12" y="36" width="72" height="28" fill="currentColor" />
                <rect x="24" y="72" width="12" height="8" fill="currentColor" />
                <rect x="60" y="72" width="12" height="8" fill="currentColor" />
                {/* Startled eyes */}
                <rect x="28" y="46" width="6" height="6" fill="#A3B18A" />
                <rect x="62" y="46" width="6" height="6" fill="#A3B18A" />
                {/* Wobbly mouth */}
                <rect x="42" y="56" width="12" height="6" fill="#A3B18A" />
                <rect x="46" y="54" width="4" height="2" fill="#A3B18A" />
              </svg>
              <div className="lcd-ground-shadow" />
            </div>
          )}

          {/* 5. Fantasma (Inanición): (x _ x) ☁ with halo, smooth float, 70% opacity */}
          {mood === 'ghost_starvation' && (
            <div className="avatar-sprite-container ghost-container animate-ghost-float-smooth" title="Fantasma por inanición">
              <svg viewBox="0 0 96 104" className="pixel-pet-svg ghost-svg" width="96" height="104" shapeRendering="crispEdges">
                {/* Halo above ghost */}
                <rect x="32" y="4" width="32" height="4" fill="currentColor" />
                <rect x="28" y="8" width="4" height="4" fill="currentColor" />
                <rect x="64" y="8" width="4" height="4" fill="currentColor" />
                {/* Sheet Ghost Body */}
                <rect x="24" y="16" width="48" height="60" rx="6" fill="currentColor" />
                <rect x="20" y="24" width="56" height="48" fill="currentColor" />
                {/* Ghost Wavy bottom sheet tails */}
                <rect x="20" y="72" width="8" height="12" fill="currentColor" />
                <rect x="36" y="72" width="8" height="12" fill="currentColor" />
                <rect x="52" y="72" width="8" height="12" fill="currentColor" />
                <rect x="68" y="72" width="8" height="12" fill="currentColor" />
                {/* Dead Cross Eyes: X X */}
                <rect x="28" y="38" width="4" height="4" fill="#CBD5E1" />
                <rect x="36" y="38" width="4" height="4" fill="#CBD5E1" />
                <rect x="32" y="42" width="4" height="4" fill="#CBD5E1" />
                <rect x="28" y="46" width="4" height="4" fill="#CBD5E1" />
                <rect x="36" y="46" width="4" height="4" fill="#CBD5E1" />

                <rect x="56" y="38" width="4" height="4" fill="#CBD5E1" />
                <rect x="64" y="38" width="4" height="4" fill="#CBD5E1" />
                <rect x="60" y="42" width="4" height="4" fill="#CBD5E1" />
                <rect x="56" y="46" width="4" height="4" fill="#CBD5E1" />
                <rect x="64" y="46" width="4" height="4" fill="#CBD5E1" />
                {/* Hollow open mouth */}
                <rect x="44" y="56" width="8" height="8" fill="#CBD5E1" />
              </svg>
            </div>
          )}

          {/* 6. Fantasma (Sobrealimentado): (x ω x) 💥 Bloated belly, increased scale, erratic float */}
          {mood === 'ghost_overfeeding' && (
            <div className="avatar-sprite-container ghost-container overfed-ghost animate-ghost-float-erratic" title="Fantasma por sobrealimentación">
              <svg viewBox="0 0 110 110" className="pixel-pet-svg ghost-svg overfed-svg" width="104" height="104" shapeRendering="crispEdges">
                {/* Exploding star icon above 💥 */}
                <rect x="50" y="4" width="8" height="4" fill="currentColor" />
                <rect x="42" y="8" width="4" height="4" fill="currentColor" />
                <rect x="62" y="8" width="4" height="4" fill="currentColor" />
                {/* Extra Bloated Round Ghost Body */}
                <rect x="18" y="18" width="72" height="66" rx="16" fill="currentColor" />
                <rect x="12" y="28" width="84" height="48" fill="currentColor" />
                {/* Distended Belly Highlight */}
                <rect x="30" y="56" width="48" height="20" fill="#CBD5E1" />
                <rect x="40" y="60" width="28" height="12" fill="currentColor" />
                {/* Wavy bottom */}
                <rect x="18" y="84" width="12" height="8" fill="currentColor" />
                <rect x="38" y="84" width="12" height="8" fill="currentColor" />
                <rect x="58" y="84" width="12" height="8" fill="currentColor" />
                <rect x="78" y="84" width="12" height="8" fill="currentColor" />
                {/* Dizzy cross eyes */}
                <rect x="28" y="36" width="4" height="4" fill="#CBD5E1" />
                <rect x="36" y="36" width="4" height="4" fill="#CBD5E1" />
                <rect x="32" y="40" width="4" height="4" fill="#CBD5E1" />
                <rect x="28" y="44" width="4" height="4" fill="#CBD5E1" />
                <rect x="36" y="44" width="4" height="4" fill="#CBD5E1" />

                <rect x="68" y="36" width="4" height="4" fill="#CBD5E1" />
                <rect x="76" y="36" width="4" height="4" fill="#CBD5E1" />
                <rect x="72" y="40" width="4" height="4" fill="#CBD5E1" />
                <rect x="68" y="44" width="4" height="4" fill="#CBD5E1" />
                <rect x="76" y="44" width="4" height="4" fill="#CBD5E1" />
                {/* Stuffed w mouth */}
                <rect x="46" y="48" width="6" height="4" fill="#CBD5E1" />
                <rect x="56" y="48" width="6" height="4" fill="#CBD5E1" />
              </svg>
            </div>
          )}

          {/* 7. Resumen 24h: \(^o^)/ 🏆 Triumphant celebration */}
          {mood === 'victory' && (
            <div className="avatar-sprite-container animate-celebration-sparkle" title="¡Victoria 24h!">
              {/* Trophy icon */}
              <div className="sprite-floating-accessory accessory-trophy animate-bounce">
                <svg viewBox="0 0 32 32" width="28" height="28" shapeRendering="crispEdges">
                  <rect x="10" y="4" width="12" height="12" fill="currentColor" />
                  <rect x="6" y="6" width="4" height="6" fill="currentColor" />
                  <rect x="22" y="6" width="4" height="6" fill="currentColor" />
                  <rect x="14" y="16" width="4" height="6" fill="currentColor" />
                  <rect x="8" y="22" width="16" height="4" fill="currentColor" />
                  <rect x="12" y="6" width="8" height="6" fill="#A3B18A" />
                </svg>
              </div>
              <svg viewBox="0 0 96 96" className="pixel-pet-svg" width="96" height="96" shapeRendering="crispEdges">
                {/* Arms raised: \ / */}
                <rect x="8" y="24" width="8" height="16" fill="currentColor" />
                <rect x="80" y="24" width="8" height="16" fill="currentColor" />
                {/* Ears */}
                <rect x="24" y="12" width="10" height="12" fill="currentColor" />
                <rect x="62" y="12" width="10" height="12" fill="currentColor" />
                {/* Body */}
                <rect x="20" y="24" width="56" height="48" rx="4" fill="currentColor" />
                <rect x="26" y="72" width="12" height="8" fill="currentColor" />
                <rect x="58" y="72" width="12" height="8" fill="currentColor" />
                {/* Cheerful celebratory eyes ^ ^ */}
                <rect x="32" y="40" width="8" height="4" fill="#A3B18A" />
                <rect x="56" y="40" width="8" height="4" fill="#A3B18A" />
                {/* Wide happy open mouth :D */}
                <rect x="42" y="52" width="12" height="8" fill="#A3B18A" />
              </svg>
              <div className="lcd-ground-shadow" />
            </div>
          )}
        </div>

        {/* Dynamic Contextual Subtitle Dialogue Box as per design.md Section 5.5 */}
        <div
          className="lcd-dialogue-console"
          aria-live="polite"
          role="status"
        >
          <div className="dialogue-header-line">
            <span className="pet-name-tag">[{pet.name || 'TAMAGOTCHI'}]</span>
            <span className="pet-mood-tag">{moodStatusLabel}</span>
          </div>
          <p className="dialogue-text-msg">
            &ldquo;{currentMessage}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
