
import { prisma } from '@/backend/prisma/client';
import { beatSchema } from '@/backend/lib/validations';
import type { BeatQueryParams } from '@/backend/models/beat.model';

const beatSelect = {
  id: true,
  title: true,
  bpm: true,
  style: true,
  key: true,
  price: true,
  previewUrl: true,
  createdAt: true,
  userId: true,
  user: { select: { id: true, email: true } },
};

export async function getBeats(params: BeatQueryParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 12));
  const skip = (page - 1) * limit;

  const where = params.style ? { style: { contains: params.style, mode: 'insensitive' as const } } : {};

  const [beats, total] = await Promise.all([
    prisma.beat.findMany({
      where,
      select: beatSelect,
      skip,
      take: limit,
    }),
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

export async function getBeatById(id: string) {
  const beat = await prisma.beat.findUnique({
    where: { id },
    select: { ...beatSelect, licenses: true },
  });

  if (!beat) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });
  return beat;
}

export async function createBeat(body: unknown, userId: string) {
  const data = beatSchema.parse(body);

  return prisma.beat.create({
    data: { ...data, userId },
    select: beatSelect,
  });
}

export async function updateBeat(id: string, body: unknown, userId: string) {
  const existing = await prisma.beat.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });
  if (existing.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  const data = beatSchema.parse(body);

  return prisma.beat.update({
    where: { id },
    data,
    select: beatSelect,
  });
}

export async function deleteBeat(id: string, userId: string) {
  const existing = await prisma.beat.findUnique({ where: { id }, select: { userId: true } });
  if (!existing) throw Object.assign(new Error('Beat introuvable'), { statusCode: 404 });
  if (existing.userId !== userId) throw Object.assign(new Error('Accès refusé'), { statusCode: 403 });

  await prisma.beat.delete({ where: { id } });
}