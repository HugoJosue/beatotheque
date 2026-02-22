// backend/lib/api-response.ts
// Helpers pour construire des réponses JSON uniformes dans toutes les routes API.
// Format commun : { success: boolean, data?: T, error?: string, details?: ... }

import { NextResponse } from 'next/server';

// Réponse de succès — status 200 par défaut, ou 201 pour une création
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// Réponse d'erreur — status 400 par défaut (Bad Request)
// Exemples d'usage : 401 (non authentifié), 403 (accès refusé), 404 (introuvable), 500 (serveur)
export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Réponse d'erreur de validation Zod — status 422 Unprocessable Entity
// details contient les erreurs par champ : { email: ["Email invalide"], bpm: ["BPM requis"] }
export function validationError(errors: Record<string, string[]>) {
  return NextResponse.json(
    { success: false, error: 'Données invalides', details: errors },
    { status: 422 }
  );
}
