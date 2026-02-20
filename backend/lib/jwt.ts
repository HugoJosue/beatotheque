// (compatible Edge runtime de Next.js, contrairement à `jsonwebtoken`)

import { SignJWT, jwtVerify } from 'jose';
import type { JwtPayload } from '@/backend/models/user.model';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET manquant dans les variables d\'environnement');
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());

  if (typeof payload.sub !== 'string' || typeof payload['email'] !== 'string') {
    throw new Error('Payload JWT invalide');
  }

  return {
    sub: payload.sub,
    email: payload['email'] as string,
    iat: payload.iat,
    exp: payload.exp,
  };
}