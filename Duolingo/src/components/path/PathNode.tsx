'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryId } from '@/types/game';

interface PathNodeProps {
  id: CategoryId;
  title: string;
  symbol: string;
  isLocked: boolean;
  isCompleted: boolean;
  accuracy: number;
  offsetClass?: string;
}

export function PathNode({
  id,
  title,
  symbol,
  isLocked,
  isCompleted,
  accuracy,
  offsetClass = 'translate-x-0',
}: PathNodeProps) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  const nodeContent = (
    <div className={`flex flex-col items-center group ${offsetClass}`}>
      <div className="relative flex items-center justify-center">
        {/* SVG Progress Ring */}
        {!isLocked && (
          <svg className="w-28 h-28 transform -rotate-90 pointer-events-none absolute -inset-2">
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-gray-200"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-duo-yellow transition-all duration-500 ease-out"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
        )}

        {/* 3D Circular Button */}
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center font-black text-3xl select-none transition-all duration-150 relative ${
            isLocked
              ? 'bg-duo-gray-disabled border-2 border-gray-300 border-b-[6px] border-b-duo-gray-border text-gray-400 cursor-not-allowed'
              : isCompleted
              ? 'bg-duo-yellow border-2 border-yellow-400 border-b-[6px] border-b-duo-yellow-border text-white shadow-lg active:translate-y-1 active:border-b-0 cursor-pointer'
              : 'bg-duo-green border-2 border-green-500 border-b-[6px] border-b-duo-green-border text-white shadow-lg active:translate-y-1 active:border-b-0 cursor-pointer'
          }`}
        >
          {isLocked ? (
            <svg
              className="w-8 h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          ) : (
            <span>{symbol}</span>
          )}

          {/* Floating Completion Crown / Star */}
          {isCompleted && (
            <div className="absolute -top-3 -right-2 bg-white rounded-full p-1 border-2 border-yellow-400 shadow-md">
              <span className="text-sm">👑</span>
            </div>
          )}
        </div>
      </div>

      {/* Label Box */}
      <div className="mt-3 text-center">
        <h4 className="font-extrabold text-sm sm:text-base text-duo-main">
          {title}
        </h4>
        <span className="text-xs font-black text-duo-muted uppercase tracking-wider block">
          {isLocked
            ? 'Bloqueado'
            : isCompleted
            ? `100% · ${accuracy}% Precisión`
            : accuracy > 0
            ? `${accuracy}% Avance`
            : 'Empezar'}
        </span>
      </div>
    </div>
  );

  if (isLocked) {
    return <div className="select-none opacity-80">{nodeContent}</div>;
  }

  return (
    <Link href={`/learn/${id}`} className="transition-transform hover:scale-105">
      {nodeContent}
    </Link>
  );
}

export default PathNode;
