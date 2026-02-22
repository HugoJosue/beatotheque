// backend/lib/validations.ts
// Schémas Zod pour la validation des données entrantes (API + formulaires).
// Zod garantit que le typage TypeScript reflète exactement ce qui est validé :
// si parse() réussit, les données sont sûres à utiliser sans cast supplémentaire.

import { z } from 'zod';

// Schéma d'inscription — email valide + mot de passe d'au moins 8 caractères
export const registerSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100),
});

// Schéma de connexion — pas de contrainte de longueur sur le mot de passe
// (l'utilisateur saisit son mot de passe existant, pas un nouveau)
export const loginSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// Schéma de création/modification d'un beat
export const beatSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(200),
  bpm: z
    .number({ invalid_type_error: 'BPM doit être un nombre' })
    .int('BPM doit être un entier')
    .min(40,  'BPM minimum : 40')
    .max(300, 'BPM maximum : 300'),
  style: z.string().min(1, 'Style requis').max(100),
  key:   z.string().min(1, 'Tonalité requise').max(50),
  price: z
    .number({ invalid_type_error: 'Prix doit être un nombre' })
    .min(0,       'Le prix ne peut pas être négatif')
    .max(9999.99),
  previewUrl: z
    .string()
    .min(1, 'URL de prévisualisation requise')
    // Accepte les chemins relatifs (/uploads/...) ou les URLs complètes (https://...)
    .refine(
      (val) => val.startsWith('/') || z.string().url().safeParse(val).success,
      'URL de prévisualisation invalide (URL complète ou chemin /uploads/…)'
    ),
});

// Type TypeScript inféré du schéma — évite de dupliquer la définition des champs
export type BeatFormData = z.infer<typeof beatSchema>;

// Schéma de création/modification d'une licence
export const licenseSchema = z.object({
  name:       z.string().min(1, 'Nom requis').max(200),
  price:      z.number({ invalid_type_error: 'Prix doit être un nombre' }).min(0, 'Le prix ne peut pas être négatif'),
  rightsText: z.string().min(10, 'Description des droits requise (min. 10 caractères)'),
});

// Type TypeScript inféré du schéma de licence
export type LicenseFormData = z.infer<typeof licenseSchema>;
