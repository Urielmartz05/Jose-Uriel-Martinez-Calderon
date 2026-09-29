import { NextRequest, NextResponse } from 'next/server';
import { initDB, User } from '@/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const body = await request.json();
    const { identifier, password } = body; // identifier can be email or username

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Credenciales incompletas (identifier y password son requeridos)' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim();
    const user = await User.findOne({
      where: trimmed.includes('@')
        ? { email: trimmed.toLowerCase() }
        : { username: trimmed },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: 'Sesión iniciada correctamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          totalXp: user.totalXp,
        },
        token,
      },
      { status: 200 }
    );

    response.cookies.set('mathlingo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al iniciar sesión' },
      { status: 500 }
    );
  }
}
