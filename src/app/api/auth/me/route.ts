
import { getMe } from '@/backend/controllers/auth.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err } from '@/backend/lib/api-response';

export async function GET() {
  try {
    const currentUser = await requireAuth();
    const user = await getMe(currentUser.sub);
    return ok(user);
  } catch (e) {
    if (e instanceof AuthError) return err(e.message, 401);
    return err('Erreur serveur', 500);
  }
}