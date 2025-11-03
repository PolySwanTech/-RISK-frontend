import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { forkJoin } from 'rxjs';

import { AttenuationMetricsService } from '../../../core/services/dmr/attenuationMetrics/attenuation-metrics.service';
import { AttenuationMetrics, AttenuationMetricsTypeDto } from '../../../core/models/AttenuationMetrics';
import { EvaluationControl } from '../../../core/enum/evaluation-controle.enum';
import { CreateAttenuationMetricsComponent } from '../create-attenuation-metrics/create-attenuation-metrics.component';
import { TargetType } from '../../../core/enum/targettype.enum';
import { FileService } from '../../../core/services/file/file.service';
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-attenuation-metrics-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    GoBackComponent,
    MatAccordion,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatExpansionPanel,
    EnumLabelPipe
],
  templateUrl: './attenuation-metrics-list.component.html',
  styleUrls: ['./attenuation-metrics-list.component.scss']
})
export class AttenuationMetricsListComponent implements OnInit {

  private service = inject(AttenuationMetricsService);
  private dialog = inject(MatDialog);
  private fileService = inject(FileService);

  metrics: AttenuationMetrics[] = [];
  filteredMetrics: AttenuationMetrics[] = [];
  paginatedMetrics: AttenuationMetrics[] = [];
  groupedCategories: {
    parent: AttenuationMetricsTypeDto,
    children: { type: AttenuationMetricsTypeDto, count: number }[]
  }[] = [];

  selectedCategories = signal<string[]>([]);
  evaluationKeys = Object.values(EvaluationControl);
  goBackButtons: GoBackButton[] = [];

  // Recherche
  searchText: string = '';

  // Pagination
  pageSize: number = 10;
  pageIndex: number = 0;

  ngOnInit(): void {
    this.buildCategoryTree();
    this.loadMetrics();
    this.goBackButtons = [
      { 
        label: 'Ajouter une mesure', 
        icon: 'add', 
        class: 'btn-primary', 
        show: true, 
        action: () => this.openCreateDialog() 
      }
    ];
  }

  loadMetrics(): void {
    this.service.getAll().subscribe(data => {
      this.metrics = data;
      this.applySearchAndFilter();
    });
  }

  private buildCategoryTree(): void {
    forkJoin({
      types: this.service.getAllType(),
      metrics: this.service.getAll()
    }).subscribe(({ types, metrics }) => {
      this.metrics = metrics;

      const parents = types.filter(t => !t.parentCode);
      const childrenByParent = types.reduce<Record<string, AttenuationMetricsTypeDto[]>>((acc, t) => {
        if (t.parentCode) (acc[t.parentCode] ??= []).push(t);
        return acc;
      }, {});

      this.groupedCategories = parents.map(parent => {
        const children = childrenByParent[parent.code] ?? [];
        const enrichedChildren = children.map(child => ({
          type: child,
          count: metrics.filter(m => m.type?.code === child.code).length
        }));

        if (enrichedChildren.length === 0) {
          enrichedChildren.push({
            type: { 
              code: `${parent.code}_VIDE`, 
              label: 'Aucune sous-catégorie', 
              definition: null, 
              parentCode: parent.code 
            },
            count: 0
          });
        }

        return { parent, children: enrichedChildren };
      });

      this.groupedCategories.sort((a, b) => a.parent.label.localeCompare(b.parent.label));
    });
  }

  // Recherche et filtre
  applySearchAndFilter(): void {
    const selected = this.selectedCategories();
    let result = [...this.metrics];

    // Filtre par catégorie
    if (selected.length > 0) {
      result = result.filter(m => 
        selected.includes(m.type?.parentCode || '') || selected.includes(m.type?.code || '')
      );
    }

    // Filtre par recherche
    if (this.searchText && this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      result = result.filter(m => 
        m.reference?.toLowerCase().includes(searchLower) ||
        m.libelle?.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower) ||
        m.type?.label?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredMetrics = result;
    this.pageIndex = 0; // Reset à la première page
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applySearchAndFilter();
  }

  resetFilters(): void {
    this.selectedCategories.set([]);
    this.applySearchAndFilter();
  }

  // Pagination
  updatePagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedMetrics = this.filteredMetrics.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagination();
  }

  // Catégories
  toggleCategory(code: string): void {
    const selected = this.selectedCategories();
    this.selectedCategories.set(
      selected.includes(code)
        ? selected.filter(c => c !== code)
        : [...selected, code]
    );
    this.applySearchAndFilter();
  }

  getCountForParent(code: string): number {
    return this.metrics.filter(m => 
      m.type?.parentCode === code || m.type?.code === code
    ).length;
  }

  getParentIcon(code: string): string {
    switch (code) {
      case 'FORMATION': return 'menu_book';
      case 'PROCEDURE': return 'settings_suggest';
      case 'TECHNOLOGIE': return 'memory';
      case 'ORGANISATION': return 'group';
      case 'AUTRE': return 'help_outline';
      default: return 'category';
    }
  }

  // Évaluation
  onEvaluationSelect(metric: AttenuationMetrics, value: EvaluationControl): void {
    this.service.updateEvaluation(metric.id, value).subscribe({
      next: () => {
        metric.evaluation = value;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de l\'évaluation', err);
      }
    });
  }

  // Activation
  toggleActivation(metric: AttenuationMetrics, active: boolean): void {
    metric.actif = active;
    this.service.updateStatus(metric.id, active).subscribe({
      next: () => console.log(`Mesure ${metric.id} ${active ? 'activée' : 'désactivée'}`),
      error: err => console.error('Erreur lors du changement d\'état :', err)
    });
  }

  // Fichiers
  openFilesDialog(metricsId: string): void {
    this.fileService.openFiles([], TargetType.ATTENUATION_METRICS, metricsId, false);
  }

  // Création
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateAttenuationMetricsComponent, {
       width: '800px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        panelClass: 'custom-dialog-container', // Classe CSS personnalisée
        disableClose: false,
        autoFocus: false
    });
    dialogRef.afterClosed().subscribe(refresh => {
      if (refresh) this.loadMetrics();
    });
  }

  // Utilitaires
  trackByCode(index: number, item: { parent: AttenuationMetricsTypeDto }): string {
    return item.parent.code;
  }
}