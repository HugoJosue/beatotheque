// src/app/beats/[id]/page.tsx
// Détail d'un beat : infos complètes + liste des licences disponibles
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface License {
  id: string;
  name: string;
  price: number;
  rightsText: string;
}

interface Beat {
  id: string;
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;
  previewUrl: string;
  createdAt: string;
  userId: string;
  user: { id: string; email: string };
  licenses: License[];
}

export default function BeatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/beats/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error);
        setBeat(json.data);
      })
      .catch(() => setError('Beat introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="card animate-pulse h-64" />;
  if (error || !beat) return <div className="card text-red-400">{error || 'Beat introuvable.'}</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Navigation */}
      <Link href="/beats" className="text-violet-400 hover:underline text-sm">
        ← Retour au catalogue
      </Link>

      {/* Infos principales */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{beat.title}</h1>
            <p className="text-gray-400 text-sm mt-1">par {beat.user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-violet-400">{Number(beat.price).toFixed(2)} $</p>
            <p className="text-gray-500 text-xs">à partir de</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="badge bg-violet-900 text-violet-200">{beat.style}</span>
          <span className="badge bg-[#2A2A2A] text-gray-300">{beat.bpm} BPM</span>
          <span className="badge bg-[#2A2A2A] text-gray-300">🎵 {beat.key}</span>
        </div>

        {/* Lecteur audio */}
        <div className="space-y-1">
          <p className="text-sm text-gray-400">Prévisualisation</p>
          <audio
            controls
            src={beat.previewUrl}
            className="w-full rounded-lg"
            style={{ filter: 'invert(1) hue-rotate(180deg)' }} // Style sombre
          />
        </div>

        <p className="text-gray-500 text-xs">
          Ajouté le {new Date(beat.createdAt).toLocaleDateString('fr-CA')}
        </p>
      </div>

      {/* Licences disponibles */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">📄 Licences disponibles</h2>

        {beat.licenses.length === 0 ? (
          <div className="card text-gray-500 text-center py-8">Aucune licence configurée.</div>
        ) : (
          <div className="grid gap-4">
            {beat.licenses.map((lic) => (
              <div key={lic.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-white">{lic.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 leading-relaxed">{lic.rightsText}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-violet-400">{Number(lic.price).toFixed(2)} $</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
