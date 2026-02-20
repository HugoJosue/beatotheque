// Gestion des licences d'un beat depuis le dashboard producteur
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LicenseCard } from '@/frontend/components/LicenseCard';

interface License {
  id: string;
  name: string;
  price: number;
  rightsText: string;
}

interface LicenseFormData {
  name: string;
  price: string;
  rightsText: string;
}

const EMPTY_FORM: LicenseFormData = { name: '', price: '', rightsText: '' };

export default function LicensesPage() {
  const { id: beatId } = useParams<{ id: string }>();

  const [beatTitle, setBeatTitle] = useState('');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulaire d'ajout / d'édition
  const [form, setForm] = useState<LicenseFormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [beatRes, licRes] = await Promise.all([
          fetch(`/api/beats/${beatId}`),
          fetch(`/api/beats/${beatId}/licenses`),
        ]);

        const beatJson = await beatRes.json();
        if (!beatJson.success) throw new Error(beatJson.error);
        setBeatTitle(beatJson.data.title);

        const licJson = await licRes.json();
        if (licJson.success) setLicenses(licJson.data);
      } catch {
        setError('Impossible de charger les données.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [beatId]);

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function startEdit(license: License) {
    setEditingId(license.id);
    setForm({ name: license.name, price: String(license.price), rightsText: license.rightsText });
    setFormError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const price = parseFloat(form.price);
    if (!form.name.trim()) return setFormError('Le nom est requis.');
    if (isNaN(price) || price < 0) return setFormError('Prix invalide.');
    if (form.rightsText.trim().length < 10) return setFormError('Le texte de droits doit faire au moins 10 caractères.');

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/licenses/${editingId}`
        : `/api/beats/${beatId}/licenses`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), price, rightsText: form.rightsText.trim() }),
      });
      const json = await res.json();

      if (!json.success) {
        setFormError(json.error ?? 'Erreur lors de la sauvegarde.');
        return;
      }

      if (editingId) {
        setLicenses((prev) => prev.map((l) => (l.id === editingId ? { ...json.data, price: Number(json.data.price) } : l)));
        flash('Licence modifiée.');
      } else {
        setLicenses((prev) => [...prev, { ...json.data, price: Number(json.data.price) }]);
        flash('Licence ajoutée.');
      }
      cancelEdit();
    } catch {
      setFormError('Erreur réseau.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(licId: string) {
    if (!confirm('Supprimer cette licence ?')) return;
    try {
      const res = await fetch(`/api/licenses/${licId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setLicenses((prev) => prev.filter((l) => l.id !== licId));
        flash('Licence supprimée.');
      }
    } catch {
      // silencieux — l'état n'est pas modifié en cas d'erreur réseau
    }
  }

  if (loading) return <div className="card animate-pulse h-32" />;
  if (error) return <div className="card text-red-400">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-violet-400 hover:underline text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-600">/</span>
        <Link href={`/dashboard/beats/${beatId}/edit`} className="text-violet-400 hover:underline text-sm">
          {beatTitle}
        </Link>
      </div>

      <h1 className="text-3xl font-bold">
        Licences <span className="text-violet-400">· {beatTitle}</span>
      </h1>

      {/* Message de succès */}
      {successMsg && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg px-4 py-2 text-sm">
          ✓ {successMsg}
        </div>
      )}

      {/* ── Formulaire ajout / édition ─────────────────────────────────────── */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">
          {editingId ? 'Modifier la licence' : '+ Nouvelle licence'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom de la licence</label>
            <input
              type="text"
              placeholder="ex: Lease basique"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Prix ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="29.99"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Texte des droits</label>
            <textarea
              rows={3}
              placeholder="Usage non-exclusif pour 1 projet musical…"
              value={form.rightsText}
              onChange={(e) => setForm((f) => ({ ...f, rightsText: e.target.value }))}
              required
              className="resize-none"
            />
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Sauvegarde…' : editingId ? 'Enregistrer' : 'Ajouter'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn-secondary">
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Liste des licences ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Licences existantes ({licenses.length})</h2>

        {licenses.length === 0 ? (
          <div className="card text-gray-500 text-center py-8">
            Aucune licence pour ce beat.
          </div>
        ) : (
          <div className="grid gap-3">
            {licenses.map((lic) => (
              <LicenseCard
                key={lic.id}
                license={lic}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}