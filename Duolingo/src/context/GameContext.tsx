'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CategoryId, Question, SessionStats } from '@/types/game';
import { questionsData } from '@/data/questions';
import soundFX from '@/lib/sound';

export type GameStatus = 'idle' | 'selecting' | 'evaluating' | 'reviewed' | 'finished';

interface GameContextType {
  categoryId: CategoryId;
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  selectedOption: number | null;
  hearts: number;
  isAnswerChecked: boolean;
  isAnswerCorrect: boolean | null;
  correctCount: number;
  incorrectCount: number;
  score: number;
  isGameOver: boolean;
  isFinished: boolean;
  stats: SessionStats;
  selectOption: (index: number) => void;
  checkAnswer: () => void;
  nextQuestion: () => void;
  restartLesson: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({
  children,
  initialCategoryId,
  initialQuestions,
}: {
  children: ReactNode;
  initialCategoryId: CategoryId;
  initialQuestions?: Question[];
}) {
  const [categoryId] = useState<CategoryId>(initialCategoryId);
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions || questionsData[initialCategoryId] || []
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hearts, setHearts] = useState(3);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!initialQuestions) {
      const fallback = questionsData[initialCategoryId] || [];
      setQuestions(fallback);
    }
  }, [initialCategoryId, initialQuestions]);

  const currentQuestion = questions[currentQuestionIndex] || null;

  const selectOption = useCallback(
    (index: number) => {
      if (isAnswerChecked || isGameOver || isFinished) return;
      setSelectedOption(index);
    },
    [isAnswerChecked, isGameOver, isFinished]
  );

  const checkAnswer = useCallback(() => {
    if (selectedOption === null || isAnswerChecked || !currentQuestion || isGameOver) return;

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    setIsAnswerChecked(true);
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      soundFX.playSuccess();
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + 10);
    } else {
      soundFX.playError();
      setIncorrectCount((prev) => prev + 1);
      setHearts((prevHearts) => {
        const nextHearts = Math.max(0, prevHearts - 1);
        if (nextHearts === 0) {
          setIsGameOver(true);
        }
        return nextHearts;
      });
    }
  }, [selectedOption, isAnswerChecked, currentQuestion, isGameOver]);

  const sendFinishSession = useCallback(
    async (finalStats: SessionStats) => {
      try {
        await fetch('/api/session/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            categoryId,
            score: finalStats.score,
            correctCount: finalStats.correctCount,
            incorrectCount: finalStats.incorrectCount,
            percentage: finalStats.accuracy,
            heartsLeft: finalStats.heartsLeft,
          }),
        });
      } catch (err) {
        console.error('Error al sincronizar resultado de sesión:', err);
      }
    },
    [categoryId]
  );

  const nextQuestion = useCallback(() => {
    if (!isAnswerChecked) return;

    if (isGameOver) {
      return;
    }

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setIsAnswerCorrect(null);
    } else {
      // Completed all questions
      setIsFinished(true);
      const totalQ = questions.length || 20;
      const accuracy = Number(((correctCount / totalQ) * 100).toFixed(1));
      const finalStats: SessionStats = {
        score,
        correctCount,
        incorrectCount,
        totalQuestions: totalQ,
        accuracy,
        xpEarned: score,
        heartsLeft: hearts,
        isComplete: true,
      };
      sendFinishSession(finalStats);
    }
  }, [
    isAnswerChecked,
    isGameOver,
    currentQuestionIndex,
    questions.length,
    correctCount,
    incorrectCount,
    score,
    hearts,
    sendFinishSession,
  ]);

  const restartLesson = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHearts(3);
    setIsAnswerChecked(false);
    setIsAnswerCorrect(null);
    setCorrectCount(0);
    setIncorrectCount(0);
    setScore(0);
    setIsGameOver(false);
    setIsFinished(false);
  }, []);

  const totalQuestions = questions.length || 20;
  const accuracy = Number(((correctCount / totalQuestions) * 100).toFixed(1));
  const stats: SessionStats = {
    score,
    correctCount,
    incorrectCount,
    totalQuestions,
    accuracy,
    xpEarned: score,
    heartsLeft: hearts,
    isComplete: isFinished,
  };

  return (
    <GameContext.Provider
      value={{
        categoryId,
        questions,
        currentQuestionIndex,
        currentQuestion,
        selectedOption,
        hearts,
        isAnswerChecked,
        isAnswerCorrect,
        correctCount,
        incorrectCount,
        score,
        isGameOver,
        isFinished,
        stats,
        selectOption,
        checkAnswer,
        nextQuestion,
        restartLesson,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe ser utilizado dentro de un GameProvider');
  }
  return context;
}
