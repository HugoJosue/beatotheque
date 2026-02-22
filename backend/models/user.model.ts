// backend/models/user.model.ts
// Interfaces TypeScript représentant les données utilisateur.
// Ces types sont utilisés dans les controllers et les réponses API.

// Données publiques d'un utilisateur — passwordHash intentionnellement absent
export interface UserPublic {
  id: string;
  email: string;
  createdAt: Date;
}

// Payload contenu dans le JWT signé
// sub (Subject) = userId, utilisé pour identifier l'utilisateur dans chaque requête
// iat (Issued At) et exp (Expiration) sont optionnels car ajoutés automatiquement par jose
export interface JwtPayload {
  sub: string;    // ID de l'utilisateur (UUID)
  email: string;  // Email — pour affichage côté client sans requête DB supplémentaire
  iat?: number;   // Timestamp de création du token (UNIX)
  exp?: number;   // Timestamp d'expiration du token (UNIX)
}
