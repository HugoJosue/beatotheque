'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BeatForm } from '@/frontend/components/BeatForm';

export default function NewBeatPage() {
  const router = useRouter();

  async function handleSubmit(data: Record<string, unknown>) {
    const res = await fetch('/api/beats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? 'Erreur lors de la création');

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-violet-400 hover:underline text-sm">
          ← Retour au dashboard
        </Link>
      </div>
      <h1 className="text-3xl font-bold">Nouveau beat</h1>
      <BeatForm onSubmit={handleSubmit} submitLabel="Publier le beat" />
    </div>
  );
}