// middleware.ts
// Middleware Next.js — s'exécute avant chaque requête vers les routes listées dans `config.matcher`.
// Vérifie le JWT dans le cookie et applique deux règles de redirection :
//   1. Route protégée sans auth → redirection vers /login?from=<pathname>
//   2. Route auth-only (login/register) avec auth → redirection vers /dashboard
//
// Important : ce middleware s'exécute dans l'Edge Runtime (non-Node.js),
// c'est pourquoi on utilise `jose` (Web Crypto) et non `jsonwebtoken` (Node.js crypto).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/backend/lib/jwt';
import { COOKIE_NAME } from '@/backend/lib/auth';

// Routes accessibles uniquement si l'utilisateur est authentifié
const PROTECTED_ROUTES = ['/dashboard'];

// Routes accessibles uniquement si l'utilisateur N'EST PAS authentifié
// (évite qu'un utilisateur connecté retourne sur /login ou /register)
const AUTH_ONLY_ROUTES = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lecture du cookie JWT depuis la requête entrante
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Vérifie la validité du token (signature + expiration)
  const isAuthenticated = token ? await isTokenValid(token) : false;

  // Détermine le type de route demandée
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthOnly  = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));

  // Cas 1 : accès à une route protégée sans être connecté
  // → redirige vers /login avec le paramètre `from` pour reprendre la navigation après connexion
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname); // Mémorise la destination initiale
    return NextResponse.redirect(loginUrl);
  }

  // Cas 2 : accès à /login ou /register alors qu'on est déjà connecté
  // → redirige directement vers le dashboard
  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Cas normal : laisse passer la requête
  return NextResponse.next();
}

// Vérifie la signature et l'expiration du JWT — retourne false en cas d'erreur
// (token forgé, expiré, secret modifié, etc.)
async function isTokenValid(token: string): Promise<boolean> {
  try {
    await verifyToken(token);
    return true;
  } catch {
    return false; // Token invalide ou expiré
  }
}

// Définit les routes sur lesquelles le middleware s'applique.
// Next.js n'exécute pas le middleware sur les fichiers statiques ni les routes API.
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
