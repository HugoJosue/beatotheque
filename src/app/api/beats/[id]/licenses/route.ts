
import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { getLicensesByBeat, createLicense } from '@/backend/controllers/license.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err, validationError } from '@/backend/lib/api-response';

// GET /api/beats/:id/licenses — public
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

// POST /api/beats/:id/licenses — protégé + owner
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth();
    const body = await req.json();
    const license = await createLicense(params.id, body, currentUser.sub);
    return ok(license, 201);
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    if (e instanceof ZodError) return validationError(e.flatten().fieldErrors as Record<string, string[]>);
    const error = e as Error & { statusCode?: number };
    return err(error.message, error.statusCode ?? 500);
  }
}