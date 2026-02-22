// src/app/api/beats/[id]/route.ts
// Endpoints pour un beat spécifique (lecture, modification, suppression).

import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getBeatById, updateBeat, deleteBeat } from '@/backend/controllers/beat.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err, validationError } from '@/backend/lib/api-response';

// Cache ISR : Next.js garde la réponse GET en cache pendant 60 secondes.
// Après expiration, la prochaine requête revalide les données depuis la base.
// Les méthodes PUT et DELETE ne sont jamais mises en cache (comportement par défaut).
export const revalidate = 60;

// GET /api/beats/:id — public
// Retourne les détails d'un beat incluant ses licences
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const beat = await getBeatById(params.id);
    return ok(beat);
  } catch (e) {
    // Propage le statusCode personnalisé (404 si introuvable, 500 sinon)
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}

// PUT /api/beats/:id — protégé + vérification ownership
// Seul le propriétaire du beat peut le modifier (vérifié dans le controller)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    const body = await req.json();
    // updateBeat vérifie que beat.userId === currentUser.sub avant de modifier
    const beat = await updateBeat(params.id, body, currentUser.sub);
    return ok(beat);
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    if (e instanceof ZodError) return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}

// DELETE /api/beats/:id — protégé + vérification ownership
// Supprime le beat et ses licences en cascade (défini dans le schéma Prisma : onDelete: Cascade)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    // deleteBeat vérifie que beat.userId === currentUser.sub avant de supprimer
    await deleteBeat(params.id, currentUser.sub);
    return ok({ message: 'Beat supprimé' });
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}
