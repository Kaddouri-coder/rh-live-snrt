# RH Live — SNRT

Application web de **consultation en temps réel de la disponibilité des ressources humaines audiovisuelles** de la SNRT (Société Nationale de Radiodiffusion et de Télévision).

RH Live n'est **pas** un outil de planification — c'est un système de **consultation** : il affiche, filtre et met à jour en temps réel les données de disponibilité (ressources, affectations), sans les gérer lui-même.

Identité visuelle **Neon Human Mesh** : thème sombre, accents lime/cyan/violet, constellation animée en fond représentant le flux des ressources humaines à travers les chaînes SNRT.

---

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** — JWT + bcrypt, gestion des rôles (Administrateur / Consultant)
- 👤 **Administration** — CRUD complet des comptes utilisateurs, recherche, validation email/mot de passe fort
- 🔎 **Recherche de disponibilité** — filtres multiples (chaîne, direction, fonction, période, nom), détection automatique des conflits de planning
- 📅 **Vue calendrier** — 4 modes (Journée / Semaine / Mois / Période personnalisée), agenda vertical dédié sur mobile
- 📊 **Tableau de bord temps réel** :
  - *Availability mesh* — vue d'ensemble des ressources par chaîne (logos réels quand disponibles)
  - *Qui peut être mobilisé, là, maintenant ?* — vérification de disponibilité en temps réel (fenêtre glissante de 2h)
  - *Disponibilité par chaîne* — taux réel de ressources libres, chaîne par chaîne
- 🖼️ **Logos de chaînes** — badge réutilisable (`ChannelBadge`) affichant le vrai logo quand disponible, sinon des initiales colorées
- 📄 **Export PDF** — génération d'un rapport de disponibilité imprimable
- ⚡ **Temps réel** — mises à jour automatiques via WebSocket, y compris pour les changements faits directement en base (PostgreSQL `LISTEN`/`NOTIFY`)
- 📱 **Responsive** — utilisable sur mobile, tablette et desktop

---

## 🏗️ Stack technique

| Couche | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4 (thème CSS-first, tokens `lime`/`cyan`/`violet`), Vite |
| **Polices** | Space Grotesk (titres), DM Sans (texte) |
| **Backend** | Node.js, Express, TypeScript |
| **Base de données** | PostgreSQL |
| **Temps réel** | WebSocket (`ws`), PostgreSQL `LISTEN`/`NOTIFY` |
| **Authentification** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Fond animé** | Canvas 2D natif (particules + parallax souris) — aucune dépendance 3D/WebGL |

### Architecture (résumé)
Frontend (React) -> services/api.ts -> Backend (Express, /api) -> Models -> PostgreSQL
|
WebSocket (ws) <-- broadcast() <-- dbListener.ts (LISTEN/NOTIFY)

