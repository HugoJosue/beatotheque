
import type { UserPublic } from './user.model';

export interface BeatBase {
  id: string;
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;   // Decimal converti en number pour les réponses JSON
  previewUrl: string;
  createdAt: Date;
  userId: string;
}

export interface BeatWithAuthor extends BeatBase {
  user: Pick<UserPublic, 'id' | 'email'>;
}

export interface BeatInput {
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;
  previewUrl: string;
}

export interface BeatQueryParams {
  style?: string;
  page?: number;
  limit?: number;
}