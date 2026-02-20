// src/components/BeatForm.tsx
// Formulaire réutilisable pour créer et modifier un beat
'use client';

import { useState, FormEvent, useRef, DragEvent } from 'react';

interface BeatFormData {
  title: string;
  bpm: number | '';
  style: string;
  key: string;
  price: number | '';
  previewUrl: string;
}

interface Props {
  initialData?: Partial<BeatFormData>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
}

const STYLES = ['Trap', 'Lo-fi', 'Drill', 'Boom Bap', 'R&B', 'Afrobeats', 'House', 'Pop', 'Autre'];
const KEYS   = ['C major', 'C minor', 'D major', 'D minor', 'E major', 'E minor', 'F major',
                 'F minor', 'G major', 'G minor', 'A major', 'A minor', 'B major', 'B minor'];

export function BeatForm({ initialData, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<BeatFormData>({
    title:      initialData?.title      ?? '',
    bpm:        initialData?.bpm        ?? '',
    style:      initialData?.style      ?? '',
    key:        initialData?.key        ?? '',
    price:      initialData?.price      ?? '',
    previewUrl: initialData?.previewUrl ?? '',
  });

  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Upload audio
  const [audioMode, setAudioMode]   = useState<'url' | 'file'>('url');
  const [dragOver, setDragOver]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadedName, setUploadedName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(field: keyof BeatFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadFile(file: File) {
    if (!file.type.match(/audio\/(mpeg|mp3|wav|wave|x-wav)/) && !file.name.match(/\.(mp3|wav)$/i)) {
      setError('Format non supporté. Utilisez MP3 ou WAV.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 50 Mo).');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? 'Erreur upload.'); return; }
      set('previewUrl', json.data.url);
      setUploadedName(file.name);
    } catch {
      setError('Erreur réseau lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim())     { setError('Le titre est requis.');             return; }
    if (!form.bpm)               { setError('Le BPM est requis.');              return; }
    if (!form.style)             { setError('Le style est requis.');            return; }
    if (!form.key)               { setError('La tonalité est requise.');        return; }
    if (form.price === '')       { setError('Le prix est requis.');             return; }
    if (!form.previewUrl.trim()) { setError('L\'URL de préview est requise.'); return; }

    setLoading(true);
    try {
      await onSubmit({
        title:      form.title.trim(),
        bpm:        Number(form.bpm),
        style:      form.style,
        key:        form.key,
        price:      Number(form.price),
        previewUrl: form.previewUrl.trim(),
      });
      setSuccess('Sauvegardé avec succès !');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {/* Titre */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Titre *</label>
        <input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Ex: Midnight Waves"
          maxLength={200}
          required
        />
      </div>

      {/* Style + BPM */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Style *</label>
          <select value={form.style} onChange={(e) => set('style', e.target.value)} required>
            <option value="">— Choisir —</option>
            {STYLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">BPM *</label>
          <input
            type="number"
            value={form.bpm}
            onChange={(e) => set('bpm', e.target.value)}
            placeholder="140"
            min={40}
            max={300}
            required
          />
        </div>
      </div>

      {/* Tonalité + Prix */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tonalité *</label>
          <select value={form.key} onChange={(e) => set('key', e.target.value)} required>
            <option value="">— Choisir —</option>
            {KEYS.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prix de base ($) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="29.99"
            min={0}
            step={0.01}
            required
          />
        </div>
      </div>

      {/* Prévisualisation audio — URL ou Fichier */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Prévisualisation audio *</label>

        {/* Toggle URL / Fichier */}
        <div className="flex gap-1 mb-3 bg-[#111] rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => setAudioMode('url')}
            className={`text-xs px-3 py-1.5 rounded-md transition ${
              audioMode === 'url'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Lien URL
          </button>
          <button
            type="button"
            onClick={() => setAudioMode('file')}
            className={`text-xs px-3 py-1.5 rounded-md transition ${
              audioMode === 'file'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Fichier (MP3 / WAV)
          </button>
        </div>

        {audioMode === 'url' ? (
          <input
            type="url"
            value={form.previewUrl}
            onChange={(e) => { set('previewUrl', e.target.value); setUploadedName(''); }}
            placeholder="https://exemple.com/beat.mp3"
          />
        ) : (
          <>
            {/* Zone drag & drop */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                dragOver
                  ? 'border-violet-500 bg-violet-900/20'
                  : 'border-[#2A2A2A] hover:border-violet-700 hover:bg-[#1E1E1E]'
              }`}
            >
              {uploading ? (
                <p className="text-gray-400 text-sm">Upload en cours…</p>
              ) : uploadedName ? (
                <div className="space-y-1">
                  <p className="text-green-400 text-sm font-medium">✓ {uploadedName}</p>
                  <p className="text-gray-500 text-xs">Cliquer ou déposer pour remplacer</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-3xl">🎵</p>
                  <p className="text-gray-300 text-sm font-medium">
                    Dépose ton fichier ici ou clique pour parcourir
                  </p>
                  <p className="text-gray-500 text-xs">MP3 ou WAV — max 50 Mo</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              onChange={handleFileChange}
              className="hidden"
            />
            {/* Affiche l'URL générée */}
            {form.previewUrl && audioMode === 'file' && (
              <p className="text-xs text-gray-500 mt-1 truncate">{form.previewUrl}</p>
            )}
          </>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg px-4 py-2 text-sm">
          ✓ {success}
        </div>
      )}

      <button type="submit" disabled={loading || uploading} className="btn-primary w-full py-3">
        {loading ? 'Enregistrement…' : submitLabel}
      </button>
    </form>
  );
}
