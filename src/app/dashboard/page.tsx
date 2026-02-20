// src/app/dashboard/page.tsx
// Dashboard de l'utilisateur connecté — liste ses beats avec actions CRUD
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Beat {
  id: string;
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Charge le profil et les beats de l'utilisateur
  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.push('/login'); return; }
      const meJson = await meRes.json();
      setUser(meJson.data);

      const beatsRes = await fetch('/api/beats?limit=50');
      const beatsJson = await beatsRes.json();

      if (beatsJson.success) {
        // Filtre côté client pour n'afficher que les beats de l'utilisateur
        // (en production on ajouterait un filtre ?userId= côté API)
        const myBeats = beatsJson.data.beats.filter(
          (b: Beat & { userId: string }) => b.userId === meJson.data.id
        );
        setBeats(myBeats);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce beat et toutes ses licences ?')) return;
    setDeleting(id);

    const res = await fetch(`/api/beats/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (json.success) {
      setBeats((prev) => prev.filter((b) => b.id !== id));
      setSuccessMsg('Beat supprimé.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setDeleting(null);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  if (loading) return <div className="card animate-pulse h-32" />;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mon Espace</h1>
          <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/beats/new" className="btn-primary">
            + Nouveau beat
          </Link>
          <button onClick={handleLogout} className="btn-secondary">
            Déconnexion
          </button>
        </div>
      </div>

      {/* Message de succès */}
      {successMsg && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg px-4 py-2 text-sm">
          ✓ {successMsg}
        </div>
      )}

      {/* Liste des beats */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Mes beats ({beats.length})</h2>

        {beats.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🎹</p>
            <p>Aucun beat pour l&apos;instant.</p>
            <Link href="/dashboard/beats/new" className="btn-primary inline-block mt-4">
              Créer mon premier beat
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#2A2A2A]">
                  <th className="text-left py-3 pr-4">Titre</th>
                  <th className="text-left py-3 pr-4">Style</th>
                  <th className="text-left py-3 pr-4">BPM</th>
                  <th className="text-left py-3 pr-4">Tonalité</th>
                  <th className="text-left py-3 pr-4">Prix</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {beats.map((beat) => (
                  <tr key={beat.id} className="border-b border-[#1E1E1E] hover:bg-[#1A1A1A] transition">
                    <td className="py-3 pr-4 font-medium">{beat.title}</td>
                    <td className="py-3 pr-4">
                      <span className="badge bg-violet-900/50 text-violet-300">{beat.style}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{beat.bpm}</td>
                    <td className="py-3 pr-4 text-gray-400">{beat.key}</td>
                    <td className="py-3 pr-4 text-violet-400">{Number(beat.price).toFixed(2)} $</td>
                    <td className="py-3">
                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={`/beats/${beat.id}`}
                          className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-[#2A2A2A] hover:bg-[#333] transition"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/dashboard/beats/${beat.id}/edit`}
                          className="text-violet-400 hover:text-violet-300 text-xs px-2 py-1 rounded bg-violet-900/30 hover:bg-violet-900/50 transition"
                        >
                          Modifier
                        </Link>
                        <Link
                          href={`/dashboard/beats/${beat.id}/licenses`}
                          className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded bg-blue-900/30 hover:bg-blue-900/50 transition"
                        >
                          Licences
                        </Link>
                        <button
                          onClick={() => handleDelete(beat.id)}
                          disabled={deleting === beat.id}
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded bg-red-900/30 hover:bg-red-900/50 transition disabled:opacity-50"
                        >
                          {deleting === beat.id ? '…' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
