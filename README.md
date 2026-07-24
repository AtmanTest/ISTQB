# ISTQB CTFL — Plateforme de Préparation à la Certification

**Version :** 0.1.0 · **Syllabus :** CTFL v4.0.1

Une plateforme web interactive et moderne pour préparer la certification **ISTQB Certified Tester Foundation Level (CTFL)**. Construite avec Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, et Zustand.

## 🎯 Objectif

Cette application accompagne les candidats à la certification ISTQB CTFL dans leur apprentissage avec :

- 📖 **Syllabus complet** — Les 6 chapitres du syllabus CTFL v4.0.1 structurés en sections et leçons
- 🧠 **Quiz interactifs** — Quiz rapides, par chapitre, par objectif d'apprentissage, et révision des erreurs
- 🃏 **Flashcards** — Révision par répétition espacée (SM-2) pour la mémorisation à long terme
- 📝 **Examens blancs** — Conditions réelles : 40 questions, 60 minutes, seuil de 65 % (26/40)
- 📊 **Statistiques détaillées** — Progression, scores par chapitre/K-level, points faibles
- 📋 **Plans d'étude** — Plans structurés de 2, 4, 6 ou 8 semaines avec suivi quotidien
- 📚 **Glossaire** — Terminologie officielle ISTQB avec recherche et filtres
- 📎 **Ressources** — Liens officiels et communautaires pour approfondir

## 🛠️ Stack Technique

| Technologie | Utilisation |
|---|---|
| **Next.js 15** (App Router) | Framework React avec rendu hybride SSR/CSR |
| **React 19** | Interface utilisateur |
| **TypeScript** | Typage statique strict |
| **Tailwind CSS v4** | Styles utilitaires |
| **Zustand** (persist middleware) | Gestion d'état avec persistance localStorage |
| **Zod** | Validation de schémas |
| **Recharts** | Graphiques et visualisations |
| **Radix UI** | Composants d'interface accessibles |
| **Lucide React** | Icônes |
| **date-fns** | Formatage de dates |
| **Vitest** | Tests unitaires |
| **Dexie.js** (optionnel) | IndexedDB pour données volumineuses |

### Structure du Projet

```
src/
├── app/                    # Pages (App Router)
│   ├── page.tsx            # Accueil
│   ├── dashboard/          # Tableau de bord
│   ├── stats/              # Statistiques
│   ├── study-plan/         # Plans d'étude
│   ├── resources/          # Ressources
│   ├── syllabus/           # Syllabus (chapitres)
│   │   └── [chapterSlug]/  # Chapitre + leçons
│   ├── quiz/               # Quiz (rapide, chapitre, LO, erreurs)
│   ├── exam/               # Examens blancs
│   │   ├── session/[id]/   # Session d'examen
│   │   └── results/[id]/   # Résultats
│   ├── flashcards/         # Flashcards
│   └── glossary/           # Glossaire
├── components/
│   ├── layout/             # AppShell, Sidebar, Topbar
│   ├── ui/                 # Card, Button, Badge, Progress
│   ├── shared/             # ThemeProvider, ThemeToggle
│   └── quiz/               # QuizEngine
├── data/seed/              # Données initiales (JSON)
├── store/                  # Zustand stores
│   ├── useISTQBStore.ts    # Store principal
│   ├── useQuizStore.ts     # Store quiz
│   └── useExamStore.ts     # Store examen
├── types/index.ts          # Interfaces TypeScript
├── lib/                    # Fonctions utilitaires + constantes
├── utils/                  # Algorithmes métier
│   ├── scoring.ts          # Calculs de scores et maîtrise
│   ├── exam-generator.ts   # Génération d'examens
│   ├── weak-topics.ts      # Analyse des points faibles
│   └── spaced-repetition.ts # Algorithme SM-2
├── hooks/                  # Hooks personnalisés
└── __tests__/              # Tests Vitest
```

## 🚀 Installation

### Prérequis

- **Node.js** ≥ 18.18 (recommandé : ≥ 20)
- **npm**, **yarn**, **pnpm** ou **bun**

### Installation rapide

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd istqb

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Construire pour la production
npm run build
npm start
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

### Commandes disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:coverage` | Tests avec rapport de couverture |

## ✨ Fonctionnalités

### 📖 Syllabus interactif

Les 6 chapitres du syllabus CTFL v4.0.1 sont intégralement disponibles avec :
- Navigation structurée (chapitres → sections → leçons)
- Objectifs d'apprentissage (LO) par chapitre
- Exemples et contre-exemples pour chaque concept
- Pièges d'examen identifiés
- Liens vers les termes du glossaire

### 🧠 Quiz adaptatifs

- **Quiz rapide** — 10 questions aléatoires
- **Quiz par chapitre** — Validez votre compréhension
- **Quiz par LO** — Ciblez un objectif spécifique
- **Révision des erreurs** — Concentrez-vous sur vos points faibles
- Questions à choix unique ou multiple
- Niveaux K1 (mémorisation), K2 (compréhension), K3 (application)

### 🃏 Flashcards (SM-2)

