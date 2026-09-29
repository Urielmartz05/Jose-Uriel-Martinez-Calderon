import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado o sesión expirada.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        settings: user.settings
          ? {
              defaultVolume: user.settings.defaultVolume,
              autoPlayNext: user.settings.autoPlayNext,
              theme: user.settings.theme,
              preferredEqualizer: user.settings.preferredEqualizer,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error en me:', error);
    return NextResponse.json(
      { error: 'Error interno obteniendo la sesión del usuario.' },
      { status: 500 }
    );
  }
}
