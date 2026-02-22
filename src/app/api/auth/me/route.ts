// src/app/api/auth/me/route.ts
// Retourne les informations de l'utilisateur actuellement connecté.
// Utilisé par la Navbar pour afficher le bon état (connecté / déconnecté)
// et vérifier la session sans re-décoder le JWT côté client.

import { getMe } from '@/backend/controllers/auth.controller';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err } from '@/backend/lib/api-response';

export async function GET() {
  try {
    // requireAuth lit le cookie JWT, le vérifie et retourne le payload décodé
    const currentUser = await requireAuth();
    // getMe requête la base pour récupérer les données à jour (sans passwordHash)
    const user = await getMe(currentUser.sub);
    return ok(user);
  } catch (e) {
    // AuthError → cookie absent ou JWT expiré/invalide → 401
    if (e instanceof AuthError) return err(e.message, 401);
    return err('Erreur serveur', 500);
  }
}
