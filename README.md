# RH Live — SNRT

Application web de consultation en temps réel de la disponibilité des ressources humaines audiovisuelles de la SNRT.

Outil de **consultation** (pas de planification) : affiche, filtre et met à jour en temps réel la disponibilité des ressources, avec détection de conflits, calendrier multi-vues, tableau de bord et export PDF.

---

## Stack technique

React 19 + TypeScript + Tailwind CSS v4 (frontend) · Node.js + Express + TypeScript (backend) · PostgreSQL · WebSocket pour le temps réel · JWT + bcrypt pour l'authentification.

---

## Installation

**Prérequis** : Node.js 18+, PostgreSQL installé et démarré.

### 1. Cloner et installer

```bash
git clone https://github.com/Kaddouri-coder/rh-live-snrt.git
cd rh-live-snrt
npm install
```

### 2. Créer la base de données

Dans pgAdmin4 (ou `psql`), créer une base `snrt_db`, puis exécuter :

```sql
CREATE TABLE ressources_humaines (
    id VARCHAR(50) PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    fonction VARCHAR(100),
    direction VARCHAR(100),
    chaine_rattachement VARCHAR(100),
    statut_contrat VARCHAR(50) CHECK (statut_contrat IN ('Permanent','CDI','Pigiste','Intermittent')),
    email VARCHAR(150),
    telephone VARCHAR(50),
    competences TEXT[]
);

CREATE TABLE affectations (
    id VARCHAR(255) PRIMARY KEY,
    ressource_id VARCHAR(255) REFERENCES ressources_humaines(id) ON DELETE CASCADE,
    emission_nom VARCHAR(255),
    code_emission VARCHAR(255),
    lieu VARCHAR(255),
    chaine VARCHAR(255),
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    type_production VARCHAR(255),
    statut VARCHAR(255)
);

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('admin','consultant')) NOT NULL DEFAULT 'consultant',
    telephone VARCHAR(50),
    matricule VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Créer le premier compte administrateur

```sql
INSERT INTO users (id, email, password_hash, nom, role)
VALUES (
  'user-001', 'admin@snrt.ma',
  '$2b$10$XTX8k5MsNpv.C25JNoLotOz8PCDLSkL8Wv8PJdfgkDfCOwJGEO.hi', -- mot de passe : Admin@2026
  'Administrateur', 'admin'
);
```

### 4. Configurer l'environnement et lancer

```bash
cp .env.example .env
npm run dev
```

Accessible sur **http://localhost:3000**.

---

## Variables d'environnement

| Variable | Description |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Connexion PostgreSQL |
| `DB_SSL` | `"true"` si la base exige SSL, sinon `false` |
| `JWT_SECRET` | Clé secrète pour les tokens — à changer en production |

---

## Scripts

`npm run dev` (développement) · `npm run build` (production) · `npm start` (démarrer le build) · `npm run lint` (vérification TypeScript) · `npm run test` (tests Vitest)

---

## Sécurité

Mots de passe hashés (bcryptjs), authentification JWT, validation stricte des entrées, requêtes SQL paramétrées, routes sensibles réservées au rôle admin.

---

## Licence

Projet interne — Société Nationale de Radiodiffusion et de Télévision (SNRT).