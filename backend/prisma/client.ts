// backend/prisma/client.ts
// Singleton PrismaClient — partage une seule instance entre tous les modules.
//
// Pourquoi un singleton ?
// En développement, Next.js recharge les modules à chaque modification (hot-reload).
// Sans cette précaution, chaque rechargement crée une nouvelle instance PrismaClient
// et ouvre de nouvelles connexions à la base, épuisant rapidement le pool Neon (~10 connexions max).
//
// Solution : on stocke l'instance sur `globalThis` qui persiste entre les rechargements.
// En production (Vercel), chaque invocation de fonction serverless est isolée,
// donc le singleton n'est pas réutilisé entre les requêtes — c'est le comportement normal.

import { PrismaClient } from '@prisma/client';

// Cast de globalThis pour stocker notre instance sans conflit TypeScript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? // Réutilise l'instance existante si disponible
  new PrismaClient({
    // Log des requêtes SQL uniquement en développement (évite le bruit en production)
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  });

// En développement uniquement, attache l'instance au globalThis pour la réutiliser
// après un hot-reload. En production, on ne fait pas ça (chaque lambda est éphémère).
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
