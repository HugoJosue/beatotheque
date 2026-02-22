// src/app/api/beats/[id]/licenses/route.ts
// Endpoints pour les licences d'un beat spécifique.

import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getLicensesByBeat, createLicense } from '@/backend/controllers/license.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err, validationError } from '@/backend/lib/api-response';

// Cache ISR : la liste des licences d'un beat est mise en cache 60 secondes.
// Cela réduit les requêtes à la base pour les pages de catalogue à fort trafic.
export const revalidate = 60;

// GET /api/beats/:id/licenses — public
// Retourne toutes les licences du beat triées par prix croissant
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const licenses = await getLicensesByBeat(params.id);
    return ok(licenses);
  } catch (e) {
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}

// POST /api/beats/:id/licenses — protégé + vérification ownership
// Seul le propriétaire du beat peut créer des licences pour ce beat
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    const body = await req.json();
    // createLicense vérifie que beat.userId === currentUser.sub avant d'insérer
    const license = await createLicense(params.id, body, currentUser.sub);
    return ok(license, 201); // 201 Created
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    if (e instanceof ZodError) return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}
