'use client';

import React from 'react';
import PathNode from './PathNode';
import { CategoryId } from '@/types/game';
import { UserProgressData } from '@/types/user';

interface LearningPathProps {
  progressList: UserProgressData[];
}

interface NodeDefinition {
  id: CategoryId;
  title: string;
  symbol: string;
  offsetClass: string;
}

const NODES: NodeDefinition[] = [
  { id: 'addition', title: '1. Sumas', symbol: '+', offsetClass: 'translate-x-0' },
  { id: 'subtraction', title: '2. Restas', symbol: '−', offsetClass: '-translate-x-12 sm:-translate-x-16' },
  { id: 'multiplication', title: '3. Multiplicaciones', symbol: '×', offsetClass: 'translate-x-12 sm:translate-x-16' },
  { id: 'division', title: '4. Divisiones', symbol: '÷', offsetClass: '-translate-x-12 sm:-translate-x-16' },
  { id: 'word_problems', title: '5. Problemas Razonados', symbol: '?', offsetClass: 'translate-x-0' },
];

export function LearningPath({ progressList }: LearningPathProps) {
  const getProgressFor = (catId: CategoryId) => {
    return progressList.find((p) => p.categoryId === catId);
  };

  return (
    <div className="flex flex-col items-center py-10 relative max-w-md mx-auto">
      {NODES.map((node, index) => {
        const currentProgress = getProgressFor(node.id);
        const isCompleted = currentProgress?.completed ?? false;
        const accuracy = currentProgress?.bestAccuracy ?? 0;

        // First node (addition) is always unlocked.
        // Node N is unlocked if Node N-1 is completed.
        let isLocked = false;
        if (index > 0) {
          const prevNodeDef = NODES[index - 1];
          const prevProgress = getProgressFor(prevNodeDef.id);
          isLocked = !(prevProgress?.completed);
        }

        return (
          <React.Fragment key={node.id}>
            <div className="relative z-10 my-4">
              <PathNode
                id={node.id}
                title={node.title}
                symbol={node.symbol}
                isLocked={isLocked}
                isCompleted={isCompleted}
                accuracy={accuracy}
                offsetClass={node.offsetClass}
              />
            </div>

            {/* Connecting line between nodes */}
            {index < NODES.length - 1 && (
              <div className="w-1.5 h-12 bg-gray-200 rounded-full my-[-8px] z-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default LearningPath;
