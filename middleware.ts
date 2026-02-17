// middleware.ts (racine du projet)
// Le middleware Next.js s'exécute sur l'Edge Runtime avant chaque requête.
// Il protège les routes /dashboard/* en vérifiant le cookie JWT.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { COOKIE_NAME } from '@/lib/auth';

// Routes qui nécessitent une authentification
const PROTECTED_ROUTES = ['/dashboard'];

// Routes accessibles uniquement aux non-connectés (redirection si déjà connecté)
const AUTH_ONLY_ROUTES = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  const isAuthenticated = token ? await isTokenValid(token) : false;
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthOnly = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));

  // Redirige vers /login si la route est protégée et l'utilisateur n'est pas connecté
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname); // Pour rediriger après connexion
    return NextResponse.redirect(loginUrl);
  }

  // Redirige vers le dashboard si l'utilisateur est déjà connecté
  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

async function isTokenValid(token: string): Promise<boolean> {
  try {
    await verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

export const config = {
  // Le middleware s'applique à ces chemins (exclut les assets statiques)
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
