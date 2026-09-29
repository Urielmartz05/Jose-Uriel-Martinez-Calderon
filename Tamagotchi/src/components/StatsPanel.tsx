'use client';

import React from 'react';
import { PetState, FeedingTracker } from '@/types/tamagotchi';

interface StatsPanelProps {
  pet: PetState;
  feeding: FeedingTracker;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ pet, feeding }) => {
  const { hunger, fun, hygiene, happiness } = pet;

  // Hunger color rules as specified in design.md:
  // Verde: < 30%, Amarillo: 30%-70%, Rojo: > 70%
  const getHungerColorClass = (val: number): string => {
    if (val > 70) return 'color-danger';
    if (val >= 30) return 'color-warning';
    return 'color-good';
  };

  // Fun, Hygiene, Happiness color rules as specified in design.md:
  // Verde: > 60%, Amarillo: 30%-60%, Rojo: < 30%
  const getStandardColorClass = (val: number): string => {
    if (val > 60) return 'color-good';
    if (val >= 30) return 'color-warning';
    return 'color-danger';
  };

  // Helper to render 10 LCD segmented blocks
  const renderLcdBlocks = (val: number, colorClass: string) => {
    const filledCount = Math.min(10, Math.max(0, Math.round(val / 10)));
    return (
      <div className="lcd-blocks-row" role="progressbar" aria-valuenow={val} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: 10 }).map((_, i) => {
          const isFilled = i < filledCount;
          return (
            <span
              key={i}
              className={`lcd-block-segment ${isFilled ? `is-filled ${colorClass}` : 'is-empty'}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="stats-panel-container">
      <div className="stats-header">
        <span className="stats-header-title">MÉTRICAS VITALES</span>
        <span className={`stats-consecutive-tag ${feeding.consecutiveFeedings === 2 ? 'tag-warning' : ''}`}>
          Racha Comida: {feeding.consecutiveFeedings}/3
          {feeding.consecutiveFeedings === 2 && ' ⚠️'}
        </span>
      </div>

      <div className="stats-list">
        {/* Hambre */}
        <div className="stat-row">
          <div className="stat-label-wrap">
            <span className="stat-icon">🍖</span>
            <span className="stat-name">Hambre:</span>
          </div>
          <div className="stat-track-wrap">
            {renderLcdBlocks(hunger, getHungerColorClass(hunger))}
          </div>
          <span className={`stat-pct ${getHungerColorClass(hunger)}`}>
            {hunger}%
          </span>
        </div>

        {/* Diversión */}
        <div className="stat-row">
          <div className="stat-label-wrap">
            <span className="stat-icon">⚽</span>
            <span className="stat-name">Diversión:</span>
          </div>
          <div className="stat-track-wrap">
            {renderLcdBlocks(fun, getStandardColorClass(fun))}
          </div>
          <span className={`stat-pct ${getStandardColorClass(fun)}`}>
            {fun}%
          </span>
        </div>

        {/* Higiene */}
        <div className="stat-row">
          <div className="stat-label-wrap">
            <span className="stat-icon">🛁</span>
            <span className="stat-name">Higiene:</span>
          </div>
          <div className="stat-track-wrap">
            {renderLcdBlocks(hygiene, getStandardColorClass(hygiene))}
          </div>
          <span className={`stat-pct ${getStandardColorClass(hygiene)}`}>
            {hygiene}%
          </span>
        </div>

        {/* Felicidad General */}
        <div className="stat-row stat-row-happiness">
          <div className="stat-label-wrap">
            <span className="stat-icon">💖</span>
            <span className="stat-name">Felicidad:</span>
          </div>
          <div className="stat-track-wrap">
            {renderLcdBlocks(happiness, getStandardColorClass(happiness))}
          </div>
          <span className={`stat-pct ${getStandardColorClass(happiness)}`}>
            {happiness}%
          </span>
        </div>
      </div>
    </div>
  );
};
