import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RiskCategoryService } from '../../../core/services/risk/risk-category.service';
import { RiskReferentielService } from '../../../core/services/risk/risk-referentiel.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { BaloiseCategoryDto, baloisFormatLabel } from '../../../core/models/RiskReferentiel';
import { Level, RiskSelectionMode } from '../../../core/enum/riskSelection.enum';

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
    MatTooltipModule
  ],
  templateUrl: './select-risk-event.component.html',
  styleUrls: ['./select-risk-event.component.scss']
})
export class SelectRiskEventComponent implements OnInit {

  @Input() mode: RiskSelectionMode = RiskSelectionMode.Event;
  @Output() selected = new EventEmitter<any>();

  // --- UI ---
  searchQuery = '';
  isSearching = false;
  isLoading = false;
  showSearchResults = false;
  viewTitle = 'Catégories Baloise';
  currentLevel: Level = Level.Categories;

  // --- Données ---
  breadcrumb: string[] = [];
  currentItems: any[] = [];
  searchResults: any[] = [];
  allSearchItems: any[] = [];
  processId?: string;

  selections: {
    category?: BaloiseCategoryDto;
    subcategory?: BaloiseCategoryDto;
    referentiel?: any;
  } = {};

  // --- Injections ---
  private dialogRef = inject(MatDialogRef<SelectRiskEventComponent>);
  private router = inject(Router);
  private categoryService = inject(RiskCategoryService);
  private referentielService = inject(RiskReferentielService);
  private riskService = inject(RiskService);
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  ngOnInit(): void {
    this.mode = this.data?.mode ?? this.mode;
    this.processId = this.data?.processId;
    this.loadRootCategories();
    this.loadSearchData();

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
    this.handleLoading(this.categoryService.getAll(), (categories: BaloiseCategoryDto[]) => {
      const roots = categories.filter(c => !c.parent);
      this.updateView(Level.Categories, roots, 'Catégories Baloise (Niveau 1)', []);
      this.resetSelections();
    });
  }

  selectCategory(category: BaloiseCategoryDto): void {
    if (this.mode === RiskSelectionMode.CategoryLevel1)
      return this.closeAndEmit(category);

    this.selections.category = category;
    this.handleLoading(this.categoryService.getByParent(category.libelle), (subs: BaloiseCategoryDto[]) => {
      this.updateView(
        Level.Subcategories,
        subs,
        `Sous-catégories de ${this.format(category.libelle)}`,
        [this.format(category.libelle)]
      );
    });
  }

  selectSubCategory(sub: BaloiseCategoryDto): void {
    if (this.mode === RiskSelectionMode.CategoryLevel2)
      return this.closeAndEmit(sub);

    this.selections.subcategory = sub;
    this.handleLoading(this.referentielService.getAll(), (refs: any[]) => {
      const filtered = refs.filter(r => r.category.label === sub.label);
      this.updateView(
        Level.Referentiels,
        filtered,
        `Taxonomie : ${this.format(sub.libelle)}`,
        [this.format(this.selections.category?.libelle), this.format(sub.libelle)]
      );
    });
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

  selectEvent(event: any): void {
    this.closeAndEmit(event);
  }

  // ---------- NAVIGATION ----------
  back(): void {
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

  // ---------- CRÉATION D’ÉVÉNEMENT ----------
  createNewEvent(): void {
    const queryParams: any = {
      redirect: this.router.url,
      riskReferentielId: this.selections.referentiel?.id,
    };
    if (this.processId) queryParams.processId = this.processId;
    if (this.searchQuery?.trim()) queryParams.libelle = this.searchQuery.trim();

    this.dialogRef.close();
    this.router.navigate(['reglages', 'risks', 'create'], { queryParams });
  }

  /** Affiche le bouton de création si :
   *  - on est en mode Event
   *  - ET soit aucun résultat de recherche
   *  - soit on a sélectionné un référentiel sans événement
   */
  get shouldShowCreateButton(): boolean {
    return this.mode === RiskSelectionMode.Event &&
      (
        (!this.isSearching && this.showSearchResults && this.searchResults.length === 0)
        || (this.currentLevel === Level.Events)
      );
  }
}
