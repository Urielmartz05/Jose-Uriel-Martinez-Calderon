import { NextRequest, NextResponse } from 'next/server';
import { initDB, User, UserProgress, GameSession } from '@/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const tokenPayload = getAuthUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { categoryId, score, correctCount, incorrectCount, percentage, heartsLeft } = body;

    if (!categoryId || score === undefined || correctCount === undefined) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos de la sesión' },
        { status: 400 }
      );
    }

    // Record game session
    const session = await GameSession.create({
      userId: tokenPayload.userId,
      categoryId,
      score: Number(score),
      correctCount: Number(correctCount),
      incorrectCount: Number(incorrectCount),
      percentage: Number(percentage),
      heartsLeft: Number(heartsLeft),
      finishedAt: new Date(),
    });

    // Update User XP
    const user = await User.findByPk(tokenPayload.userId);
    if (user) {
      user.totalXp += Number(score);
      await user.save();
    }

    // Update UserProgress for the category
    let progress = await UserProgress.findOne({
      where: {
        userId: tokenPayload.userId,
        categoryId,
      },
    });

    const isLevelPassed = Number(percentage) >= 70; // 70% threshold

    if (progress) {
      if (score > progress.highscore) {
        progress.highscore = score;
      }
      if (percentage > progress.bestAccuracy) {
        progress.bestAccuracy = percentage;
      }
      if (isLevelPassed) {
        progress.completed = true;
      }
      await progress.save();
    } else {
      progress = await UserProgress.create({
        userId: tokenPayload.userId,
        categoryId,
        completed: isLevelPassed,
        highscore: score,
        bestAccuracy: percentage,
      });
    }

    return NextResponse.json({
      message: 'Sesión guardada exitosamente',
      session,
      progress,
      totalXp: user ? user.totalXp : 0,
    });
  } catch (error: unknown) {
    console.error('Error en POST /api/session/finish:', error);
    return NextResponse.json(
      { error: 'Error al finalizar y registrar sesión' },
      { status: 500 }
    );
  }
}
