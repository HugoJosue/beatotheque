// frontend/components/LicenseCard.tsx
// Carte affichant une licence et ses boutons d'action (modifier / supprimer).
// Les callbacks onDelete et onEdit sont optionnels :
//   - Sans callbacks → affichage lecture seule (catalogue public)
//   - Avec callbacks  → affichage interactif (dashboard producteur)
// React.memo évite un re-rendu si la licence et les références de callbacks
// n'ont pas changé entre deux rendus du parent.

import { memo } from 'react';

interface License {
  id: string;
  name: string;
  price: number;
  rightsText: string;
}

interface Props {
  license: License;
  onDelete?: (id: string) => void; // Appelé avec l'id si l'utilisateur supprime
  onEdit?: (license: License) => void; // Appelé avec l'objet complet pour pré-remplir le formulaire
}

// Composant pur : même props → même rendu → mémoïsation rentable
export const LicenseCard = memo(function LicenseCard({ license, onDelete, onEdit }: Props) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        {/* Nom de la licence + prix */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold">{license.name}</h3>
          {/* Number() convertit le Decimal Prisma en number pour l'affichage */}
          <span className="text-violet-400 font-bold">{Number(license.price).toFixed(2)} $</span>
        </div>
        {/* Texte légal décrivant les droits accordés (non-exclusif, exclusif, etc.) */}
        <p className="text-sm text-gray-400 leading-relaxed">{license.rightsText}</p>
      </div>

      {/* Boutons d'action — affichés uniquement si des handlers sont fournis */}
      {(onDelete || onEdit) && (
        <div className="flex gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(license)}
              className="text-xs px-3 py-1.5 rounded bg-violet-900/30 text-violet-300 hover:bg-violet-900/50 transition"
            >
              Modifier
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(license.id)}
              className="text-xs px-3 py-1.5 rounded bg-red-900/30 text-red-400 hover:bg-red-900/50 transition"
            >
              Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
});
