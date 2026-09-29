import type { Metadata } from 'next';
import './globals.css';
import { AudioProvider } from '../context/AudioContext';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'Apple Music Web Player',
  description: 'Reproductor de música moderno y minimalista con reproducción continua y gestión de catálogo.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        <AuthProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
