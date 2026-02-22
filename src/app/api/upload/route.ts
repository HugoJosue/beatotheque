// src/app/api/upload/route.ts
// Upload de fichiers audio (MP3, WAV) vers Vercel Blob.
// Vercel Blob est un stockage objet persistant — contrairement au système de fichiers
// de Vercel qui est en lecture seule en production (les fichiers écrits via fs sont perdus).
// L'utilisateur doit être authentifié pour uploader (évite l'abus de stockage).

import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err } from '@/backend/lib/api-response';

const MAX_SIZE      = 50 * 1024 * 1024; // 50 Mo en octets
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav'];

export async function POST(req: NextRequest) {
  try {
    // Vérifie l'authentification — seul un utilisateur connecté peut uploader
    await requireAuth();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return err('Aucun fichier fourni.', 400);

    // Double vérification : MIME type ET extension (certains navigateurs envoient un MIME générique)
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
      return err('Format non supporté. Utilisez MP3 ou WAV.', 400);
    }

    // Limite de taille — vérifiée aussi côté client dans BeatForm pour une meilleure UX
    if (file.size > MAX_SIZE) return err('Fichier trop volumineux (max 50 Mo).', 400);

    // Sanitize le nom de fichier : remplace les caractères spéciaux par des underscores
    // pour éviter les problèmes de chemin et les injections dans l'URL Blob
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_');

    // Préfixe beats/ pour organiser les fichiers dans le bucket Blob
    // Date.now() garantit l'unicité même si deux fichiers ont le même nom
    const filename = `beats/${Date.now()}-${safeName}`;

    // Upload vers Vercel Blob — retourne une URL publique permanente (CDN)
    const blob = await put(filename, file, { access: 'public' });

    // Retourne l'URL publique que le formulaire stockera dans previewUrl du beat
    return ok({ url: blob.url }, 201);
  } catch (e) {
    if (e instanceof AuthError) return err('Non authentifié.', 401);
    console.error('Upload error:', e);
    return err("Erreur lors de l'upload.", 500);
  }
}
