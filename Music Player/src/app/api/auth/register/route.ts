import { NextRequest, NextResponse } from 'next/server';
import { User, UserSettings, initDB } from '@/db';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Los campos username, email y password son obligatorios.' },
        { status: 400 }
      );
    }

    if (typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json(
        { error: 'El nombre de usuario debe tener al menos 3 caracteres.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato de correo electrónico no es válido.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener un mínimo de 6 caracteres.' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario registrado con este correo electrónico.' },
        { status: 409 }
      );
    }

    const existingUsername = await User.findOne({
      where: { username: username.trim() },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya se encuentra en uso.' },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      password,
    });

    const defaultSettings = await UserSettings.create({
      userId: newUser.id,
      defaultVolume: 0.8,
      autoPlayNext: true,
      theme: 'dark',
      preferredEqualizer: 'flat',
    });

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    const response = NextResponse.json(
      {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          settings: {
            defaultVolume: defaultSettings.defaultVolume,
            autoPlayNext: defaultSettings.autoPlayNext,
            theme: defaultSettings.theme,
            preferredEqualizer: defaultSettings.preferredEqualizer,
          },
        },
        token,
      },
      { status: 201 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return response;
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor procesando el registro.' },
      { status: 500 }
    );
  }
}
