'use client';

import React from 'react';
import Button from '../ui/Button';

interface ActionFooterProps {
  selectedOption: number | null;
  isAnswerChecked: boolean;
  isCorrect: boolean | null;
  correctAnswerText: string;
  explanation: string;
  onCheck: () => void;
  onNext: () => void;
}

export function ActionFooter({
  selectedOption,
  isAnswerChecked,
  isCorrect,
  correctAnswerText,
  explanation,
  onCheck,
  onNext,
}: ActionFooterProps) {
  let footerBg = 'bg-white border-t-2 border-gray-200';
  let animClass = '';
  if (isAnswerChecked) {
    animClass = 'animate-slide-up';
    footerBg = isCorrect
      ? 'bg-duo-green-bg border-t-2 border-duo-green'
      : 'bg-duo-red-bg border-t-2 border-duo-red';
  }

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 py-4 px-4 sm:px-8 z-40 transition-colors duration-200 ${footerBg} ${animClass}`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Feedback info area */}
        <div className="flex-1">
          {!isAnswerChecked ? (
            <div className="hidden sm:block text-sm text-duo-muted font-bold">
              Selecciona una respuesta y presiona Comprobar
            </div>
          ) : isCorrect ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-duo-green text-white flex items-center justify-center font-black text-xl">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-black text-duo-green-border">
                  ¡Excelente trabajo!
                </h3>
                <p className="text-xs text-green-800 font-semibold">{explanation}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-duo-red text-white flex items-center justify-center font-black text-xl">
                ✕
              </div>
              <div>
                <h3 className="text-lg font-black text-duo-red-border">
                  Solución correcta: {correctAnswerText}
                </h3>
                <p className="text-xs text-red-800 font-semibold">{explanation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto">
          {!isAnswerChecked ? (
            <Button
              variant="green"
              size="lg"
              fullWidth
              disabled={selectedOption === null}
              onClick={onCheck}
              className="sm:min-w-[12rem]"
            >
              Comprobar
            </Button>
          ) : (
            <Button
              variant={isCorrect ? 'green' : 'red'}
              size="lg"
              fullWidth
              onClick={onNext}
              className="sm:min-w-[12rem]"
            >
              {isCorrect ? 'Continuar' : 'Entendido'}
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}

export default ActionFooter;
