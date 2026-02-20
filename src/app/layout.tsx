// Layout racine : inclus sur toutes les pages (Navbar, styles globaux)

import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/frontend/components/Navbar';

export const metadata: Metadata = {
  title: 'Beatothèque — Bibliothèque de Beats',
  description: 'Gérez et découvrez des beats musicaux avec licences.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-surface text-white min-h-screen font-sans antialiased">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}