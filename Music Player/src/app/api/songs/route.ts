import { NextRequest, NextResponse } from 'next/server';
import { Song, initDB } from '@/db';
import { seedDatabase } from '@/db/seed';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDB();
    const count = await Song.count();
    if (count === 0) {
      await seedDatabase();
    }

    const songs = await Song.findAll({
      order: [['createdAt', 'ASC']],
    });

    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error('Error al obtener canciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al consultar el catálogo de canciones.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDB();
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión activa para registrar nuevas pistas en el catálogo.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, artist, album, duration, coverUrl, audioUrl, genre } = body;

    if (!title || !artist || !audioUrl) {
      return NextResponse.json(
        { error: 'Los campos title, artist y audioUrl son obligatorios.' },
        { status: 400 }
      );
    }

    const parsedDuration =
      typeof duration === 'number'
        ? Math.max(0, Math.floor(duration))
        : parseInt(String(duration), 10) || 0;

    const newSong = await Song.create({
      title: String(title).trim(),
      artist: String(artist).trim(),
      album: album ? String(album).trim() : 'Single',
      duration: parsedDuration,
      coverUrl: coverUrl ? String(coverUrl).trim() : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
      audioUrl: String(audioUrl).trim(),
      genre: genre ? String(genre).trim() : 'Pop',
      uploaderId: user.id,
    });

    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    console.error('Error al registrar canción:', error);
    return NextResponse.json(
      { error: 'Error interno al registrar la nueva pista.' },
      { status: 500 }
    );
  }
}
