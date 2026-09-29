import { NextRequest, NextResponse } from 'next/server';
import { initDB, User, UserProgress } from '@/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos (username, email, password)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El correo electrónico ya está registrado' },
        { status: 409 }
      );
    }

    const existingUsername = await User.findOne({
      where: { username: username.trim() },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      totalXp: 0,
    });

    // Initialize progress for the 5 categories
    const categories: Array<'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems'> = [
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'word_problems',
    ];

    for (const categoryId of categories) {
      await UserProgress.create({
        userId: newUser.id,
        categoryId,
        completed: false,
        highscore: 0,
        bestAccuracy: 0,
      });
    }

    const token = signToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    const response = NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          totalXp: newUser.totalXp,
        },
        token,
      },
      { status: 201 }
    );

    response.cookies.set('mathlingo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error('Error en register:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al registrar usuario' },
      { status: 500 }
    );
  }
}
