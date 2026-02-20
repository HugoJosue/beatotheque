
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getBeats, createBeat } from '@/backend/controllers/beat.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err, validationError } from '@/backend/lib/api-response';

// GET /api/beats — public, supporte ?style= &page= &limit=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const result = await getBeats({
      style: searchParams.get('style') ?? undefined,
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : 12,
    });

    return ok(result);
  } catch {
    return err('Erreur serveur', 500);
  }
}

// POST /api/beats — protégé (JWT requis)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await req.json();
    const beat = await createBeat(body, currentUser.sub);
    return ok(beat, 201);
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    if (e instanceof ZodError) return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    return err('Erreur serveur', 500);
  }
}