// src/app/api/auth/register/route.ts
// Inscription d'un nouvel utilisateur.
// Flux : validation Zod → vérification email unique → hash bcrypt → JWT → cookie

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { registerUser } from '@/backend/controllers/auth.controller';
import { ok, err, validationError } from '@/backend/lib/api-response';
import { COOKIE_NAME } from '@/backend/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // registerUser valide, hash le mot de passe (bcrypt coût 12), crée l'utilisateur et génère le JWT
    const { user, token } = await registerUser(body);

    // On crée la réponse JSON puis on y attache le cookie de session
    const response = ok(user, 201); // 201 Created
    response.cookies.set(COOKIE_NAME, token, {
      secure:   process.env.NODE_ENV === 'production', // HTTPS uniquement en production
      sameSite: 'lax',  // Protection CSRF de base (bloque les requêtes cross-site non sûres)
      path:     '/',    // Cookie disponible sur toute l'application
    });

    return response;
  } catch (e) {
    // ZodError → 422 avec le détail des champs invalides
    if (e instanceof ZodError) {
      return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    }
    // Autres erreurs (email déjà utilisé → 409, erreur DB → 500)
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}
