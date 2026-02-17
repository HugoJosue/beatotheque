# Beatothèque

> Application web full-stack de gestion d'une bibliothèque de beats musicaux et de leurs licences.

---

## 1. Description du projet

**Dépôt GitHub :** `https://github.com/VOTRE_USERNAME/beatotheque`

### Objectif
Beatothèque permet à des producteurs musicaux de publier leurs beats, de les organiser par style, BPM et tonalité, et de définir des licences (lease, exclusif, etc.) que les acheteurs potentiels peuvent consulter.

### Fonctionnalités principales
- 🎵 **Catalogue public** : liste et recherche de beats avec filtre par style, pagination
- 🔐 **Authentification JWT** : inscription, connexion sécurisée, déconnexion
- 🎛️ **Dashboard producteur** : CRUD complet sur ses propres beats
- 📄 **Gestion des licences** : création et modification de licences par beat
- 🛡️ **Ownership** : un utilisateur ne peut modifier/supprimer que SES ressources
- 📱 **Interface responsive** : adaptée mobile et desktop

---

## 2. Technologies utilisées

| Technologie       | Version  | Rôle                                |
|-------------------|----------|-------------------------------------|
| Next.js           | 14.2.5   | Framework full-stack (App Router)   |
| React             | 18.3     | Interface utilisateur               |
| TypeScript        | 5.5      | Typage strict                       |
| Prisma            | 5.14     | ORM — accès PostgreSQL              |
| PostgreSQL (Neon) | —        | Base de données serverless          |
| Tailwind CSS      | 3.4      | Styles utilitaires                  |
| jose              | 5.6      | JWT (compatible Edge runtime)       |
| bcryptjs          | 2.4      | Hachage des mots de passe           |
| Zod               | 3.23     | Validation des données              |

---

## 3. Instructions d'installation

### Prérequis
- Node.js 18+
- Un projet Neon (https://neon.tech) — PostgreSQL gratuit

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/VOTRE_USERNAME/beatotheque.git
cd beatotheque

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# → Remplir DATABASE_URL (Neon) et JWT_SECRET dans .env

# 4. Générer le client Prisma et appliquer le schéma
npm run db:generate
npm run db:push

# 5. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur **http://localhost:3000**

### Commandes utiles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run db:studio    # Interface visuelle Prisma
npm run db:migrate   # Migration avec historique (prod)
```

---

## 4. Variables d'environnement

| Variable             | Description                                      | Obligatoire |
|----------------------|--------------------------------------------------|-------------|
| `DATABASE_URL`       | URL Neon PostgreSQL avec `?sslmode=require`      | ✅          |
| `JWT_SECRET`         | Clé secrète JWT (min. 32 caractères)             | ✅          |
| `JWT_EXPIRES_IN`     | Durée de validité du token (ex: `7d`)            | ✅          |
| `NEXT_PUBLIC_BASE_URL` | URL de base (ex: `http://localhost:3000`)      | Optionnel   |

> **Important :** Ne jamais committer le fichier `.env`. Utilisez `.env.example` comme référence.

---

## 5. Captures d'écran

> Placez vos captures dans `docs/screenshots/` et remplacez les chemins ci-dessous.

| # | Capture |
|---|---------|
| 1 | ![Page d'accueil](docs/screenshots/1-home.png) |
| 2 | ![Catalogue des beats](docs/screenshots/2-catalogue.png) |
| 3 | ![Dashboard producteur](docs/screenshots/3-dashboard.png) |

---

## 6. Auteur(s)

| Nom | Matricule |
|-----|-----------|
| Prénom Nom | XXXXXXXX |

---

## Note de livraison (Lab 2)

> Pour la remise sur Teams, soumettre un fichier `.txt` contenant **uniquement l'URL du dépôt GitHub**.

---

## Tests API (Postman / curl)

### Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@exemple.com","password":"motdepasse123"}'
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@exemple.com","password":"motdepasse123"}'
```

### Créer un beat (authentifié)
```bash
curl -X POST http://localhost:3000/api/beats \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"Test Beat","bpm":140,"style":"Trap","key":"A minor","price":29.99,"previewUrl":"https://exemple.com/beat.mp3"}'
```

### Liste des beats (public)
```bash
curl "http://localhost:3000/api/beats?style=Trap&page=1&limit=5"
```

### Ajouter une licence
```bash
curl -X POST http://localhost:3000/api/beats/{BEAT_ID}/licenses \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Lease basique","price":29.99,"rightsText":"Usage non-exclusif pour 1 projet musical."}'
```
