'use client';

import React from 'react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export function Sidebar({ currentTab, onSelectTab, onOpenAddModal }: SidebarProps) {
  const navItems = [
    {
      id: 'songs',
      label: 'Canciones',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    }
  ];

  return (
    <aside
      aria-label="Navegación lateral de biblioteca"
      style={{
        width: '240px',
        minWidth: '240px',
        height: 'calc(100vh - 84px)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: '24px',
        userSelect: 'none'
      }}
    >
      {/* Logotipo / Marca Apple Music Aesthetic */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-apple-red)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
            Music
          </h1>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Next.js Player
          </span>
        </div>
      </div>

      {/* Menú Principal */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            padding: '8px',
            marginBottom: '4px'
          }}
        >
          Biblioteca
        </span>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'var(--bg-card-hover)' : 'transparent',
                color: isActive ? 'var(--accent-apple-red)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Botón Añadir Canción */}
        <button
          type="button"
          onClick={onOpenAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            textAlign: 'left',
            marginTop: '8px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Subir Pista</span>
        </button>
      </nav>

      {/* Guía de Atajos de Teclado */}
      <div
        style={{
          marginTop: 'auto',
          padding: '12px',
          borderRadius: '10px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}
      >
        <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Atajos de Teclado
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <span><kbd style={kbdStyle}>Espacio</kbd> Play/Pausa</span>
          <span><kbd style={kbdStyle}>← / →</kbd> Seek 5s</span>
          <span><kbd style={kbdStyle}>↑ / ↓</kbd> Vol</span>
          <span><kbd style={kbdStyle}>M</kbd> Mute</span>
          <span><kbd style={kbdStyle}>S</kbd> Shuffle</span>
          <span><kbd style={kbdStyle}>R</kbd> Repeat</span>
        </div>
      </div>
    </aside>
  );
}

const kbdStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  padding: '2px 4px',
  borderRadius: '4px',
  color: 'var(--text-primary)',
  fontWeight: 600
};
