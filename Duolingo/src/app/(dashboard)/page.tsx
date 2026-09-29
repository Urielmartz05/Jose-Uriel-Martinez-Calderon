'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { UserProgressData } from '@/types/user';
import LearningPath from '@/components/path/LearningPath';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [progressList, setProgressList] = useState<UserProgressData[]>([]);

  useEffect(() => {
    async function loadProgress() {
      if (!user) return;
      try {
        const res = await fetch('/api/progress');
        if (res.ok) {
          const data = await res.json();
          setProgressList(data.progress || []);
        }
      } catch (err) {
        console.error('Error al cargar progreso:', err);
      }
    }
    loadProgress();
  }, [user]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Persistent Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b-2 border-gray-200 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black text-duo-green tracking-tight">
              MathLingo
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-duo-green-bg text-duo-green-border px-2 py-0.5 rounded-full hidden sm:inline-block">
              6.º Primaria
            </span>
          </Link>

          {/* Stats & User Info */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* XP Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200">
              <span className="text-lg">⭐</span>
              <span className="font-black text-sm text-yellow-700">
                {user ? user.totalXp : 0} XP
              </span>
            </div>

            {/* Lives Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
              <span className="text-lg">❤️</span>
              <span className="font-black text-sm text-duo-red">3</span>
            </div>

            {/* Auth Buttons */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-duo-main hidden md:inline-block">
                  {user.username}
                </span>
                <Button variant="white" size="sm" onClick={() => logout()}>
                  Salir
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="white" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:inline-block">
                  <Button variant="green" size="sm">
                    Registro
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Path Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center">
        {/* Banner Welcome */}
        <div className="w-full max-w-md bg-gradient-to-r from-duo-green to-emerald-500 rounded-3xl p-6 text-white text-center shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-1">
              Ruta Matemática de 6.º Grado
            </h1>
            <p className="text-xs font-bold text-white/90">
              Supera cada temática con 70% o más de precisión para desbloquear el siguiente reto.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 text-7xl opacity-20 pointer-events-none">
            📐
          </div>
        </div>

        {/* 5 Nodes Learning Path */}
        <LearningPath progressList={progressList} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs font-bold text-duo-muted">
        MathLingo &copy; 2026 · Duolingo Matemático para 6.º de Primaria
      </footer>
    </div>
  );
}
