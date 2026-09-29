'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { SessionStats } from '@/types/game';
import Button from '../ui/Button';

interface GameOverModalProps {
  isOpen: boolean;
  isGameOver: boolean; // hearts === 0
  isFinished: boolean; // completed 20 questions
  stats: SessionStats;
  onRestart: () => void;
}

export function GameOverModal({
  isOpen,
  isGameOver,
  isFinished,
  stats,
  onRestart,
}: GameOverModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen && isFinished && stats.accuracy >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen, isFinished, stats.accuracy]);

  if (!isOpen) return null;

  const isSuccess = isFinished && stats.accuracy >= 70;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-gray-100 flex flex-col items-center text-center">
        {/* Animated Icon / Avatar */}
        <div className="mb-4">
          {isGameOver ? (
            <div className="w-20 h-20 rounded-full bg-red-100 border-4 border-duo-red flex items-center justify-center text-4xl shadow-inner">
              💔
            </div>
          ) : isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-yellow-100 border-4 border-duo-yellow flex items-center justify-center text-4xl shadow-inner animate-bounce">
              🏆
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-duo-blue flex items-center justify-center text-4xl shadow-inner">
              📚
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-duo-main mb-2">
          {isGameOver
            ? '¡Te has quedado sin vidas!'
            : isSuccess
            ? '¡Lección Completada!'
            : '¡Buen intento! Sigue practicando'}
        </h2>

        <p className="text-sm font-bold text-duo-muted mb-6">
          {isGameOver
            ? 'No te rindas, los errores son parte del aprendizaje.'
            : isSuccess
            ? '¡Has demostrado un gran dominio en esta temática!'
            : 'Necesitas al menos 70% de precisión para desbloquear el siguiente nivel.'}
        </p>

        {/* 3 Metric Cards Grid */}
        <div className="w-full grid grid-cols-3 gap-3 mb-8">
          {/* Precisión */}
          <div className="bg-blue-50 border-2 border-duo-blue/30 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-duo-blue">Precisión</span>
            <span className="text-xl sm:text-2xl font-black text-duo-blue mt-1">
              {stats.accuracy}%
            </span>
          </div>

          {/* Aciertos */}
          <div className="bg-green-50 border-2 border-duo-green/30 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-duo-green-border">Aciertos</span>
            <span className="text-xl sm:text-2xl font-black text-duo-green mt-1">
              {stats.correctCount}/{stats.totalQuestions}
            </span>
          </div>

          {/* XP Ganado */}
          <div className="bg-yellow-50 border-2 border-duo-yellow/30 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-yellow-700">Total XP</span>
            <span className="text-xl sm:text-2xl font-black text-duo-yellow mt-1">
              +{stats.xpEarned}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Button variant="green" size="lg" fullWidth onClick={onRestart}>
            Reiniciar Lección
          </Button>

          <Button
            variant="white"
            size="md"
            fullWidth
            onClick={() => router.push('/')}
          >
            Volver a la Ruta
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
