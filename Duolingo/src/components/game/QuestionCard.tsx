'use client';

import React, { useEffect } from 'react';
import { Question } from '@/types/game';

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  isAnswerChecked: boolean;
  isCorrect: boolean | null;
}

export function QuestionCard({
  question,
  selectedOption,
  onSelectOption,
  isAnswerChecked,
  isCorrect,
}: QuestionCardProps) {
  // Support numeric keyboard shortcuts 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerChecked) return;
      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (index >= 0 && index < question.options.length) {
          onSelectOption(index);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerChecked, onSelectOption, question.options.length]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Question Prompt */}
      <div className="w-full bg-white border-2 border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 text-center">
        <span className="text-xs uppercase font-extrabold tracking-wider text-duo-blue bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">
          Pregunta de Práctica
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-duo-main leading-relaxed">
          {question.prompt}
        </h2>
      </div>

      {/* 4 Options Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isThisCorrect = question.correctIndex === idx;

          let cardStyle =
            'bg-white border-2 border-gray-200 border-b-4 border-b-gray-300 text-duo-main hover:border-duo-blue hover:bg-blue-50/30';

          if (!isAnswerChecked) {
            if (isSelected) {
              cardStyle =
                'bg-blue-50 border-2 border-duo-blue border-b-4 border-b-duo-blue-border text-duo-blue translate-y-0.5';
            }
          } else {
            // Already checked answer
            if (isThisCorrect) {
              cardStyle =
                'bg-duo-green-bg border-2 border-duo-green border-b-4 border-b-duo-green-border text-duo-green-border';
            } else if (isSelected && !isCorrect) {
              cardStyle =
                'bg-duo-red-bg border-2 border-duo-red border-b-4 border-b-duo-red-border text-duo-red';
            } else {
              cardStyle = 'bg-gray-50 border-2 border-gray-200 border-b-4 border-b-gray-200 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswerChecked}
              onClick={() => onSelectOption(idx)}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-between transition-all duration-100 select-none ${cardStyle}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border ${
                    isSelected
                      ? 'bg-duo-blue text-white border-duo-blue'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="font-bold">{option}</span>
              </div>

              {isAnswerChecked && isThisCorrect && (
                <span className="text-duo-green font-black text-xl">✓</span>
              )}
              {isAnswerChecked && isSelected && !isCorrect && (
                <span className="text-duo-red font-black text-xl">✕</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionCard;
