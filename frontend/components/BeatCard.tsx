// src/components/BeatCard.tsx
// Carte beat pour la liste du catalogue

interface Beat {
  id: string;
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;
  createdAt: string;
  user: { email: string };
}

interface Props { beat: Beat; }

export function BeatCard({ beat }: Props) {
  // Initiale de l'auteur pour l'avatar
  const initial = beat.user.email[0].toUpperCase();

  return (
    <div className="group relative rounded-2xl border border-[#1E1E1E] bg-[#0e0e0e] overflow-hidden
                    hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/20
                    transition-all duration-300 cursor-pointer">

      {/* Barre d'accent supérieure */}
      <div className="h-0.5 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 space-y-4">
        {/* Header : style + prix */}
        <div className="flex items-start justify-between gap-2">
          <span className="badge bg-violet-500/15 text-violet-300 border border-violet-500/20">
            {beat.style}
          </span>
          <span className="text-lg font-bold gradient-text shrink-0">
            {Number(beat.price).toFixed(2)} $
          </span>
        </div>

        {/* Titre */}
        <div>
          <h3 className="font-bold text-white text-lg leading-tight group-hover:text-violet-100 transition-colors">
            {beat.title}
          </h3>
        </div>

        {/* Waveform décorative */}
        <div className="flex items-end gap-0.5 h-8 opacity-30 group-hover:opacity-60 transition-opacity">
          {[3,5,7,4,8,6,9,5,7,4,6,8,5,7,3,6,8,4,7,5].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-gradient-to-t from-violet-600 to-purple-400"
              style={{ height: `${h * 10}%` }}
            />
          ))}
        </div>

        {/* Footer : auteur + specs */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-700
                            flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {initial}
            </div>
            <span className="text-gray-500 text-xs truncate max-w-[100px]">{beat.user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">{beat.bpm} BPM</span>
            <span className="text-gray-700">·</span>
            <span>{beat.key}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
