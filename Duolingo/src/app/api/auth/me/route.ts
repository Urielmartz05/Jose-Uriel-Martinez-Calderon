import { NextRequest, NextResponse } from 'next/server';
import { initDB, User } from '@/db';
import { getAuthUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const tokenPayload = getAuthUserFromRequest(request);

    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await User.findByPk(tokenPayload.userId, {
      attributes: ['id', 'username', 'email', 'totalXp', 'createdAt'],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    console.error('Error en auth/me:', error);
    return NextResponse.json(
      { error: 'Error al verificar sesión' },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Logout
  const response = NextResponse.json({ message: 'Sesión cerrada exitosamente' });
  response.cookies.set('mathlingo_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
