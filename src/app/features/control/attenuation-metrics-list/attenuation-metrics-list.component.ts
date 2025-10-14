import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { AttenuationMetricsService } from '../../../core/services/attenuationMetrics/attenuation-metrics.service';
import { AttenuationMetrics } from '../../../core/models/AttenuationMetrics';
import { EvaluationControl, EvaluationControlLabels } from '../../../core/enum/evaluation-controle.enum';
import { CreateAttenuationMetricsComponent } from '../create-attenuation-metrics/create-attenuation-metrics.component';
import { AttenuationMetricsTypeDto } from '../../../core/models/AttenuationMetrics';
import { TargetType } from '../../../core/enum/targettype.enum';
import { FileService } from '../../../core/services/file/file.service';
import { MatSelectModule } from "@angular/material/select";
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";




@Component({
  selector: 'app-attenuation-metrics-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    GoBackComponent,
    MatSlideToggleModule
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
  groupedCategories: {
    parent: AttenuationMetricsTypeDto,
    children: { type: AttenuationMetricsTypeDto, count: number }[]
  }[] = [];

  selectedCategories = signal<string[]>([]);
  displayedColumns = ['libelle', 'type', 'creatorName', 'createdAt', 'evaluation', 'attachments', 'active'];
  attachedCounts: any;
  evaluationKeys = Object.values(EvaluationControl);
  goBackButtons : GoBackButton[] = []



  ngOnInit(): void {
    this.buildCategoryTree();
    this.loadMetrics();
    this.goBackButtons = [{ label: 'Ajouter une mesure', icon: 'add', class: 'btn-primary', show: true, action: () => this.openCreateDialog() }];
  }

  loadMetrics(): void {
    this.service.getAll().subscribe(data => {
      this.metrics = data;
      this.applyFilter();
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

        const totalCount = metrics.filter(
          m => m.type?.parentCode === parent.code || m.type?.code === parent.code
        ).length;

        if (enrichedChildren.length === 0) {
          enrichedChildren.push({
            type: { code: `${parent.code}_VIDE`, label: 'Aucune sous-catégorie', definition: null, parentCode: parent.code },
            count: 0
          });
        }

        return { parent, totalCount, children: enrichedChildren };
      });

      this.groupedCategories.sort((a, b) => a.parent.label.localeCompare(b.parent.label));
    });
  }

  /** Bouton pour uploader un fichier */
  openFilesDialog(metricsId: string) {
    console.log('Ouvrir le dialog de fichiers pour la mesure d\'atténuation', metricsId);
    const ref = this.fileService.openFiles([], TargetType.ATTENUATION_METRICS, metricsId, false);
  }

  onEvaluationSelect(metric: AttenuationMetrics, value: EvaluationControl): void {
    this.service.updateEvaluation(metric.id, value).subscribe({
      next: () => {
        metric.evaluation = value;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de l’évaluation', err);
      }
    });
  }


  getEvaluationLabel(e?: string): string {
    return e ? EvaluationControlLabels[e as keyof typeof EvaluationControlLabels] : '-';
  }

  getEvaluationColor(e?: EvaluationControl): string {
    switch (e) {
      case EvaluationControl.CONFORME:
        return 'green';
      case EvaluationControl.PARTIELLEMENT_CONFORME:
        return 'orange';
      case EvaluationControl.NON_CONFORME:
        return 'red';
      default:
        return 'grey';
    }
  }

  /** Divers */
  delete(metric: AttenuationMetrics): void {
    if (confirm(`Supprimer "${metric.libelle}" ?`)) {
      this.service.delete(metric.id).subscribe(() => this.loadMetrics());
    }
  }

  applyFilter(): void {
    const selected = this.selectedCategories();
    this.filteredMetrics = selected.length === 0
      ? [...this.metrics]
      : this.metrics.filter(m => selected.includes(m.type?.parentCode || m.type?.code));
  }

  toggleCategory(code: string): void {
    const selected = this.selectedCategories();
    this.selectedCategories.set(
      selected.includes(code)
        ? selected.filter(c => c !== code)
        : [...selected, code]
    );
    this.applyFilter();
  }

  toggleActivation(metric: any, active: boolean): void {
    metric.active = active;
    // Appel API ou logique de persistance ici :
    this.service.updateStatus(metric.id, active).subscribe({
      next: () => console.log(`Mesure ${metric.id} ${active ? 'activée' : 'désactivée'}`),
      error: err => console.error('Erreur lors du changement d’état :', err)
    });
  }


  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateAttenuationMetricsComponent, {
      width: '700px',
      maxHeight: '90vh'
    });
    dialogRef.afterClosed().subscribe(refresh => {
      if (refresh) this.loadMetrics();
    });
  }

  trackByCode(index: number, item: { parent: AttenuationMetricsTypeDto }): string {
    return item.parent.code;
  }

  getCountForParent(code: string): number {
    return this.metrics.filter(m => m.type?.parentCode === code || m.type?.code === code).length;
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

}
