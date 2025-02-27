# RiskView

## Changement Angular 19

Mtn le projet est en standalone, ca veux dire qu'il faut importer les modules dans les components qui en on besoins et plus dans un app module qui le rendait dispo partout. 

## Architecture

```
my-angular-project/
├── src/
│   ├── app/                        # Dossier principal de l'application
│   │   ├── core/                    # Module Core (services globaux)
│   │   │   ├── services/            # Services réutilisables (ex: auth, API)
│   │   │   ├── guards/              # Auth guards et autres protections de routes
│   │   │   ├── interceptors/        # Intercepteurs HTTP
│   │   │   ├── models/              # Interfaces et modèles de données HTTP
│   │   └── shared/                   # Module Shared (composants réutilisables)
│   │       ├── components/          # Composants UI (ex: boutons, modals)
│   │       ├── directives/          # Directives personnalisées
│   │       ├── pipes/               # Pipes personnalisés
│   │  
│   │   ├── features/                # Modules et composants spécifiques aux fonctionnalités
│   │   │   ├── auth/                # Gestion de l'authentification
│   │   │   │   ├── login/           # Page de connexion
│   │   │   │   ├── register/        # Page d'inscription
│   │   ├── layout/                  # Composants de mise en page globale
│   │   │   ├── header/              # Barre de navigation
│   │   │   ├── footer/              # Pied de page
│   │   │   ├── sidebar/             # Menu latéral
│   │  
│   │   ├── pages/                   # Pages principales de l'application
│   │   │   ├── home/                # Page d'accueil
│   │   │   ├── about/               # Page "À propos"
│   │   │   ├── contact/             # Page de contact
│   │  
│   │   ├── app.config.ts         # Configuration providers
│   │   ├── app.routes.ts         # Module de routage principal
│   │  
│   ├── assets/                      # Fichiers statiques (images, JSON, etc.)
│   │  
│   ├── environments/                 # Fichiers de configuration des environnements
│   │   ├── environment.ts            # Environnement de développement
│   │   ├── environment.prod.ts       # Environnement de production
│   │  
├── e2e/                              # Tests end-to-end
├── node_modules/                     # Dépendances Node.js
├── angular.json                      # Configuration Angular CLI
├── package.json                      # Dépendances et scripts npm
├── tsconfig.json                      # Configuration TypeScript
├── .editorconfig                      # Configuration de l'éditeur
├── .gitignore                         # Fichiers à ignorer par Git
└── README.md                          # Documentation du projet
```

## Variables css à utiliser en priorité (peut etre vu en inspectant la page de l'appli)

```
html {
    --mat-sys-background: #fff8f8;
    --mat-sys-error: #ba1a1a;
    --mat-sys-error-container: #ffdad6;
    --mat-sys-inverse-on-surface: #faeeef;
    --mat-sys-inverse-primary: #ffb1c5;
    --mat-sys-inverse-surface: #352f30;
    --mat-sys-on-background: #201a1b;
    --mat-sys-on-error: #ffffff;
    --mat-sys-on-error-container: #93000a;
    --mat-sys-on-primary: #ffffff;
    --mat-sys-on-primary-container: #8f0045;
    --mat-sys-on-primary-fixed: #3f001b;
    --mat-sys-on-primary-fixed-variant: #8f0045;
    --mat-sys-on-secondary: #ffffff;
    --mat-sys-on-secondary-container: #5b3f46;
    --mat-sys-on-secondary-fixed: #2b151b;
    --mat-sys-on-secondary-fixed-variant: #5b3f46;
    --mat-sys-on-surface: #201a1b;
    --mat-sys-on-surface-variant: #514346;
    --mat-sys-on-tertiary: #ffffff;
    --mat-sys-on-tertiary-container: #930100;
    --mat-sys-on-tertiary-fixed: #410000;
    --mat-sys-on-tertiary-fixed-variant: #930100;
    --mat-sys-outline: #847376;
    --mat-sys-outline-variant: #d6c2c5;
    --mat-sys-primary: #ba005c;
    --mat-sys-primary-container: #ffd9e1;
    --mat-sys-primary-fixed: #ffd9e1;
    --mat-sys-primary-fixed-dim: #ffb1c5;
    --mat-sys-scrim: #000000;
    --mat-sys-secondary: #74565d;
    --mat-sys-secondary-container: #ffd9e1;
    --mat-sys-secondary-fixed: #ffd9e1;
    --mat-sys-secondary-fixed-dim: #e3bdc5;
    --mat-sys-shadow: #000000;
    --mat-sys-surface: #fff8f8;
    --mat-sys-surface-bright: #fff8f8;
    --mat-sys-surface-container: #f7ebec;
    --mat-sys-surface-container-high: #f1e5e6;
    --mat-sys-surface-container-highest: #ece0e1;
    --mat-sys-surface-container-low: #fdf1f2;
    --mat-sys-surface-container-lowest: #ffffff;
    --mat-sys-surface-dim: #e3d7d8;
    --mat-sys-surface-tint: #ba005c;
    --mat-sys-surface-variant: #f3dde1;
    --mat-sys-tertiary: #c00100;
    --mat-sys-tertiary-container: #ffdad4;
    --mat-sys-tertiary-fixed: #ffdad4;
    --mat-sys-tertiary-fixed-dim: #ffb4a8;
    --mat-sys-neutral-variant20: #3a2d30;
    --mat-sys-neutral10: #201a1b;
}```



