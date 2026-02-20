
import { prisma } from '@/backend/prisma/client';
import { licenseSchema } from '@/backend/lib/validations';

export async function getLicensesByBeat(beatId: string) {
  // Vérifie que le beat existe
  const beat = await prisma.beat.findUnique({ where: { id: beatId }, select: { id: true } });
  if (!beat) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });

  return prisma.license.findMany({
    where: { beatId },
    orderBy: { price: 'asc' }, // Du moins cher au plus cher
  });
}

export async function createLicense(beatId: string, body: unknown, userId: string) {
  // Seul le propriétaire du beat peut créer des licences
  const beat = await prisma.beat.findUnique({ where: { id: beatId }, select: { userId: true } });
  if (!beat) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });
  if (beat.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  const data = licenseSchema.parse(body);

  return prisma.license.create({ data: { ...data, beatId } });
}

export async function updateLicense(id: string, body: unknown, userId: string) {
  // Remonte jusqu'au beat pour vérifier le propriétaire
  const license = await prisma.license.findUnique({
    where: { id },
    include: { beat: { select: { userId: true } } },
  });

  if (!license) throw Object.assign(new Error('Licence introuvable'), { statusCode: 404 });
  if (license.beat.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  const data = licenseSchema.parse(body);

  return prisma.license.update({ where: { id }, data });
}

export async function deleteLicense(id: string, userId: string) {
  const license = await prisma.license.findUnique({
    where: { id },
    include: { beat: { select: { userId: true } } },
  });

  if (!license) throw Object.assign(new Error('Licence introuvable'), { statusCode: 404 });
  if (license.beat.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  await prisma.license.delete({ where: { id } });
}