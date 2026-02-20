// Upload de fichiers audio (MP3, WAV) — sauvegarde dans Vercel Blob

import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { requireAuth, AuthError } from '@/backend/lib/auth';
import { ok, err } from '@/backend/lib/api-response';

const MAX_SIZE = 50 * 1024 * 1024; // 50 Mo
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav'];

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return err('Aucun fichier fourni.', 400);
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
      return err('Format non supporté. Utilisez MP3 ou WAV.', 400);
    }
    if (file.size > MAX_SIZE) return err('Fichier trop volumineux (max 50 Mo).', 400);

    const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_');
    const filename = `beats/${Date.now()}-${safeName}`;

    const blob = await put(filename, file, { access: 'public' });

    return ok({ url: blob.url }, 201);
  } catch (e) {
    if (e instanceof AuthError) return err('Non authentifié.', 401);
    console.error('Upload error:', e);
    return err("Erreur lors de l'upload.", 500);
  }
}
