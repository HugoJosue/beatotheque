
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getBeatById, updateBeat, deleteBeat } from '@/backend/controllers/beat.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err, validationError } from '@/backend/lib/api-response';

// GET /api/beats/:id — public
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const beat = await getBeatById(params.id);
    return ok(beat);
  } catch (e) {
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}

// PUT /api/beats/:id — protégé + owner
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    const body = await req.json();
    const beat = await updateBeat(params.id, body, currentUser.sub);
    return ok(beat);
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    if (e instanceof ZodError) return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}

// DELETE /api/beats/:id — protégé + owner
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    await deleteBeat(params.id, currentUser.sub);
    return ok({ message: 'Beat supprimé' });
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}