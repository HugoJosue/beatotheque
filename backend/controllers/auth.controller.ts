// backend/controllers/auth.controller.ts
// Logique métier d'authentification : inscription, connexion, profil.
// Ce controller ne retourne jamais le passwordHash dans ses réponses.

import bcrypt from 'bcryptjs';
import { prisma } from '@/backend/prisma/client';
import { signToken } from '@/backend/lib/jwt';
import { registerSchema, loginSchema } from '@/backend/lib/validations';
import type { UserPublic } from '@/backend/models/user.model';

// Inscription : crée un compte, hash le mot de passe et génère un JWT
export async function registerUser(body: unknown): Promise<{
  user: UserPublic;
  token: string;
}> {
  // Validation Zod — lance une ZodError si les données sont invalides
  const data = registerSchema.parse(body);

  // Vérification de l'unicité de l'email (contrainte aussi en base via @unique)
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw Object.assign(new Error('Cet email est déjà utilisé'), { statusCode: 409 });
  }

  // Hachage bcrypt avec un coût de 12 (~250ms) — rend la force brute coûteuse
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Création en base — select exclut passwordHash de la réponse
  const user = await prisma.user.create({
    data: { email: data.email, passwordHash },
    select: { id: true, email: true, createdAt: true },
  });

  // Génération du JWT signé (sub = userId, pour identifier l'utilisateur dans les requêtes suivantes)
  const token = await signToken({ sub: user.id, email: user.email });

  return { user, token };
}

// Connexion : vérifie les identifiants et génère un JWT
export async function loginUser(body: unknown): Promise<{
  user: UserPublic;
  token: string;
}> {
  const data = loginSchema.parse(body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });

  // Message générique intentionnel : ne révèle pas si l'email existe (anti-énumération)
  const INVALID_MSG = 'Email ou mot de passe incorrect';

  if (!user) throw Object.assign(new Error(INVALID_MSG), { statusCode: 401 });

  // bcrypt.compare compare le mot de passe en clair avec le hash stocké
  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw Object.assign(new Error(INVALID_MSG), { statusCode: 401 });

  const token = await signToken({ sub: user.id, email: user.email });

  return {
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    token,
  };
}

// Profil : retourne les données publiques de l'utilisateur connecté
export async function getMe(userId: string): Promise<UserPublic> {
  // findUniqueOrThrow lance une exception si l'utilisateur n'existe pas (compte supprimé)
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true }, // passwordHash exclu
  });
  return user;
}
