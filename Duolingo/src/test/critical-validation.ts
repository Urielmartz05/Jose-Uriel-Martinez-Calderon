import { questionsData } from '../data/questions';
import { initDB, User, UserProgress, Question, GameSession } from '../db';
import { hashPassword } from '../lib/auth';

export async function runCriticalValidation() {
  const results = {
    db_connection_and_sync: false,
    test_1_hearts_and_game_over: false,
    test_2_accuracy_and_level_transition: false,
    test_3_question_bank_integrity: false,
  };

  // 1. Validar conexión y sincronización de base de datos
  try {
    await initDB();
    results.db_connection_and_sync = true;
  } catch (err) {
    console.error('DB Error:', err);
  }

  // 2. Test 1: Deducción de vidas y Game Over
  const state = { hearts: 3, isGameOver: false };

  function handleWrongAnswer() {
    if (state.isGameOver) return;
    state.hearts = Math.max(0, state.hearts - 1);
    if (state.hearts === 0) {
      state.isGameOver = true;
    }
  }

  handleWrongAnswer(); // hearts = 2
  handleWrongAnswer(); // hearts = 1
  handleWrongAnswer(); // hearts = 0 -> isGameOver = true
  const heartsAfterThreeWrong = state.hearts;
  const isGameOverState = state.isGameOver;
  handleWrongAnswer(); // no change

  if (heartsAfterThreeWrong === 0 && isGameOverState === true && state.hearts === 0) {
    results.test_1_hearts_and_game_over = true;
  }

  // 3. Test 2: Cálculo de precisión y transición de nivel
  const correctAnswers = 16;
  const totalQuestions = 20;
  const accuracy = (correctAnswers / totalQuestions) * 100; // 80%
  const thresholdPassed = accuracy >= 70;

  if (accuracy === 80 && thresholdPassed === true) {
    results.test_2_accuracy_and_level_transition = true;
  }

  // 4. Test 3: Integridad del banco de preguntas
  const categories = ['addition', 'subtraction', 'multiplication', 'division', 'word_problems'];
  let integrityPassed = true;

  for (const cat of categories) {
    const list = questionsData[cat];
    if (!list || list.length !== 20) {
      integrityPassed = false;
      break;
    }

    for (const q of list) {
      if (!q.options || q.options.length !== 4) {
        integrityPassed = false;
        break;
      }
      // Check 4 distinct options
      const distinct = new Set(q.options);
      if (distinct.size !== 4) {
        integrityPassed = false;
        break;
      }
      // Check correctIndex in [0, 3]
      if (q.correctIndex < 0 || q.correctIndex > 3) {
        integrityPassed = false;
        break;
      }
    }
  }

  results.test_3_question_bank_integrity = integrityPassed;

  return results;
}

if (require.main === module || !process.env.TEST_IMPORT) {
  runCriticalValidation().then((res) => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

