import { NextRequest, NextResponse } from 'next/server';
import { dbAdapter } from '../../../lib/db/mock-adapter';
import { Track } from '../../../types/audio';

export async function GET() {
  const tracks = await dbAdapter.getAllTracks();
  return NextResponse.json(tracks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, artist, album, audioUrl, coverUrl, duration, genre, releaseYear } = body;

    if (!title || !artist || !audioUrl) {
      return NextResponse.json(
        { error: 'Los campos title, artist y audioUrl son obligatorios.' },
        { status: 400 }
      );
    }

    const trackData: Omit<Track, 'id' | 'createdAt'> = {
      title,
      artist,
      album: album || 'Single',
      audioUrl,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      duration: typeof duration === 'number' ? duration : parseInt(duration, 10) || 200,
      genre: genre || 'Various',
      releaseYear: releaseYear || new Date().getFullYear()
    };

    const newTrack = await dbAdapter.createTrack(trackData);
    return NextResponse.json(newTrack, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error procesando la solicitud de inserción de pista.' },
      { status: 500 }
    );
  }
}
