// backend/lib/jwt.ts
// Génération et vérification des JSON Web Tokens (JWT).
// Utilise `jose` au lieu de `jsonwebtoken` car jose est compatible avec l'Edge Runtime
// de Next.js (middleware), qui n'a pas accès aux APIs Node.js comme `crypto`.

import { SignJWT, jwtVerify } from 'jose';
import type { JwtPayload } from '@/backend/models/user.model';

// Encode le secret texte en Uint8Array requis par l'API Web Crypto (utilisée par jose)
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET manquant dans les variables d\'environnement');
  return new TextEncoder().encode(secret);
}

// Génère un JWT signé avec HMAC-SHA256 (HS256)
// Le payload reçu est enrichi automatiquement par jose avec iat (issuedAt) et exp (expiration)
export async function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'; // Durée configurable via .env

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' }) // Algorithme de signature symétrique (secret partagé)
    .setIssuedAt()                         // Ajoute iat = timestamp actuel (UNIX)
    .setExpirationTime(expiresIn)          // Ajoute exp selon la durée configurée
    .sign(getSecret());
}

// Vérifie la signature et l'expiration du JWT, retourne le payload si valide.
// Lance une exception si le token est invalide, expiré ou si la signature ne correspond pas.
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());

  // Validation structurelle du payload — protection contre les tokens malformés
  if (typeof payload.sub !== 'string' || typeof payload['email'] !== 'string') {
    throw new Error('Payload JWT invalide');
  }

  return {
    sub:   payload.sub,
    email: payload['email'] as string,
    iat:   payload.iat,
    exp:   payload.exp,
  };
}
