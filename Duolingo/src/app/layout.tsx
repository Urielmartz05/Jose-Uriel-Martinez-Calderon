import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'MathLingo - Duolingo Matemático para 6.º de Primaria',
  description: 'Aprende matemáticas jugando con MathLingo: sumas, restas, multiplicaciones, divisiones y problemas razonados.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-duo-main antialiased selection:bg-duo-green-bg selection:text-duo-green-border">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
