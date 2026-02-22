// backend/controllers/beat.controller.ts
// Logique métier du catalogue de beats : liste paginée, détail, CRUD protégé.
// Toutes les mutations vérifient l'ownership (beat.userId === userId du JWT).

import { prisma } from '@/backend/prisma/client';
import { beatSchema } from '@/backend/lib/validations';
import type { BeatQueryParams } from '@/backend/models/beat.model';

// Champs sélectionnés pour toutes les requêtes — exclut les données sensibles
const beatSelect = {
  id: true,
  title: true,
  bpm: true,
  style: true,
  key: true,
  price: true,       // Decimal Prisma — converti en Number côté client
  previewUrl: true,
  createdAt: true,
  userId: true,
  user: { select: { id: true, email: true } }, // Auteur (sans passwordHash)
};

// Liste paginée des beats avec filtre optionnel par style
export async function getBeats(params: BeatQueryParams) {
  // Borne les valeurs pour éviter les abus (page négative, limit=10000)
  const page  = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 12));
  const skip  = (page - 1) * limit; // Offset pour la pagination

  // Filtre insensible à la casse si un style est fourni
  const where = params.style ? { style: { contains: params.style, mode: 'insensitive' as const } } : {};

  // Requêtes parallèles : données + total (pour calculer totalPages)
  const [beats, total] = await Promise.all([
    prisma.beat.findMany({ where, select: beatSelect, skip, take: limit }),
    prisma.beat.count({ where }),
  ]);

  return {
    beats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Détail d'un beat avec ses licences (inclus dans la réponse)
export async function getBeatById(id: string) {
  const beat = await prisma.beat.findUnique({
    where: { id },
    select: { ...beatSelect, licenses: true }, // Étend beatSelect avec les licences
  });

  if (!beat) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });
  return beat;
}

// Création d'un beat — userId vient du JWT (côté serveur, pas du body)
export async function createBeat(body: unknown, userId: string) {
  // beatSchema.parse valide et transforme le body (lance ZodError si invalide)
  const data = beatSchema.parse(body);

  return prisma.beat.create({
    data: { ...data, userId }, // userId injecté depuis le JWT, non modifiable par le client
    select: beatSelect,
  });
}

// Modification d'un beat — vérifie l'ownership avant toute écriture
export async function updateBeat(id: string, body: unknown, userId: string) {
  // Charge uniquement userId pour la vérification d'ownership (requête légère)
  const existing = await prisma.beat.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });
  // 403 Forbidden si l'utilisateur n'est pas le propriétaire
  if (existing.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  const data = beatSchema.parse(body);

  return prisma.beat.update({ where: { id }, data, select: beatSelect });
}

// Suppression d'un beat (et ses licences en cascade via Prisma schema onDelete: Cascade)
export async function deleteBeat(id: string, userId: string) {
  const existing = await prisma.beat.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });
  if (existing.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  await prisma.beat.delete({ where: { id } });
}
