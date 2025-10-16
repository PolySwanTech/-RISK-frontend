import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { Incident } from '../../../core/models/Incident';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IncidentFilterService } from '../../../core/services/incident-filter/incident-filter.service';

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
export class BaloiseCategoryChartComponent implements OnInit, OnDestroy {
  @Input() incidents: Incident[] = [];

  drillLevel: DrillLevel = 'parent';
  selectedParent: SelectedParent | null = null;

  data: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false };
  private sub!: Subscription;

  constructor(private filterService: IncidentFilterService) {}

  ngOnInit() {
    this.sub = this.filterService.filteredIncidents$.subscribe(filtered => {
      this.buildChart(filtered || this.incidents);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private buildChart(source: Incident[]) {
    const counts: Record<string, number> = {};

    source.forEach(inc => {
      const parent = inc.categoryBaloise?.parent || null;
      const libelle = inc.categoryBaloise?.libelle || null;
      const label = inc.categoryBaloise?.label || null;

      let key = '';

      if (this.drillLevel === 'parent') {
        if (!parent && label) key = label;
        if (!parent && !label) key = 'Non catégorisé';
      } else if (this.drillLevel === 'child' && this.selectedParent) {
        if (parent === this.selectedParent.libelle) key = label || 'Non catégorisé';
      }

      if (key) counts[key] = (counts[key] || 0) + 1;
    });

    this.data = {
      labels: Object.keys(counts),
      datasets: [{ label: 'Incidents', data: Object.values(counts), backgroundColor: '#42A5F5' }]
    };
  }

  onChartClick(event: any) {
    if (!event.active?.length) return;
    const index = event.active[0].index;
    const clickedLabel = this.data.labels?.[index] as string;

    const incident = this.incidents.find(
      inc => !inc.categoryBaloise?.parent && inc.categoryBaloise?.label === clickedLabel
    );

    if (this.drillLevel === 'parent' && incident) {
      this.selectedParent = {
        libelle: incident.categoryBaloise!.libelle,
        label: incident.categoryBaloise!.label
      };
      this.drillLevel = 'child';
      this.buildChart(this.incidents);
      this.filterService.setFilter('category', (inc: Incident) =>
        inc.categoryBaloise?.parent === this.selectedParent!.libelle
      );
    }
  }

  goBack() {
    if (this.drillLevel === 'child') {
      this.drillLevel = 'parent';
      this.selectedParent = null;
      this.buildChart(this.incidents);
      this.filterService.clearFilter('category');
    }
  }
}
