'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(identifier, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="text-2xl sm:text-3xl font-black text-duo-green tracking-tight">
          MathLingo
        </Link>
        <Link href="/register">
          <Button variant="white" size="sm">
            Registrarse
          </Button>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto p-6 sm:p-8 bg-white border-2 border-gray-200 rounded-3xl shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-duo-main text-center mb-2">
          Iniciar Sesión
        </h1>
        <p className="text-xs sm:text-sm font-bold text-duo-muted text-center mb-6">
          Ingresa a tu cuenta para continuar tu racha matemática.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-duo-red-bg border-2 border-duo-red rounded-2xl text-xs font-black text-duo-red text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-duo-muted mb-1">
              Usuario o Correo
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ejemplo@correo.com o mi_usuario"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-duo-main outline-none focus:border-duo-blue focus:bg-blue-50/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-duo-muted mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-duo-main outline-none focus:border-duo-blue focus:bg-blue-50/20 transition-all"
            />
          </div>

          <Button
            type="submit"
            variant="green"
            size="lg"
            fullWidth
            disabled={isSubmitting || !identifier || !password}
            className="mt-4"
          >
            {isSubmitting ? 'Iniciando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs font-bold text-duo-muted">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-duo-blue font-extrabold hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs font-bold text-duo-muted">
        MathLingo &copy; 2026 · Matemáticas de 6.º de Primaria
      </footer>
    </div>
  );
}
