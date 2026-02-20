
interface License {
  id: string;
  name: string;
  price: number;
  rightsText: string;
}

interface Props {
  license: License;
  onDelete?: (id: string) => void;
  onEdit?: (license: License) => void;
}

export function LicenseCard({ license, onDelete, onEdit }: Props) {
  return (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold">{license.name}</h3>
          <span className="text-violet-400 font-bold">{Number(license.price).toFixed(2)} $</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{license.rightsText}</p>
      </div>

      {/* Actions owner */}
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
}