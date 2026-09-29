'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryId } from '@/types/game';
import { GameProvider, useGame } from '@/context/GameContext';
import ProgressBar from '@/components/game/ProgressBar';
import HeartCounter from '@/components/game/HeartCounter';
import QuestionCard from '@/components/game/QuestionCard';
import ActionFooter from '@/components/game/ActionFooter';
import GameOverModal from '@/components/game/GameOverModal';

const VALID_CATEGORIES: CategoryId[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'word_problems',
];

function GameSessionView() {
  const {
    currentQuestionIndex,
    currentQuestion,
    selectedOption,
    hearts,
    isAnswerChecked,
    isAnswerCorrect,
    isGameOver,
    isFinished,
    stats,
    questions,
    selectOption,
    checkAnswer,
    nextQuestion,
    restartLesson,
  } = useGame();

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-duo-green border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-duo-main text-base">Cargando preguntas...</p>
        </div>
      </div>
    );
  }

  const correctAnswerText =
    currentQuestion.options[currentQuestion.correctIndex] || '';

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between pb-32">
      {/* Persistent Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b-2 border-gray-100 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
          {/* Exit Button */}
          <Link
            href="/"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-duo-muted hover:bg-gray-100 font-black text-2xl transition-colors select-none"
            aria-label="Salir de la lección"
          >
            ✕
          </Link>

          {/* Progress Bar */}
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length || 20}
          />

          {/* Hearts Counter */}
          <HeartCounter hearts={hearts} />
        </div>
      </header>

      {/* Main Interactive Question Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center">
        <QuestionCard
          question={currentQuestion}
          selectedOption={selectedOption}
          onSelectOption={selectOption}
          isAnswerChecked={isAnswerChecked}
          isCorrect={isAnswerCorrect}
        />
      </main>

      {/* Reactive Action Footer */}
      <ActionFooter
        selectedOption={selectedOption}
        isAnswerChecked={isAnswerChecked}
        isCorrect={isAnswerCorrect}
        correctAnswerText={correctAnswerText}
        explanation={currentQuestion.explanation}
        onCheck={checkAnswer}
        onNext={nextQuestion}
      />

      {/* Game Over / Lesson Complete Modal */}
      <GameOverModal
        isOpen={isGameOver || isFinished}
        isGameOver={isGameOver}
        isFinished={isFinished}
        stats={stats}
        onRestart={restartLesson}
      />
    </div>
  );
}

export default function LearnCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.category as CategoryId;

  if (!VALID_CATEGORIES.includes(categoryId)) {
    notFound();
  }

  return (
    <GameProvider initialCategoryId={categoryId}>
      <GameSessionView />
    </GameProvider>
  );
}
