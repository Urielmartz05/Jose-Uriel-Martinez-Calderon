'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await register(username, email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Error al crear la cuenta');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="text-2xl sm:text-3xl font-black text-duo-green tracking-tight">
          MathLingo
        </Link>
        <Link href="/login">
          <Button variant="white" size="sm">
            Iniciar Sesión
          </Button>
        </Link>
      </header>

      {/* Main Register Card */}
      <main className="max-w-md w-full mx-auto my-auto p-6 sm:p-8 bg-white border-2 border-gray-200 rounded-3xl shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-duo-main text-center mb-2">
          Crea tu Perfil
        </h1>
        <p className="text-xs sm:text-sm font-bold text-duo-muted text-center mb-6">
          Comienza tu aventura matemática de 6.º de primaria.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-duo-red-bg border-2 border-duo-red rounded-2xl text-xs font-black text-duo-red text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-duo-muted mb-1">
              Nombre de Usuario
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="matematico_pro"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-duo-main outline-none focus:border-duo-blue focus:bg-blue-50/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-duo-muted mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alumno@escuela.com"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl font-bold text-duo-main outline-none focus:border-duo-blue focus:bg-blue-50/20 transition-all"
            />
          </div>

          <Button
            type="submit"
            variant="green"
            size="lg"
            fullWidth
            disabled={isSubmitting || !username || !email || !password}
            className="mt-4"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs font-bold text-duo-muted">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-duo-blue font-extrabold hover:underline">
              Inicia sesión aquí
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
