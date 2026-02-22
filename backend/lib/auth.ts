// backend/lib/auth.ts
// Utilitaires d'authentification utilisés par les API routes et le middleware.
// Lit le cookie JWT, le vérifie et expose le payload ou lance une AuthError.

import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import type { JwtPayload } from '@/backend/models/user.model';

// Nom du cookie — centralisé ici pour éviter les incohérences entre les routes
export const COOKIE_NAME = 'beatotheque_token';

// Tente de lire et vérifier le JWT depuis les cookies de la requête en cours.
// Retourne le payload si valide, null si absent ou expiré (ne lance pas d'exception).
export async function getAuthUser(): Promise<JwtPayload | null> {
  try {
    const cookieStore = cookies(); // API Next.js — lit les cookies de la requête serveur
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token); // Lance une exception si le token est invalide/expiré
  } catch {
    return null; // Token invalide → utilisateur non authentifié
  }
}

// Version stricte de getAuthUser : lance une AuthError si l'utilisateur n'est pas connecté.
// À utiliser dans les routes qui nécessitent une authentification obligatoire.
export async function requireAuth(): Promise<JwtPayload> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthError('Non authentifié');
  }
  return user;
}

// Classe d'erreur dédiée à l'authentification — permet de la distinguer
// des autres erreurs dans les blocs catch des routes API (→ réponse 401)
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
