'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BeatForm } from '@/frontend/components/BeatForm';

interface Beat {
  id: string;
  title: string;
  bpm: number;
  style: string;
  key: string;
  price: number;
  previewUrl: string;
}

export default function EditBeatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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

  async function handleSubmit(data: Record<string, unknown>) {
    const res = await fetch(`/api/beats/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? 'Erreur lors de la modification');

    router.push('/dashboard');
    router.refresh();
  }

  if (loading) return <div className="card animate-pulse h-64" />;
  if (error || !beat) return <div className="card text-red-400">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-violet-400 hover:underline text-sm">
        ← Retour au dashboard
      </Link>
      <h1 className="text-3xl font-bold">Modifier : {beat.title}</h1>
      <BeatForm
        onSubmit={handleSubmit}
        submitLabel="Enregistrer les modifications"
        initialData={{
          title: beat.title,
          bpm: beat.bpm,
          style: beat.style,
          key: beat.key,
          price: beat.price,
          previewUrl: beat.previewUrl,
        }}
      />
    </div>
  );
}