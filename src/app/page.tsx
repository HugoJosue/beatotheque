// src/app/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((json) => setLoggedIn(!!json?.data));
  }, []);

  return (
    <div className="flex flex-col items-center">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full flex flex-col items-center justify-center text-center py-28 px-4 overflow-hidden">
        {/* Blobs de fond animés */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/10 blur-3xl" />
          <div className="blob absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-purple-700/10 blur-3xl" style={{ animationDelay: '-4s' }} />
        </div>

        {/* Titre */}
        <div className="relative space-y-5 max-w-3xl">
          <span className="inline-block text-xs font-semibold tracking-widest text-violet-400 uppercase border border-violet-500/30 bg-violet-500/10 rounded-full px-4 py-1.5 mb-2">
            Bibliothèque de beats musicaux
          </span>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-none">
            Beato
            <span className="gradient-text">thèque</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
            La plateforme pour producteurs et artistes. Explorez, gérez et
            licenciez vos productions musicales.
          </p>
        </div>

        {/* CTA */}
        <div className="relative flex flex-wrap gap-4 justify-center mt-10">
          <Link href="/beats" className="btn-primary text-base px-8 py-3 rounded-2xl shadow-2xl shadow-violet-900/40">
            Explorer les beats
          </Link>
          {!loggedIn && (
            <Link href="/register" className="btn-secondary text-base px-8 py-3 rounded-2xl">
              Créer un compte
            </Link>
          )}
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────────── */}
      <section className="w-full max-w-5xl px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: '🎛️',
              title: 'Catalogue complet',
              desc: 'BPM, tonalité, style — chaque beat est parfaitement indexé pour une recherche rapide.',
              color: 'from-violet-600/20 to-violet-600/5',
              border: 'border-violet-500/20',
            },
            {
              icon: '🔐',
              title: 'Ownership clair',
              desc: 'Gérez uniquement vos propres beats. La propriété est vérifiée à chaque action.',
              color: 'from-purple-600/20 to-purple-600/5',
              border: 'border-purple-500/20',
            },
            {
              icon: '📄',
              title: 'Licences flexibles',
              desc: 'Lease, exclusif, custom — définissez les droits qui correspondent à votre vision.',
              color: 'from-fuchsia-600/20 to-fuchsia-600/5',
              border: 'border-fuchsia-500/20',
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`relative rounded-2xl border ${f.border} p-6 bg-gradient-to-b ${f.color} backdrop-blur-sm space-y-3 overflow-hidden`}
            >
              <div className="text-4xl">{f.icon}</div>
              <h3 className="font-bold text-white text-lg">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
