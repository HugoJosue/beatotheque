// frontend/components/Navbar.tsx
// Barre de navigation persistante (sticky) affichée sur toutes les pages via le layout racine.
// Vérifie l'état d'authentification au montage et à chaque changement de route
// pour afficher les bons liens (Connexion / Dashboard / Déconnexion).
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface User { id: string; email: string; }

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  // checked passe à true une fois la vérification d'auth terminée,
  // ce qui évite un flash d'interface (afficher "Connexion" avant de savoir si on est connecté)
  const [checked, setChecked] = useState(false);

  // Recharge l'état d'auth à chaque changement de page (pathname)
  // pour refléter les connexions / déconnexions effectuées dans d'autres onglets
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setUser(json?.data ?? null))
      .finally(() => setChecked(true)); // Marque la vérification comme terminée
  }, [pathname]);

  // Appelle /api/auth/logout pour effacer le cookie JWT côté serveur,
  // puis redirige vers la page d'accueil (window.location force un rechargement complet)
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  }

  // Génère un lien de navigation avec style actif selon le pathname courant
  const navLink = (href: string, label: string) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
          active
            ? 'text-white bg-white/10 border border-white/10' // Style lien actif
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    // sticky + z-50 : la navbar reste visible au-dessus du contenu défilant
    // backdrop-blur : effet verre dépoli sur fond sombre translucide
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo — lien vers la page d'accueil */}
        <Link href="/" className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs shadow-lg shadow-violet-900/40">
            ♪
          </span>
          Beato<span className="gradient-text">thèque</span>
        </Link>

        {/* Liens de navigation à droite */}
        <div className="flex items-center gap-7">
          {/* Catalogue toujours visible (page publique) */}
          {navLink('/beats', 'Catalogue')}

          {/* Les liens auth ne s'affichent qu'après vérification pour éviter le flash */}
          {checked && (
            <>
              {user ? (
                /* Utilisateur connecté : Dashboard + Déconnexion */
                <>
                  {navLink('/dashboard', 'Dashboard')}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-200 transition-colors font-medium"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                /* Utilisateur non connecté : Connexion + Inscription */
                <>
                  <Link
                    href="/login"
                    className="text-sm text-gray-500 hover:text-gray-200 transition-colors font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-sm !py-2 !px-4"
                  >
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
