import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '../../../../lib/db/mock-adapter';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const track = await dbAdapter.getTrackById(params.id);
  if (!track) {
    return NextResponse.json({ error: 'Pista no encontrada' }, { status: 404 });
  }
  return NextResponse.json(track);
}
