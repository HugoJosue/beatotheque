
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { updateLicense, deleteLicense } from '@/backend/controllers/license.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err, validationError } from '@/backend/lib/api-response';

// PUT /api/licenses/:id — protégé + owner du beat parent
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    const body = await req.json();
    const license = await updateLicense(params.id, body, currentUser.sub);
    return ok(license);
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    if (e instanceof ZodError) return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}

// DELETE /api/licenses/:id — protégé + owner
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    await deleteLicense(params.id, currentUser.sub);
    return ok({ message: 'Licence supprimée' });
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}