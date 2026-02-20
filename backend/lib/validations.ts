// Schémas Zod pour la validation des données entrantes (API + formulaires)
// Zod garantit que le typage TypeScript reflète exactement ce qui est validé

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const beatSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  bpm: z
    .number({ invalid_type_error: 'BPM doit être un nombre' })
    .int('BPM doit être un entier')
    .min(40, 'BPM minimum : 40')
    .max(300, 'BPM maximum : 300'),
  style: z.string().min(1, 'Style requis').max(100),
  key: z.string().min(1, 'Tonalité requise').max(50),
  price: z
    .number({ invalid_type_error: 'Prix doit être un nombre' })
    .min(0, 'Le prix ne peut pas être négatif')
    .max(9999.99),
  previewUrl: z
    .string()
    .min(1, 'URL de prévisualisation requise')
    .refine(
      (val) => val.startsWith('/') || z.string().url().safeParse(val).success,
      'URL de prévisualisation invalide (URL complète ou chemin /uploads/…)'
    ),
});

export type BeatFormData = z.infer<typeof beatSchema>;

export const licenseSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  price: z
    .number({ invalid_type_error: 'Prix doit être un nombre' })
    .min(0, 'Le prix ne peut pas être négatif'),
  rightsText: z.string().min(10, 'Description des droits requise (min. 10 caractères)'),
});

export type LicenseFormData = z.infer<typeof licenseSchema>;