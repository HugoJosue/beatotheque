// src/app/api/upload/route.ts
// Upload côté client via Vercel Blob — contourne la limite 4.5 MB des fonctions serverless.
//
// Flux en deux phases :
//   1. Navigateur → /api/upload : demande un token client
//      onBeforeGenerateToken : vérifie l'auth + définit les contraintes (types, taille max)
//   2. Navigateur → Vercel Blob : upload direct avec le token (sans passer par le serveur)
//      Vercel Blob → /api/upload : callback de confirmation (onUploadCompleted)

import { handleUpload } from '@vercel/blob/client';
import { requireAuth } from '@/backend/lib/auth';

const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav'];

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      // Phase 1 : vérification auth + contraintes avant de générer le token client
      onBeforeGenerateToken: async (_pathname: string) => {
        // Vérifie que l'utilisateur est connecté (cookie JWT)
        // Lance une erreur si non authentifié → refus du token
        await requireAuth();

        return {
          allowedContentTypes: ALLOWED_TYPES,    // Types MIME autorisés
          maximumSizeInBytes: 50 * 1024 * 1024,  // 50 Mo max
          addRandomSuffix: true,                  // Garantit l'unicité du nom de fichier
        };
      },

      // Phase 2 : callback appelé par Vercel après upload réussi
      // Note : cette requête vient des serveurs Vercel, pas du navigateur (pas de cookie)
      onUploadCompleted: async ({ blob }: { blob: { url: string } }) => {
        console.log('Upload terminé :', blob.url);
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}
