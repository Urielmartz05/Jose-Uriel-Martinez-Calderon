'use client';

import React from 'react';
import { GameLogEntry } from '@/types/tamagotchi';

interface ActivityLogProps {
  logs: GameLogEntry[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <div className="activity-log-container">
      <div className="activity-log-header">
        <span className="log-header-title">Registro de Eventos</span>
        <span className="log-header-badge">{logs.length} eventos</span>
      </div>

      <div className="activity-log-list">
        {logs.map((entry) => {
          const hourText = `[${String(entry.simulatedHour).padStart(2, '0')}:00]`;
          return (
            <div key={entry.id} className={`log-entry log-entry-${entry.type}`}>
              <span className="log-entry-time">{hourText}</span>
              <span className="log-entry-msg">{entry.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
