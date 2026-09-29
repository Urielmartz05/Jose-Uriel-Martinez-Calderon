import { NextRequest, NextResponse } from 'next/server';
import { initDB, UserProgress, User } from '@/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const tokenPayload = getAuthUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const progressList = await UserProgress.findAll({
      where: { userId: tokenPayload.userId },
    });

    const user = await User.findByPk(tokenPayload.userId, {
      attributes: ['id', 'username', 'email', 'totalXp'],
    });

    return NextResponse.json({
      progress: progressList,
      user,
    });
  } catch (error: unknown) {
    console.error('Error en GET /api/progress:', error);
    return NextResponse.json(
      { error: 'Error al obtener progreso' },
      { status: 500 }
    );
  }
}
