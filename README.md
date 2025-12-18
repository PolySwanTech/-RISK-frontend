# 🛡️ RiskView

**RiskView** est une application moderne de gestion et de cartographie des risques, développée avec **Angular 19**. Elle permet de visualiser, d'évaluer et de piloter les plans d'action liés aux risques opérationnels.

---

## 🚀 Évolutions Angular 19

Le projet a été migré vers **Angular 19** en utilisant l'architecture **Standalone**.

- **Plus de `AppModule`** : Le projet est en standalone, les composants gèrent désormais leurs propres dépendances.
- **Imports explicites** : Il faut importer les modules directement dans les composants qui en ont besoin au lieu d'un module global.

---

## 🏗️ Architecture du Projet

L'organisation des fichiers suit une structure modulaire pour garantir la scalabilité :

```text
src/app/
├── core/            # Services globaux (auth, API), guards, interceptors et modèles
├── features/        # Modules et composants spécifiques aux fonctionnalités (auth, login, etc.)
├── layout/          # Éléments de mise en page globale (header, footer, sidebar)
├── pages/           # Pages principales de l'application (home, about, contact)
├── shared/          # Composants UI, directives et pipes réutilisables
└── environments/    # Fichiers de configuration des environnements (dev / prod)
```

---

## 🎨 Guide de Style (Material 3)

L'application utilise les variables CSS de **Angular Material 3**. Voici les variables prioritaires à utiliser pour maintenir la cohérence visuelle :

| Élément       | Variable CSS                    |
|---------------|---------------------------------|
| Primaire      | `--mat-sys-primary`             |
| Arrière-plan  | `--mat-sys-background`          |
| Erreur        | `--mat-sys-error`               |
| Surface       | `--mat-sys-surface-container`   |
| Contour       | `--mat-sys-outline`             |

---

## 🛠️ Installation et Développement

### Prérequis

- **Node.js** : v19
- **Angular CLI** : ^19.1.8

### Installation

```bash
npm install
```

### Lancer l'application

```bash
npm start
```

L'application utilise une configuration de proxy (`proxy.conf.json`) pour les appels API.

### Tests & Qualité

- **Tests unitaires** : `npm test`
- **Build de production** : `npm run build`
- **Linting** : Le projet utilise `stylelint` pour valider les fichiers SCSS.

---

## 📦 Stack Technique Principale

- **Framework** : Angular ^19.1.0
- **UI Component** : Angular Material ^19.2.1
- **Graphiques** : Chart.js ^3.9.1 & ng2-charts ^4.1.1
- **Tableaux** : angular-datatables ^19.0.0
- **Internationalisation** : @ngx-translate/core ^16.0.4
- **Utilitaires** : date-fns (dates), xlsx (Excel), mammoth (Docx)

---

## 🐳 Docker

Une configuration Docker est disponible pour la production.

### Construire l'image :

```bash
docker build -t risk-view .
```

### Lancer le conteneur :

```bash
docker run -p 80:80 risk-view
```

Le build de production est servi via **Nginx** sur le port 80.

---

## 📄 Licence

Ce projet est développé en interne. Tous droits réservés.

---

## 👥 Contributeurs

Pour toute question ou suggestion, contactez l'équipe de développement.