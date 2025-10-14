import { Component, inject, Input, OnInit, Output, EventEmitter, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { RiskCategoryService } from '../../../core/services/risk/risk-category.service';
import { RiskReferentielService } from '../../../core/services/risk/risk-referentiel.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { BaloiseCategoryDto, baloisFormatLabel } from '../../../core/models/RiskReferentiel';
import { Level, RiskSelectionMode } from '../../../core/enum/riskSelection.enum';

export enum NavigationMode {
  Hierarchical = 'hierarchical',
  Direct = 'direct'
}

@Component({
  selector: 'app-select-risk-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './select-risk-event.component.html',
  styleUrls: ['./select-risk-event.component.scss']
})
export class SelectRiskEventComponent implements OnInit {

  @Input() mode: RiskSelectionMode = RiskSelectionMode.Event;
  @Output() selected = new EventEmitter<any>();

  // --- Navigation Mode ---
  navigationMode: NavigationMode = NavigationMode.Hierarchical;
  NavigationMode = NavigationMode;

  // --- UI ---
  searchQuery = '';
  isSearching = false;
  isLoading = false;
  showSearchResults = false;
  viewTitle = 'Catégories Baloise';
  currentLevel: Level = Level.Categories;

  // --- Filtres mode direct ---
  selectedCategoryLevel1: string | null = null;
  selectedCategoryLevel2: string | null = null;
  categoriesLevel1: BaloiseCategoryDto[] = [];
  categoriesLevel2: BaloiseCategoryDto[] = [];

  // --- Données ---
  breadcrumb: string[] = [];
  currentItems: any[] = [];
  searchResults: any[] = [];
  allSearchItems: any[] = [];
  processId?: string;
  allCategories: BaloiseCategoryDto[] = [];
  allReferentiels: any[] = [];

  selections: {
    category?: BaloiseCategoryDto;
    subcategory?: BaloiseCategoryDto;
    referentiel?: any;
  } = {};

  isDialog = false;

  // --- Injections ---
  private dialogRef = inject(MatDialogRef<SelectRiskEventComponent>, { optional: true });
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryService = inject(RiskCategoryService);
  private referentielService = inject(RiskReferentielService);
  private riskService = inject(RiskService);
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  ngOnInit(): void {
    this.mode = this.data?.mode ?? this.mode;
    this.processId = this.data?.processId;

    const cat1 = this.route.snapshot.queryParams["cat1"];
    const cat2 = this.route.snapshot.queryParams["cat2"];

    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        this.categoriesLevel1 = categories.filter(c => !c.parent);

        this.referentielService.getAll().subscribe({
          next: (refs) => {
            this.allReferentiels = refs;

            // Initialiser la vue selon le mode
            if (this.navigationMode === NavigationMode.Direct) {
              this.initDirectMode();
            } else {
              this.loadRootCategories();
            }

            this.loadSearchData();

            // 👉 Maintenant que tout est prêt, on peut auto-sélectionner
            if (cat1 && cat2) {
              this.autoSelectCategories(cat1, cat2);
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                  label: null,
                  cat1: null,
                  cat2: null
                },
                queryParamsHandling: 'merge',
                replaceUrl: true
              });

            }
          }
        });
      }
    });

    this.isDialog = this.dialogRef != undefined;
  }

  autoSelectCategories(cat1: string, cat2: string) {
    const category = this.allCategories.find(c => c.libelle === cat1);
    if (category) {
      this.selectCategory(category, cat2);
    }
  }


  // ---------- GESTION DES MODES ----------
  onNavigationModeChange(mode: NavigationMode): void {
    this.navigationMode = mode;
    this.clearFilters();
    this.clearSearch();

    if (mode === NavigationMode.Direct) {
      this.initDirectMode();
    } else {
      this.loadRootCategories();
    }
  }

  private initDirectMode(): void {
    this.currentLevel = Level.Referentiels;
    this.viewTitle = 'Taxonomies';
    this.breadcrumb = [];
    this.currentItems = [...this.allReferentiels];
  }

  // ---------- FILTRES MODE DIRECT ----------
  onCategoryLevel1Change(): void {
    this.selectedCategoryLevel2 = null;

    if (this.selectedCategoryLevel1) {
      const parent = this.allCategories.find(c => c.libelle === this.selectedCategoryLevel1);
      if (parent) {
        this.categoriesLevel2 = this.allCategories.filter(c => c.parent === parent.libelle);
      }
    } else {
      this.categoriesLevel2 = [];
    }

    this.applyFilters();
  }

  onCategoryLevel2Change(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.allReferentiels];

    if (this.selectedCategoryLevel2) {
      // Filtrer par catégorie niveau 2
      const cat2 = this.allCategories.find(c => c.libelle === this.selectedCategoryLevel2);
      if (cat2) {
        filtered = filtered.filter(ref => ref.category?.label === cat2.label);
      }
    } else if (this.selectedCategoryLevel1) {
      // Filtrer par catégorie niveau 1
      const cat1 = this.allCategories.find(c => c.libelle === this.selectedCategoryLevel1);
      if (cat1) {
        // Trouver toutes les sous-catégories
        const subCategories = this.allCategories.filter(c => c.parent === cat1.libelle);
        const subCategoryLabels = subCategories.map(c => c.label);

        filtered = filtered.filter(ref => subCategoryLabels.includes(ref.category?.label));
      }
    }

    this.currentItems = filtered;
  }

  private clearFilters(): void {
    this.selectedCategoryLevel1 = null;
    this.selectedCategoryLevel2 = null;
    this.categoriesLevel2 = [];
  }

  // ---------- RECHERCHE ----------
  onSearchInput(event: any): void {
    this.searchQuery = event.target.value.trim();
    if (this.searchQuery.length >= 2) this.performSearch();
    else this.clearSearch();
  }

  private loadSearchData(): void {
    let source$;
    switch (this.mode) {
      case RiskSelectionMode.CategoryLevel1:
      case RiskSelectionMode.CategoryLevel2:
        source$ = this.categoryService.getAll();
        break;
      case RiskSelectionMode.Taxonomie:
        source$ = this.referentielService.getAll();
        break;
      case RiskSelectionMode.Event:
        source$ = this.riskService.getAll(this.processId);
        break;
    }

    this.handleLoading(source$, (data: any[]) => {
      this.allSearchItems = data;
    });
  }

  performSearch(): void {
    this.isSearching = true;
    this.showSearchResults = true;
    const q = this.searchQuery.toLowerCase();

    setTimeout(() => {
      this.searchResults = this.allSearchItems.filter(item =>
        item.libelle?.toLowerCase().includes(q)
      );
      this.isSearching = false;
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.searchResults = [];
  }

  selectSearchResult(item: any): void {
    this.closeAndEmit(item);
  }

  // ---------- GESTION DES CHARGEMENTS ----------
  private handleLoading<T>(observable: any, onSuccess: (res: T) => void): void {
    this.isLoading = true;
    observable.subscribe({
      next: (res: T) => {
        onSuccess(res);
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  private updateView(level: Level, items: any[], title: string, breadcrumb: string[]): void {
    this.currentLevel = level;
    this.currentItems = items;
    this.viewTitle = title;
    this.breadcrumb = breadcrumb;
  }

  // ---------- HIÉRARCHIE ----------
  loadRootCategories(): void {
    const roots = this.allCategories.filter(c => !c.parent);
    this.updateView(Level.Categories, roots, 'Catégories Baloise (Niveau 1)', []);
    this.resetSelections();
  }

  selectCategory(category: BaloiseCategoryDto, autoSelectSub?: string): void {
    if (this.mode === RiskSelectionMode.CategoryLevel1)
      return this.closeAndEmit(category);

    this.selections.category = category;

    this.handleLoading(
      this.categoryService.getByParent(category.libelle),
      (subs: BaloiseCategoryDto[]) => {
        this.updateView(
          Level.Subcategories,
          subs,
          `Sous-catégories de ${this.format(category.libelle)}`,
          [this.format(category.libelle)]
        );

        // 👉 Auto-sélection de la sous-catégorie si précisé
        if (autoSelectSub) {
          const sub = subs.find(s => s.libelle === autoSelectSub);
          if (sub) {
            setTimeout(() => this.selectSubCategory(sub), 0);
          }
        }
      }
    );
  }


  selectSubCategory(sub: BaloiseCategoryDto): void {
    if (this.mode === RiskSelectionMode.CategoryLevel2)
      return this.closeAndEmit(sub);

    this.selections.subcategory = sub;
    const filtered = this.allReferentiels.filter(r => r.category.label === sub.label);
    this.updateView(
      Level.Referentiels,
      filtered,
      `Taxonomie : ${this.format(sub.libelle)}`,
      [this.format(this.selections.category?.libelle), this.format(sub.libelle)]
    );
  }

  selectReferentiel(ref: any): void {
    if (this.mode === RiskSelectionMode.Taxonomie)
      return this.closeAndEmit(ref);

    this.selections.referentiel = ref;
    this.handleLoading(this.riskService.getAll(), (risks: any[]) => {
      const events = risks.filter(e => e.riskReferentiel.id === ref.id);
      this.updateView(
        Level.Events,
        events,
        `Événements liés à ${ref.libelle}`,
        [
          this.format(this.selections.category?.libelle),
          this.format(this.selections.subcategory?.libelle),
          ref.libelle
        ].filter(Boolean)
      );
    });
  }

  addReferentiel() {
    this.router.navigate(['reglages', 'risks', 'create-referentiel'],
      {
        queryParams: {
          bal: this.selections.subcategory?.libelle,
          next: `reglages?label=Taxonmie&cat1=${this.selections.category?.libelle}&cat2=${this.selections.subcategory?.libelle}`
        }
      })
  }

  selectEvent(event: any): void {
    this.closeAndEmit(event);
  }

  // ---------- MÉTHODE POUR RÉCUPÉRER LES CATÉGORIES BALOISE ----------
  getBaloiseCategories(ref: any): string[] {
    if (!ref?.category) return [];

    const categories: string[] = [];

    // Ajouter la catégorie actuelle
    if (ref.category.label) {
      categories.push(this.format(ref.category.label));
    }

    // Retrouver le parent de la catégorie actuelle
    const currentCategory = this.allCategories.find(
      c => c.label === ref.category.label
    );

    if (currentCategory?.parent) {
      categories.unshift(this.format(currentCategory.parent));
    }

    return categories;
  }

  // ---------- NAVIGATION ----------
  back(): void {
    if (this.navigationMode === NavigationMode.Direct) {
      // En mode direct, on reste sur la liste des référentiels
      return;
    }

    switch (this.currentLevel) {
      case Level.Events:
        this.selections.referentiel = undefined;
        this.selectSubCategory(this.selections.subcategory!);
        break;
      case Level.Referentiels:
        this.selections.subcategory = undefined;
        this.selectCategory(this.selections.category!);
        break;
      case Level.Subcategories:
        this.loadRootCategories();
        break;
    }
  }

  // ---------- OUTILS ----------
  private closeAndEmit(item: any): void {
    this.selected.emit(item);
    if (this.dialogRef)
      this.dialogRef.close(item);
  }

  private resetSelections(): void {
    this.selections = {};
  }

  format(label?: string): string {
    return baloisFormatLabel(label ?? '');
  }

  get searchPlaceholder(): string {
    switch (this.mode) {
      case RiskSelectionMode.CategoryLevel1: return 'Rechercher une catégorie Baloise...';
      case RiskSelectionMode.CategoryLevel2: return 'Rechercher une sous-catégorie...';
      case RiskSelectionMode.Taxonomie: return 'Rechercher une taxonomie...';
      case RiskSelectionMode.Event: return 'Rechercher un événement de risque...';
      default: return 'Rechercher...';
    }
  }

  get searchTypeLabel(): string {
    switch (this.mode) {
      case RiskSelectionMode.CategoryLevel1: return 'Catégorie';
      case RiskSelectionMode.CategoryLevel2: return 'Sous-catégorie';
      case RiskSelectionMode.Taxonomie: return 'Taxonomie';
      case RiskSelectionMode.Event: return 'Événement';
      default: return 'Élément';
    }
  }

  // ---------- CRÉATION D'ÉVÉNEMENT ----------
  createNewEvent(): void {
    const queryParams: any = {
      redirect: this.router.url,
      riskReferentielId: this.selections.referentiel?.id,
    };
    if (this.processId) queryParams.processId = this.processId;
    if (this.searchQuery?.trim()) queryParams.libelle = this.searchQuery.trim();

    if (this.dialogRef)
      this.dialogRef.close();
    this.router.navigate(['reglages', 'risks', 'create'], { queryParams });
  }

  get shouldShowCreateButton(): boolean {
    return this.mode === RiskSelectionMode.Event &&
      (
        (!this.isSearching && this.showSearchResults && this.searchResults.length === 0)
        || (this.currentLevel === Level.Events)
      );
  }

  get canGoBack(): boolean {
    if (this.navigationMode === NavigationMode.Direct) {
      return false;
    }
    return this.currentLevel !== Level.Categories;
  }
}