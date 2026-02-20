
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import type { JwtPayload } from '@/backend/models/user.model';

export const COOKIE_NAME = 'beatotheque_token';

export async function getAuthUser(): Promise<JwtPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<JwtPayload> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError('Non authentifié');
  }
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}