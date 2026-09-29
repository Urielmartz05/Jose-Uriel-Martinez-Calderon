import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tamagotchi Web Simulator - 24 Horas',
  description:
    'Simulador interactivo de mascota virtual tipo Tamagotchi con ciclo de 24 horas y bucle temporal reactivo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
