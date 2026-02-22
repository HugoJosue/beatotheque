// src/app/api/auth/logout/route.ts
// Déconnexion : invalide le cookie JWT côté serveur en le remplaçant par
// un cookie vide avec maxAge=0 (expire immédiatement).
// Aucune base de données n'est sollicitée — le JWT est stateless.

import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/backend/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, data: { message: 'Déconnecté' } });

  // Écrase le cookie existant par un cookie vide qui expire immédiatement
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,   // 0 = expire immédiatement → le navigateur supprime le cookie
    path:     '/',
  });

  return response;
}