- **`frontend/services/api.ts`** centralise tous les appels réseau vers le backend.
- **`frontend/context/AuthContext.tsx`** gère l'utilisateur connecté et le token de façon globale (React Context).
- **`backend/controllers/`** puis **`backend/models/`** : chaque route API délègue sa logique métier au controller correspondant, qui est le seul à interroger la base via son model.
- **`backend/websocket.ts`** + **`backend/dbListener.ts`** : toute écriture en base (via l'API *ou* directement en SQL) déclenche une notification poussée à tous les clients connectés.
- **`frontend/data/channelStyles.ts`** + **`frontend/components/ChannelBadge.tsx`** : association nom de chaîne → logo réel (`public/logos-chaines/`) ou badge coloré de repli.

---

## 📋 Prérequis

- [Node.js](https://nodejs.org/) 18 ou supérieur
- [PostgreSQL](https://www.postgresql.org/) (via pgAdmin4 ou autre) installé et démarré

---

## 🚀 Installation

### 1. Cloner le projet et installer les dépendances

```bash
git clone https://github.com/Kaddouri-coder/rh-live-snrt.git
cd rh-live-snrt
npm install
```

### 2. Créer la base de données

Dans pgAdmin4 (ou `psql`), créer une base nommée `snrt_db`, puis exécuter :

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

**(Optionnel mais recommandé)** — activer les notifications temps réel même pour les changements SQL directs :

```sql
CREATE OR REPLACE FUNCTION notify_data_change() RETURNS TRIGGER AS $$
DECLARE
  payload TEXT;
BEGIN
  payload = json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id)
  )::text;
  PERFORM pg_notify('data_changes', payload);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ressources_notify
AFTER INSERT OR UPDATE OR DELETE ON ressources_humaines
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

CREATE TRIGGER affectations_notify
AFTER INSERT OR UPDATE OR DELETE ON affectations
FOR EACH ROW EXECUTE FUNCTION notify_data_change();

CREATE TRIGGER users_notify
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION notify_data_change();
```

### 3. Créer le premier compte administrateur

```sql
INSERT INTO users (id, email, password_hash, nom, role)
VALUES (
  'user-001',
  'admin@snrt.ma',
  '$2b$10$XTX8k5MsNpv.C25JNoLotOz8PCDLSkL8Wv8PJdfgkDfCOwJGEO.hi', -- mot de passe : Admin@2026
  'Administrateur',
  'admin'
);
```

### 4. Configurer les variables d'environnement

Copier `.env.example` en `.env` et renseigner vos valeurs :

```bash
cp .env.example .env
```

Voir la section [Variables d'environnement](#-variables-denvironnement) ci-dessous.

### 5. Lancer l'application

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**.

---

## 🔑 Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `DB_HOST` | Hôte PostgreSQL | `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_USER` | Utilisateur PostgreSQL | `postgres` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | - |
| `DB_NAME` | Nom de la base | `snrt_db` |
| `DB_SSL` | `"true"` si la base exige une connexion SSL (bases hébergées en production) | `false` |
| `JWT_SECRET` | Clé secrète pour signer les tokens de connexion — **à changer en production** | chaîne aléatoire longue |

---

## 📜 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement (backend + frontend, avec rechargement à chaud) |
| `npm run build` | Compile le frontend et le backend pour la production |
| `npm start` | Démarre l'application compilée (après `npm run build`) |
| `npm run lint` | Vérifie le typage TypeScript sans compiler (`tsc --noEmit`) |
| `npm run test` | Exécute les tests unitaires (Vitest) |
| `npm run clean` | Supprime les fichiers de build |

---

## 📁 Structure du projet
├── backend/
│ ├── controllers/ Logique métier de chaque route (validation, appel aux models)
│ ├── models/ Seule couche autorisée à exécuter des requêtes SQL
│ ├── middleware/ authMiddleware.ts (vérification JWT, rôles)
│ ├── routes/ apiRouter.ts — liste des routes /api/*
│ ├── db.ts Pool de connexion PostgreSQL
│ ├── websocket.ts Serveur WebSocket + fonction broadcast()
│ └── dbListener.ts Écoute PostgreSQL LISTEN/NOTIFY
│
├── frontend/
│ ├── components/
│ │ ├── SNRTBackground.tsx Fond animé plein écran (Canvas 2D + logos de chaînes)
│ │ ├── ChannelBadge.tsx Badge réutilisable : logo réel ou initiales colorées
│ │ ├── Sidebar.tsx, Dashboard.tsx, CalendarView.tsx, ResourceList.tsx, ...
│ │ └── ... (modals, AdminPanel, LoginPage, etc.)
│ ├── context/ AuthContext.tsx — utilisateur connecté partagé globalement
│ ├── services/ api.ts — tous les appels réseau centralisés
│ ├── data/
│ │ ├── constants.ts Listes de chaînes, directions, fonctions
│ │ └── channelStyles.ts Association chaîne → logo réel / couleur de repli
│ ├── App.tsx Composant racine
│ └── main.tsx Point d'entrée
│
├── shared/
│ └── types.ts Interfaces TypeScript partagées frontend/backend
│
├── public/
│ ├── logos-chaines/ Logos réels des chaînes SNRT (PNG/WebP)
│ ├── sahara-human-flow.webp Fond du panneau de connexion
│ └── mesh-network-bg.png Fond du panneau "Availability mesh" (Dashboard)
│
├── server.ts Point d'entrée du serveur (Express + Vite + WebSocket)
└── .env.example Modèle des variables d'environnement

---

## 🎨 Identité visuelle — Neon Human Mesh

| Élément | Valeur |
|---|---|
| Fond | `#05080b` (quasi noir, teinté bleu pétrole) |
| Couleur signature | Lime `#b7ff4a` |
| Accent secondaire | Cyan `#58d5ff` |
| Accent tertiaire | Violet `#a58cff` |
| Police titres | Space Grotesk |
| Police texte | DM Sans |

Le thème est **sombre en permanence** (pas de bascule clair/sombre) ; seule la page de connexion et le fond d'ambiance (`SNRTBackground`) sont visibles avant authentification.

---

## 🔒 Sécurité

- Mots de passe hashés avec `bcryptjs` (jamais stockés en clair)
- Authentification par token JWT (expiration 8h), vérifiée sur toutes les routes protégées
- Validation stricte des emails et de la robustesse des mots de passe (8 caractères min., majuscule, minuscule, chiffre, caractère spécial) côté client **et** serveur
- Requêtes SQL paramétrées (protection contre les injections SQL)
- Routes de modification/suppression des ressources et de configuration réservées au rôle `admin`

---

## 📄 Licence

Projet interne — Société Nationale de Radiodiffusion et de Télévision (SNRT).