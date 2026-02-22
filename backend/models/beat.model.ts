// backend/models/beat.model.ts
// Interfaces TypeScript représentant les beats et leurs paramètres de requête.
// Correspondent au modèle Prisma Beat, avec price converti de Decimal en number.

import type { UserPublic } from './user.model';

// Données de base d'un beat (sans relation)
export interface BeatBase {
  id: string;
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;       // Decimal Prisma converti en number pour la sérialisation JSON
  previewUrl: string;  // URL Vercel Blob ou lien externe vers le fichier audio
  createdAt: Date;
  userId: string;      // Clé étrangère vers l'auteur
}

// Beat avec les informations de l'auteur (jointure user)
export interface BeatWithAuthor extends BeatBase {
  user: Pick<UserPublic, 'id' | 'email'>; // Seulement les champs publics de l'auteur
}

// Données d'entrée pour créer ou modifier un beat (sans id ni userId ni createdAt)
export interface BeatInput {
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;
  previewUrl: string;
}

// Paramètres de filtrage et pagination pour la route GET /api/beats
export interface BeatQueryParams {
  style?: string;  // Filtre optionnel par genre musical
  page?: number;   // Page courante (défaut: 1)
  limit?: number;  // Nombre d'éléments par page (défaut: 12, max: 50)
}
