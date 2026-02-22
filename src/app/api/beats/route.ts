// src/app/api/beats/route.ts
// Endpoints du catalogue de beats.
// Note sur le cache : cette route lit les searchParams (style, page, limit),
// ce qui la rend dynamique par défaut dans Next.js → pas de mise en cache statique.
// Le cache est géré côté client par le navigateur (Cache-Control standard).

import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getBeats, createBeat } from '@/backend/controllers/beat.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err, validationError } from '@/backend/lib/api-response';

// GET /api/beats — public, supporte ?style= &page= &limit=
// Retourne la liste paginée des beats avec métadonnées de pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const result = await getBeats({
      style: searchParams.get('style') ?? undefined,       // Filtre optionnel par genre musical
      page:  searchParams.has('page')  ? Number(searchParams.get('page'))  : 1,  // Page courante (défaut: 1)
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : 12, // Éléments par page (défaut: 12)
    });

    return ok(result);
  } catch {
    return err('Erreur serveur', 500);
  }
}

// POST /api/beats — protégé (JWT requis dans le cookie)
// Crée un nouveau beat associé à l'utilisateur connecté
export async function POST(req: NextRequest) {
  try {
    // Vérifie le cookie JWT et extrait le payload (sub = userId)
    const currentUser = await requireAuth();
    const body = await req.json();
    // createBeat valide le body avec Zod puis l'insère en base
    const beat = await createBeat(body, currentUser.sub);
    return ok(beat, 201); // 201 Created
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    if (e instanceof ZodError) return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    return err('Erreur serveur', 500);
  }
}
