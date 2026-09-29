import { initDB, sequelize, User, UserProgress, Question, GameSession } from '../db';
import { questionsData } from '../data/questions';

async function verifyDatabase() {
  console.log('--- 1. INICIANDO DIAGNÓSTICO DE BASE DE DATOS ---');
  
  // 1. Conexión y sincronización
  try {
    await initDB();
    console.log('✓ Conexión establecida y modelos sincronizados correctamente.');
  } catch (err) {
    console.error('✗ Error en conexión/sincronización:', err);
    process.exit(1);
  }

  // 2. Comprobar dialecto y configuración
  const dialect = sequelize.getDialect();
  console.log(`✓ Dialecto Sequelize en uso: ${dialect}`);

  // 3. Comprobar existencia de tablas
  const tables = await sequelize.getQueryInterface().showAllTables();
  console.log('✓ Tablas detectadas en la base de datos:', tables);

  const requiredTables = ['users', 'user_progress', 'questions', 'game_sessions'];
  const missingTables = requiredTables.filter(t => !tables.includes(t));
  if (missingTables.length > 0) {
    console.error('✗ Faltan tablas:', missingTables);
    process.exit(1);
  }
  console.log('✓ Todas las tablas requeridas existen.');

  // 4. Test CRUD de Usuario
  const testEmail = `test_${Date.now()}@mathlingo.test`;
  const testUsername = `user_${Date.now()}`;
  let createdUser: User | null = null;

  try {
    createdUser = await User.create({
      username: testUsername,
      email: testEmail,
      password: 'hashedpassword123',
      totalXp: 100,
    });
    console.log(`✓ Usuario de prueba creado exitosamente: ID=${createdUser.id}, Username=${createdUser.username}`);

    // Búsqueda por email
    const foundByEmail = await User.findOne({ where: { email: testEmail } });
    if (!foundByEmail || foundByEmail.id !== createdUser.id) {
      throw new Error('Fallo al recuperar usuario por email');
    }
    console.log('✓ Búsqueda por email exitosa.');

    // Búsqueda por username
    const foundByUsername = await User.findOne({ where: { username: testUsername } });
    if (!foundByUsername || foundByUsername.id !== createdUser.id) {
      throw new Error('Fallo al recuperar usuario por username');
    }
    console.log('✓ Búsqueda por username exitosa.');

    // Actualización de XP
    createdUser.totalXp += 50;
    await createdUser.save();
    const updatedUser = await User.findByPk(createdUser.id);
    if (!updatedUser || updatedUser.totalXp !== 150) {
      throw new Error('Fallo en la actualización de totalXp');
    }
    console.log('✓ Actualización de XP verificada (150 XP).');

  } catch (err) {
    console.error('✗ Error en pruebas de User:', err);
    process.exit(1);
  }

  // 5. Test UserProgress y Relación con User
  try {
    const progress = await UserProgress.create({
      userId: createdUser.id,
      categoryId: 'addition',
      completed: false,
      highscore: 80,
      bestAccuracy: 80.0,
    });
    console.log(`✓ Progreso creado para el usuario: Categoría=${progress.categoryId}, Highscore=${progress.highscore}`);

    // Comprobar asociación hasMany User -> UserProgress
    const userWithProgress = await User.findByPk(createdUser.id, {
      include: [{ model: UserProgress, as: 'progressList' }],
    });
    const progressCount = (userWithProgress as any)?.progressList?.length || 0;
    if (progressCount !== 1) {
      throw new Error(`Asociación User -> UserProgress falló, items: ${progressCount}`);
    }
    console.log('✓ Relación User.hasMany(UserProgress) verificada correctamente.');

    // Actualizar progreso a completado
    progress.completed = true;
    progress.highscore = 100;
    progress.bestAccuracy = 100.0;
    await progress.save();
    console.log('✓ Progreso actualizado a completado.');
  } catch (err) {
    console.error('✗ Error en UserProgress:', err);
    process.exit(1);
  }

  // 6. Test GameSession y Relación con User
  try {
    const session = await GameSession.create({
      userId: createdUser.id,
      categoryId: 'addition',
      score: 100,
      correctCount: 20,
      incorrectCount: 0,
      percentage: 100,
      heartsLeft: 3,
      finishedAt: new Date(),
    });
    console.log(`✓ Sesión de juego creada: ID=${session.id}, Score=${session.score}`);

    // Comprobar asociación User -> GameSession
    const userWithSessions = await User.findByPk(createdUser.id, {
      include: [{ model: GameSession, as: 'gameSessions' }],
    });
    const sessionsCount = (userWithSessions as any)?.gameSessions?.length || 0;
    if (sessionsCount !== 1) {
      throw new Error(`Asociación User -> GameSession falló, items: ${sessionsCount}`);
    }
    console.log('✓ Relación User.hasMany(GameSession) verificada correctamente.');
  } catch (err) {
    console.error('✗ Error en GameSession:', err);
    process.exit(1);
  }

  // 7. Test Question Model & Banco de datos
  try {
    const qCount = await Question.count();
    console.log(`✓ Total preguntas actuales en BD: ${qCount}`);

    // Probar inserción de una pregunta de prueba
    const testQId = `test_q_${Date.now()}`;
    const testQuestion = await Question.create({
      id: testQId,
      categoryId: 'addition',
      prompt: '¿Cuánto es 5 + 5?',
      options: ['8', '9', '10', '11'],
      correctIndex: 2,
      explanation: '5 + 5 = 10',
    });

    const retrievedQ = await Question.findByPk(testQId);
    if (!retrievedQ) throw new Error('No se pudo recuperar la pregunta creada');
    const parsedOptions = typeof retrievedQ.options === 'string' ? JSON.parse(retrievedQ.options) : retrievedQ.options;
    if (!Array.isArray(parsedOptions) || parsedOptions.length !== 4 || parsedOptions[2] !== '10') {
      throw new Error('Las opciones JSON de la pregunta no coinciden');
    }
    console.log('✓ Pregunta creada y recuperada con deserialización JSON correcta.');

    // Limpieza de pregunta de prueba
    await testQuestion.destroy();
    console.log('✓ Pregunta de prueba eliminada.');
  } catch (err) {
    console.error('✗ Error en Question:', err);
    process.exit(1);
  }

  // 8. Limpieza de datos de prueba
  try {
    await GameSession.destroy({ where: { userId: createdUser.id } });
    await UserProgress.destroy({ where: { userId: createdUser.id } });
    await User.destroy({ where: { id: createdUser.id } });
    console.log('✓ Limpieza de datos de prueba finalizada correctamente.');
  } catch (err) {
    console.error('✗ Error en limpieza:', err);
  }

  // 9. Conteo de registros existentes reales
  const finalUserCount = await User.count();
  const finalProgressCount = await UserProgress.count();
  const finalSessionCount = await GameSession.count();
  const finalQuestionCount = await Question.count();

  console.log('\n--- RESUMEN DEL ESTADO ACTUAL DE LA BASE DE DATOS ---');
  console.log(`- Usuarios registrados: ${finalUserCount}`);
  console.log(`- Registros de progreso: ${finalProgressCount}`);
  console.log(`- Sesiones de juego guardadas: ${finalSessionCount}`);
  console.log(`- Preguntas en BD: ${finalQuestionCount}`);
  console.log('----------------------------------------------------');
  console.log('TODAS LAS OPERACIONES DE BASE DE DATOS FUNCIONAN AL 100%.');
}

verifyDatabase().catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
});
