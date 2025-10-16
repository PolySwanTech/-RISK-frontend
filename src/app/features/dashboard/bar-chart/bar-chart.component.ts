import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { Incident } from '../../../core/models/Incident';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { IncidentFilterService } from '../../../core/services/incident-filter/incident-filter.service';

type DrillLevel = 'year' | 'quarter' | 'month';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [NgChartsModule, CommonModule, MatCardModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, OnDestroy {
  @Input() incidents: Incident[] = [];

  drillLevel: DrillLevel = 'year';
  selectedYear: number | null = null;
  selectedQuarter: number | null = null;

  data: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions = { responsive: true };

  private sub!: Subscription;

  constructor(private filterService: IncidentFilterService) {}

  ngOnInit(): void {
    // initialise les incidents globaux dans le service
    this.filterService.setIncidents(this.incidents);

    // écoute les incidents filtrés cumulés
    this.sub = this.filterService.filteredIncidents$.subscribe(filtered => {
      this.buildChart(filtered);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /** Vérifie si un incident correspond au drill courant */
  private matchesDrill(date: Date): boolean {
    if (this.drillLevel === 'year') return true;
    if (this.drillLevel === 'quarter') return date.getFullYear() === this.selectedYear;
    if (this.drillLevel === 'month') {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return date.getFullYear() === this.selectedYear && quarter === this.selectedQuarter;
    }
    return true;
  }

  /** Reconstruit les données du chart */
  private buildChart(source: Incident[]) {
    const counts: Record<string, { count: number; sortKey: number }> = {};

    source.forEach(inc => {
      const date = new Date(inc.declaredAt);
      if (!this.matchesDrill(date)) return;

      let label = '';
      let sortKey = 0;

      if (this.drillLevel === 'year') {
        label = `${date.getFullYear()}`;
        sortKey = date.getFullYear();
      } else if (this.drillLevel === 'quarter') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        label = `T${quarter} ${date.getFullYear()}`;
        sortKey = date.getFullYear() * 10 + quarter;
      } else if (this.drillLevel === 'month') {
        label = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
        sortKey = date.getFullYear() * 100 + date.getMonth();
      }

      if (label) {
        if (!counts[label]) counts[label] = { count: 0, sortKey };
        counts[label].count++;
      }
    });

    const sorted = Object.entries(counts).sort((a, b) => a[1].sortKey - b[1].sortKey);

    this.data = {
      labels: sorted.map(([label]) => label),
      datasets: [
        {
          label: 'Incidents',
          data: sorted.map(([_, val]) => val.count),
          backgroundColor: '#42A5F5'
        }
      ]
    };
  }

  /** Clique sur une barre → descente dans le drill */
  onChartClick(event: any) {
    if (!event.active?.length) return;
    const index = event.active[0].index;
    const label = this.data.labels?.[index] as string;

    if (this.drillLevel === 'year') {
      this.selectedYear = parseInt(label, 10);
      this.drillLevel = 'quarter';
    } else if (this.drillLevel === 'quarter') {
      const match = label.match(/T(\d) (\d{4})/);
      if (match) {
        this.selectedQuarter = parseInt(match[1], 10);
        this.selectedYear = parseInt(match[2], 10);
        this.drillLevel = 'month';
      }
    }

    this.refresh();
  }

  /** Retour au niveau précédent */
  goBack() {
    if (this.drillLevel === 'month') {
      this.drillLevel = 'quarter';
      this.selectedQuarter = null;
    } else if (this.drillLevel === 'quarter') {
      this.drillLevel = 'year';
      this.selectedYear = null;
    }

    this.refresh();
    this.filterService.clearFilter('time'); // supprime seulement le filtre "temps"
  }

  /** Reconstruit le chart + applique le filtre global */
  private refresh() {
    const filteredFn = (inc: Incident) => this.matchesDrill(new Date(inc.declaredAt));
    this.filterService.setFilter('time', filteredFn);
  }

  /** Texte dynamique pour le sous-titre */
  period(p: DrillLevel): string {
    if (p === 'year') return 'Année';
    if (p === 'quarter') return `Trimestre ${this.selectedYear ? ' - ' + this.selectedYear : ''}`;
    if (p === 'month')
      return `Mois ${this.selectedYear ? ' - ' + this.selectedYear : ''}${
        this.selectedQuarter ? ' T' + this.selectedQuarter : ''
      }`;
    return '';
  }
}