L'algorithme de répétition espacée SM-2 optimise votre mémorisation :
- Révision selon 4 niveaux : Again / Hard / Good / Easy
- Intervalles calculés dynamiquement (1, 3, 7, 14 jours)
- Suivi du taux de succès et des séquences correctes

### 📝 Examens blancs

- Simulation des conditions réelles de l'examen ISTQB
- **40 questions** à choix multiple
- **60 minutes** (75 minutes pour non-anglophones)
- **Seuil de réussite : 65 % (26/40)**
- Minuteur intégré
- Possibilité de marquer des questions pour révision
- Analyse détaillée : score, pourcentage, répartition par chapitre/LO/K-level

### 📊 Statistiques et progression

- Graphique d'évolution des scores (LineChart)
- Scores par chapitre (BarChart)
- Précision par niveau K (RadarChart)
- Analyse des points faibles avec score de priorité
- Temps d'étude total
- Taux de complétion des chapitres et LO maîtrisés

### 📋 Plans d'étude personnalisés

Choisissez parmi 4 plans structurés :

| Plan | Durée | Par jour | Intensité |
|---|---|---|---|
| Intensif | 14 jours | 180 min | 🔴 Élevée |
| Standard | 28 jours | 90 min | 🟡 Modérée |
| Détaillé | 42 jours | 60 min | 🟢 Normale |
| Progressif | 56 jours | 45 min | 🔵 Légère |

Chaque plan génère automatiquement des tâches quotidiennes (lecture, quiz, flashcards, examens) avec suivi de progression par jour.

### 📚 Glossaire ISTQB

- Recherche en temps réel dans la terminologie
- Filtres par chapitre et par niveau K
- Termes français/anglais
- Liens vers les objectifs d'apprentissage associés
- Marqueurs de révision

### 📎 Ressources

- Liens officiels ISTQB (syllabus, examens blancs, glossaire)
- Ressources communautaires (forums, tutoriels)
- Conseils d'étude et structure de l'examen

### 🌗 Thème sombre/clair

- Mode sombre natif avec détection automatique du système
- Persistance du choix utilisateur
- Pas de flash de thème non stylé au chargement

## 🔬 Algorithmes Métier

### Scoring (`src/utils/scoring.ts`)

- **Maîtrise d'un chapitre** : moyenne pondérée (leçons 20 %, quiz 40 %, examens 40 %)
- **Maîtrise d'un LO** : ratio correct/tentatives (minimum 3 tentatives)
- **Moyenne glissante** : pondération linéaire (les plus récents ont plus de poids)
- **Priorité des points faibles** : combine nombre d'erreurs, récence et niveau K
- **Analyse de confiance** : détecte surconfiance et sous-confiance
- **Passage/Fail** : seuil à 26/40 (65 %)

### Exam Generator (`src/utils/exam-generator.ts`)

- Filtrage par chapitre, LO, niveau K
- Sélection aléatoire avec limite de questions
- Validation des réponses avec breakdown par chapitre/LO/K-level
- Support des questions à choix unique et multiple

### Weak Topics (`src/utils/weak-topics.ts`)

- Agrège les erreurs des quiz et examens
- Groupe par LO et par chapitre
- Calcule un score de priorité pour chaque point faible
- Génère des suggestions d'action personnalisées

## 🧪 Tests

Les tests unitaires sont écrits avec **Vitest** et couvrent :

- **Scoring** (`src/__tests__/scoring.test.ts`) — 9 suites de tests
  - Calcul de maîtrise de chapitre
  - Calcul de maîtrise d'objectif d'apprentissage
  - Moyenne glissante pondérée
  - Score de priorité des points faibles
  - Analyse de confiance
  - Détermination passage/fail

- **Exam Engine** (`src/__tests__/exam-engine.test.ts`) — 10 suites de tests
  - Génération d'examen (filtres, limites)
  - Génération de quiz (configuration, minuteur)
  - Validation des réponses (score, pourcentage, passage/fail)
  - Breakdown par chapitre, LO, K-level
  - Règles d'examen (40 questions, 60/75 min, seuil 65 %)
  - Questions multi-choix

```bash
# Exécuter tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Rapport de couverture
npm run test:coverage
```

## 🗄️ Données

Les données initiales sont chargées depuis des fichiers JSON dans `src/data/seed/` :
- `chapters.json` — Les 6 chapitres avec sections, leçons, LO
- `questions.json` — Banque de questions (400+)
- `flashcards.json` — Flashcards
- `glossary.json` — Termes du glossaire
- `resources.json` — Liens officiels
- `cheatsheets.json` — Aide-mémoire
- `demo-study-plan.json` — Exemple de plan d'étude

L'état utilisateur (progression, scores, révisions) est persisté dans **localStorage**.

## 📄 Licence

Ce projet est fourni à titre éducatif. ISTQB® est une marque déposée de l'International Software Testing Qualifications Board. Ce projet n'est pas affilié officiellement à l'ISTQB.

---

> **Note :** Cette plateforme est un outil d'entraînement. Pour passer la certification officielle, veuillez vous référer au site [istqb.org](https://www.istqb.org).
