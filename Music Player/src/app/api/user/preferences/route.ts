import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '../../../../lib/db/mock-adapter';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'default-user';
  const prefs = await dbAdapter.getUserPreferences(userId);
  return NextResponse.json(prefs);
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default-user';
    const body = await req.json();

    await dbAdapter.updateUserPreferences(userId, body);
    const updated = await dbAdapter.getUserPreferences(userId);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: 'Error actualizando preferencias de usuario' },
      { status: 500 }
    );
  }
}
