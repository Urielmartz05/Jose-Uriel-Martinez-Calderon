import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { UserSettings, initDB } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await initDB();
    const user = await getAuthenticatedUser(req);

    let targetUserId = user?.id;
    if (!targetUserId) {
      const { searchParams } = new URL(req.url);
      targetUserId = searchParams.get('userId') || undefined;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'No autenticado. Inicie sesión para consultar sus preferencias.' },
        { status: 401 }
      );
    }

    let settings = await UserSettings.findOne({ where: { userId: targetUserId } });
    if (!settings) {
      settings = await UserSettings.create({
        userId: targetUserId,
        defaultVolume: 0.8,
        autoPlayNext: true,
        theme: 'dark',
        preferredEqualizer: 'flat',
      });
    }

    return NextResponse.json({
      defaultVolume: settings.defaultVolume,
      autoPlayNext: settings.autoPlayNext,
      theme: settings.theme,
      preferredEqualizer: settings.preferredEqualizer,
    });
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return NextResponse.json(
      { error: 'Error interno obteniendo las preferencias del usuario.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await initDB();
    const user = await getAuthenticatedUser(req);

    let targetUserId = user?.id;
    if (!targetUserId) {
      const { searchParams } = new URL(req.url);
      targetUserId = searchParams.get('userId') || undefined;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión activa para actualizar configuraciones.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { defaultVolume, theme, preferredEqualizer, autoPlayNext } = body;

    let settings = await UserSettings.findOne({ where: { userId: targetUserId } });
    if (!settings) {
      settings = await UserSettings.create({
        userId: targetUserId,
        defaultVolume: typeof defaultVolume === 'number' ? defaultVolume : 0.8,
        autoPlayNext: typeof autoPlayNext === 'boolean' ? autoPlayNext : true,
        theme: ['dark', 'light', 'apple-classic'].includes(theme) ? theme : 'dark',
        preferredEqualizer: preferredEqualizer || 'flat',
      });
    } else {
      if (typeof defaultVolume === 'number' && defaultVolume >= 0.0 && defaultVolume <= 1.0) {
        settings.defaultVolume = defaultVolume;
      }
      if (['dark', 'light', 'apple-classic'].includes(theme)) {
        settings.theme = theme;
      }
      if (typeof preferredEqualizer === 'string' && preferredEqualizer.trim().length > 0) {
        settings.preferredEqualizer = preferredEqualizer.trim();
      }
      if (typeof autoPlayNext === 'boolean') {
        settings.autoPlayNext = autoPlayNext;
      }
      await settings.save();
    }

    return NextResponse.json({
      defaultVolume: settings.defaultVolume,
      autoPlayNext: settings.autoPlayNext,
      theme: settings.theme,
      preferredEqualizer: settings.preferredEqualizer,
    });
  } catch (error) {
    console.error('Error actualizando configuraciones:', error);
    return NextResponse.json(
      { error: 'Error interno al actualizar preferencias de usuario.' },
      { status: 500 }
    );
  }
}
