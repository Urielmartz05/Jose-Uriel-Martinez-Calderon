import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { User, UserSettings, initDB } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'music-player-super-secret-jwt-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  const cookieToken = req.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export async function getAuthenticatedUser(req: NextRequest): Promise<User | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.id) return null;

  await initDB();
  const user = await User.findByPk(payload.id, {
    include: [{ model: UserSettings, as: 'settings' }],
  });

  return user;
}
