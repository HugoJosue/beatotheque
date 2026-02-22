// backend/controllers/license.controller.ts
// Logique métier des licences : lecture, création, modification, suppression.
// L'ownership est vérifié en remontant de la licence vers son beat parent.

import { prisma } from '@/backend/prisma/client';
import { licenseSchema } from '@/backend/lib/validations';

// Liste des licences d'un beat, triées par prix croissant
export async function getLicensesByBeat(beatId: string) {
  // Vérifie que le beat existe avant de retourner ses licences
  const beat = await prisma.beat.findUnique({ where: { id: beatId }, select: { id: true } });
  if (!beat) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });

  return prisma.license.findMany({
    where: { beatId },
    orderBy: { price: 'asc' }, // Du moins cher au plus cher pour faciliter la lecture
  });
}

// Création d'une licence — seul le propriétaire du beat peut en créer
export async function createLicense(beatId: string, body: unknown, userId: string) {
  // Remonte au beat pour vérifier l'ownership
  const beat = await prisma.beat.findUnique({ where: { id: beatId }, select: { userId: true } });
  if (!beat) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });
  if (beat.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  // licenseSchema.parse valide name, price et rightsText (lance ZodError si invalide)
  const data = licenseSchema.parse(body);

  return prisma.license.create({ data: { ...data, beatId } });
}

// Modification d'une licence — remonte vers le beat pour vérifier l'ownership
export async function updateLicense(id: string, body: unknown, userId: string) {
  // include { beat } récupère userId du beat parent en une seule requête (évite un aller-retour supplémentaire)
  const license = await prisma.license.findUnique({
    where: { id },
    include: { beat: { select: { userId: true } } },
  });

  if (!license) throw Object.assign(new Error('Licence introuvable'), { statusCode: 404 });
  // Vérifie que l'utilisateur est propriétaire du beat auquel appartient la licence
  if (license.beat.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  const data = licenseSchema.parse(body);

  return prisma.license.update({ where: { id }, data });
}

// Suppression d'une licence — même vérification d'ownership que la modification
export async function deleteLicense(id: string, userId: string) {
  const license = await prisma.license.findUnique({
    where: { id },
    include: { beat: { select: { userId: true } } },
  });

  if (!license) throw Object.assign(new Error('Licence introuvable'), { statusCode: 404 });
  if (license.beat.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  await prisma.license.delete({ where: { id } });
}
