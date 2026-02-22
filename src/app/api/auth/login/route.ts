// src/app/api/auth/login/route.ts
// Connexion d'un utilisateur existant.
// Flux : validation Zod → vérification email → comparaison bcrypt → JWT → cookie httpOnly

import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { loginUser } from '@/backend/controllers/auth.controller';
import { ok, err, validationError } from '@/backend/lib/api-response';
import { COOKIE_NAME } from '@/backend/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // loginUser valide les données, compare le mot de passe haché et génère un JWT
    const { user, token } = await loginUser(body);

    // On crée la réponse JSON puis on y attache le cookie de session sécurisé
    const response = ok(user);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,   // Inaccessible à JavaScript → protection contre les attaques XSS
      secure:   process.env.NODE_ENV === 'production', // HTTPS uniquement en production
      sameSite: 'lax',  // Protection CSRF de base
      maxAge:   60 * 60 * 24 * 7, // Durée de vie : 7 jours (en secondes)
      path:     '/',    // Cookie disponible sur toute l'application
    });

    return response;
  } catch (e) {
    // ZodError → 422 avec le détail des champs invalides
    if (e instanceof ZodError) {
      return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    }
    // Autres erreurs (identifiants invalides → 401, erreur DB → 500)
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}
