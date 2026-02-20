// src/app/beats/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BeatCard } from '@/frontend/components/BeatCard';

interface Beat {
  id: string;
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;
  previewUrl: string;
  createdAt: string;
  user: { id: string; email: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STYLES = ['Tous', 'Trap', 'Lo-fi', 'Drill', 'Boom Bap', 'R&B', 'Afrobeats'];

export default function BeatsPage() {
  const [beats, setBeats]           = useState<Beat[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [style, setStyle]           = useState('');
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const fetchBeats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (style) params.set('style', style);
      const res  = await fetch(`/api/beats?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setBeats(json.data.beats);
      setPagination(json.data.pagination);
    } catch {
      setError('Impossible de charger les beats.');
    } finally {
      setLoading(false);
    }
  }, [page, style]);

  useEffect(() => { fetchBeats(); }, [fetchBeats]);

  const handleStyleChange = (s: string) => {
    setStyle(s === 'Tous' ? '' : s);
    setPage(1);
  };

  return (
    <div className="space-y-10 pb-16">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Catalogue</h1>
          {pagination && (
            <p className="text-gray-500 text-sm mt-1">
              {pagination.total} beat{pagination.total !== 1 ? 's' : ''} disponibles
            </p>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {STYLES.map((s) => {
          const active = (style === '' && s === 'Tous') || style === s;
          return (
            <button
              key={s}
              onClick={() => handleStyleChange(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                active
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/30'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton rounded-2xl h-52" />
          ))}
        </div>
      ) : error ? (
        <div className="card text-red-400 text-center py-10">{error}</div>
      ) : beats.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🎹</p>
          <p className="text-gray-400">Aucun beat trouvé pour ce style.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {beats.map((beat) => (
            <Link key={beat.id} href={`/beats/${beat.id}`}>
              <BeatCard beat={beat} />
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-30 !py-2 !px-5"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-500">
            Page <span className="text-white font-semibold">{pagination.page}</span> / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.totalPages}
            className="btn-secondary disabled:opacity-30 !py-2 !px-5"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
