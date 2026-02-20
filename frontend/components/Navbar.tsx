// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface User { id: string; email: string; }

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setUser(json?.data ?? null))
      .finally(() => setChecked(true));
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  }

  const navLink = (href: string, label: string) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
          active
            ? 'text-white bg-white/10 border border-white/10'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs shadow-lg shadow-violet-900/40">
            ♪
          </span>
          Beato<span className="gradient-text">thèque</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-7">
          {navLink('/beats', 'Catalogue')}

          {checked && (
            <>
              {user ? (
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
