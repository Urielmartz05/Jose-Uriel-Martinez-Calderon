'use client';

import React, { useEffect, useState } from 'react';

interface HeartCounterProps {
  hearts: number;
  maxHearts?: number;
}

export function HeartCounter({ hearts, maxHearts = 3 }: HeartCounterProps) {
  const [shaking, setShaking] = useState(false);
  const [prevHearts, setPrevHearts] = useState(hearts);

  useEffect(() => {
    if (hearts < prevHearts) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 600);
      setPrevHearts(hearts);
      return () => clearTimeout(timer);
    }
    setPrevHearts(hearts);
  }, [hearts, prevHearts]);

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 select-none ${
        shaking ? 'animate-heart-shake' : ''
      }`}
    >
      <svg
        className={`w-6 h-6 ${hearts > 0 ? 'text-duo-red fill-duo-red' : 'text-gray-300 fill-gray-300'} transition-transform duration-200`}
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span className="font-extrabold text-base text-duo-red">
        {hearts}
      </span>
      <div className="flex gap-0.5 ml-1">
        {Array.from({ length: maxHearts }).map((_, i) => (
          <span
            key={i}
            className={`inline-block w-2 h-2 rounded-full ${
              i < hearts ? 'bg-duo-red' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeartCounter;
