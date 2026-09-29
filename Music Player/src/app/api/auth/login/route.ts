import { NextRequest, NextResponse } from 'next/server';
import { User, UserSettings, initDB } from '@/db';
import { signToken } from '@/lib/auth';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Credenciales incompletas: proporcione email/usuario y contraseña.' },
        { status: 400 }
      );
    }

    const identifier = String(email).trim().toLowerCase();

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { username: String(email).trim() },
        ],
      },
      include: [{ model: UserSettings, as: 'settings' }],
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 401 }
      );
    }

    // Asegurar que existan configuraciones para el usuario
    let settings = user.settings;
    if (!settings) {
      settings = await UserSettings.create({
        userId: user.id,
        defaultVolume: 0.8,
        autoPlayNext: true,
        theme: 'dark',
        preferredEqualizer: 'flat',
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          settings: {
            defaultVolume: settings.defaultVolume,
            autoPlayNext: settings.autoPlayNext,
            theme: settings.theme,
            preferredEqualizer: settings.preferredEqualizer,
          },
        },
        token,
      },
      { status: 200 }
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
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor procesando el inicio de sesión.' },
      { status: 500 }
    );
  }
}
