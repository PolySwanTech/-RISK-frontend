import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Incident } from '../../../core/models/Incident';
import { IncidentFilterService } from '../../../core/services/incident-filter/incident-filter.service';
import { RiskCategoryService } from '../../../core/services/risk/risk-category.service';
import { BaloiseCategoryDto } from '../../../core/models/RiskReferentiel';

type DrillLevel = 'parent' | 'child';

interface SelectedParent {
  libelle: string;
  label: string;
}

@Component({
  selector: 'app-baloise-category-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule],
  templateUrl: './baloise-category-chart.component.html',
  styleUrls: ['./baloise-category-chart.component.scss']
})
export class BaloiseCategoryChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() incidents: Incident[] = [];

  drillLevel: DrillLevel = 'parent';
  selectedParent: SelectedParent | null = null;

  data: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Nombre d’incidents' }
      },
      y: {
        title: { display: true, text: 'Catégories' }
      }
    }
  };

  private sub!: Subscription;
  private allParentCategories: BaloiseCategoryDto[] = [];
  private allChildCategories: BaloiseCategoryDto[] = [];

  constructor(
    private filterService: IncidentFilterService,
    private riskCategoryService: RiskCategoryService
  ) {}

  // ✅ Charger les catégories de niveau 1 au démarrage
  ngOnInit() {
    this.riskCategoryService.getAll().subscribe(allCats => {
      this.allParentCategories = allCats.filter(c => !c.parent);

      // 🔹 Si on a déjà des incidents au moment du chargement, on affiche
      if (this.incidents?.length) {
        this.buildChart(this.incidents);
      }

      // 🔹 Écoute des filtres (pour mise à jour dynamique)
      this.sub = this.filterService.filteredIncidents$.subscribe(filtered => {
        this.buildChart(filtered && filtered.length > 0 ? filtered : this.incidents);
      });
    });
  }

  // ✅ Réagit si les incidents changent (arrivent après coup)
  ngOnChanges(changes: SimpleChanges) {
    if (changes['incidents'] && this.incidents?.length && this.allParentCategories?.length) {
      this.buildChart(this.incidents);
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  // 🔧 Construction du graphique
  private buildChart(source: Incident[]) {
    const counts: Record<string, number> = {};

    if (this.drillLevel === 'parent') {
      this.allParentCategories.forEach(cat => {
        const total = source.filter(
          inc => inc.categoryBaloise?.parent === cat.libelle
        ).length;
        counts[cat.label || 'Non catégorisé'] = total;
      });
    } else if (this.drillLevel === 'child' && this.selectedParent) {
      this.allChildCategories.forEach(subCat => {
        const total = source.filter(
          inc => inc.categoryBaloise?.libelle === subCat.libelle
        ).length;
        counts[subCat.label || 'Non catégorisé'] = total;
      });
    }

    const labels =
      this.drillLevel === 'parent'
        ? this.allParentCategories.map(c => c.label || 'Non catégorisé')
        : this.allChildCategories.map(c => c.label || 'Non catégorisé');

    const dataValues = labels.map(label => counts[label] || 0);

    this.data = {
      labels,
      datasets: [
        {
          label: 'Incidents',
          data: dataValues,
          backgroundColor: labels.map(l => (counts[l] ? '#42A5F5' : '#E0E0E0'))
        }
      ]
    };
  }

  // 🔍 Drilldown dynamique
  onChartClick(event: any) {
    if (!event.active?.length) return;
    const index = event.active[0].index;
    const clickedLabel = this.data.labels?.[index] as string;

    const parentCat = this.allParentCategories.find(c => c.label === clickedLabel);
    if (!parentCat) return;

    this.selectedParent = {
      libelle: parentCat.libelle,
      label: parentCat.label
    };

    this.drillLevel = 'child';

    this.riskCategoryService.getByParent(parentCat.libelle).subscribe(subCats => {
      this.allChildCategories = subCats;
      this.buildChart(this.incidents);
    });

    this.filterService.setFilter('category', (inc: Incident) =>
      inc.categoryBaloise?.parent === parentCat.libelle
    );
  }

  // ⏪ Retour au niveau parent
  goBack() {
    if (this.drillLevel === 'child') {
      this.drillLevel = 'parent';
      this.selectedParent = null;
      this.allChildCategories = [];
      this.filterService.clearFilter('category');

      this.riskCategoryService.getAll().subscribe(allCats => {
        this.allParentCategories = allCats.filter(c => !c.parent);
        this.buildChart(this.incidents);
      });
    }
  }
}
