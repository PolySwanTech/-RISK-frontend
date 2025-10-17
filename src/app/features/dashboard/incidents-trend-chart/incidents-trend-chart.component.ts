import { Component, Input, OnChanges, OnInit, SimpleChanges  } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Incident } from '../../../core/models/Incident';
import { State } from '../../../core/enum/state.enum';

@Component({
  selector: 'app-incidents-trend-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './incidents-trend-chart.component.html',
  styleUrls: ['./incidents-trend-chart.component.scss']
})
export class IncidentsTrendChartComponent implements OnInit, OnChanges {
  @Input() incidents: Incident[] = [];
  
  trendText: string = '';
  trendValue: number = 0;


  chartData: ChartData<'line'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    },
    scales: {
      x: { title: { display: true, text: 'Période' } },
      y: { title: { display: true, text: 'Nombre d’incidents' }, beginAtZero: true }
    }
  };

  granularities = [
    { label: 'ANNÉE', value: 'year' },
    { label: 'TRIMESTRE', value: 'quarter' },
    { label: 'MOIS', value: 'month' },
    { label: 'SEMAINE', value: 'week' },
    { label: 'JOUR', value: 'day' }
  ];

  granularity: 'year' | 'quarter' | 'month' | 'week' | 'day' = 'year';
  zoomLabel: string | null = null;
  zoomRange: { start: Date; end: Date } | null = null;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['incidents'] && this.incidents?.length) {
      this.buildChart();
    }
  }

  /** 🔧 Calcule les labels et datasets selon la granularité */
  private buildChart() {
    if (!this.incidents.length) return;

    let source = this.incidents;

    if (this.zoomRange) {
      source = source.filter(inc => {
        const d = new Date(inc.declaredAt);
        return d >= this.zoomRange!.start && d < this.zoomRange!.end;
      });
    }


    // Grouper les incidents selon la granularité sélectionnée
    const grouped = new Map<string, { total: number; resolved: number }>();

    for (const inc of this.incidents) {
      const date = new Date(inc.declaredAt);
      const key = this.formatDateKey(date, this.granularity);

      if (!grouped.has(key)) grouped.set(key, { total: 0, resolved: 0 });

      const current = grouped.get(key)!;
      current.total++;
      if (inc.state === State.CLOSED) current.resolved++;
    }

    const labels = this.sortKeysChronologically(Array.from(grouped.keys()), this.granularity);
    const totals = labels.map(k => grouped.get(k)!.total);
    const resolved = labels.map(k => grouped.get(k)!.resolved);

        // Calcul de la tendance (différence % entre les 2 dernières périodes)
    if (totals.length >= 2) {
      const last = totals.at(-1)!;
      const previous = totals.at(-2)!;

      this.trendValue = previous > 0 ? Math.round(((last - previous) / previous) * 100) : 0;
    } else {
      this.trendValue = 0;
    }

    // Texte de tendance dynamique selon la granularité
    const granularityLabelMap: Record<string, string> = {
      year: "année précédente",
      quarter: "trimestre précédent",
      month: "mois précédent",
      week: "semaine précédente",
      day: "jour précédent"
    };

    this.trendText = `${this.trendValue >= 0 ? '+' : ''}${this.trendValue}% vs ${granularityLabelMap[this.granularity]}`;


    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Total incidents',
          data: totals,
          borderColor: '#EF5350',
          backgroundColor: 'rgba(239,83,80,0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: 'Incidents résolus',
          data: resolved,
          borderColor: '#66BB6A',
          backgroundColor: 'rgba(102,187,106,0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  }

  private sortKeysChronologically(keys: string[], granularity: string): string[] {
    const parseKey = (key: string): number => {
      switch (granularity) {
        case 'year':
          return parseInt(key);
        case 'quarter': {
          const match = key.match(/T(\d)\s(\d{4})/);
          if (!match) return 0;
          const [_, q, y] = match;
          return parseInt(y) * 10 + parseInt(q);
        }
        case 'month': {
          const [m, y] = key.split('/');
          return parseInt(y) * 100 + parseInt(m);
        }
        case 'week': {
          const match = key.match(/Sem\s(\d+)\/(\d{4})/);
          if (!match) return 0;
          const [_, w, y] = match;
          return parseInt(y) * 100 + parseInt(w);
        }
        case 'day': {
          const [day, month, year] = key.split('/');
          return parseInt(year) * 10000 + parseInt(month) * 100 + parseInt(day);
        }
        default:
          return 0;
      }
    };

    return keys.sort((a, b) => parseKey(a) - parseKey(b));
  }


  /** 🧭 Formatte la date selon la granularité */
  private formatDateKey(date: Date, granularity: string): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const week = this.getWeekNumber(date);
    switch (granularity) {
      case 'year': return `${year}`;
      case 'quarter': return `T${Math.ceil(month / 3)} ${year}`;
      case 'month': return `${month.toString().padStart(2, '0')}/${year}`;
      case 'week': return `Sem ${week}/${year}`;
      case 'day': return `${date.toLocaleDateString('fr-FR')}`;
      default: return `${month}/${year}`;
    }
  }

  private getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

  /** 🔄 Changer de granularité */
  changeGranularity(g: any) {
    this.granularity = g;
    this.buildChart();
  }

  /** 🔍 Zoom sur un point cliqué */
  onChartClick(event: any) {
    if (!event.active?.length) return;
    const index = event.active[0].index;
    const clickedPeriod = this.chartData.labels?.[index] as string;

    // Sauvegarde du zoom
    this.zoomLabel = clickedPeriod;

    // Déterminer la granularité suivante
    const nextGranularityMap: Record<string, string | null> = {
      year: 'quarter',
      quarter: 'month',
      month: 'week',
      week: 'day',
      day: null
    };

    const nextGranularity = nextGranularityMap[this.granularity];
    if (!nextGranularity) return; // déjà au plus fin

    // Définir la période de zoom
    this.zoomRange = this.computeZoomRange(clickedPeriod, this.granularity);

    // Appliquer le zoom
    this.granularity = nextGranularity as any;
    this.buildChart();
  }

  private computeZoomRange(label: string, granularity: string): { start: Date; end: Date } {
    const range = { start: new Date(), end: new Date() };

    switch (granularity) {
      case 'year': {
        const year = parseInt(label);
        range.start = new Date(year, 0, 1);
        range.end = new Date(year + 1, 0, 1);
        break;
      }
      case 'quarter': {
        const match = label.match(/T(\d)\s(\d{4})/);
        if (match) {
          const [_, q, y] = match;
          const quarter = parseInt(q);
          const year = parseInt(y);
          range.start = new Date(year, (quarter - 1) * 3, 1);
          range.end = new Date(year, quarter * 3, 1);
        }
        break;
      }
      case 'month': {
        const [m, y] = label.split('/');
        range.start = new Date(parseInt(y), parseInt(m) - 1, 1);
        range.end = new Date(parseInt(y), parseInt(m), 1);
        break;
      }
      case 'week': {
        const match = label.match(/Sem\s(\d+)\/(\d{4})/);
        if (match) {
          const [_, w, y] = match;
          const year = parseInt(y);
          const week = parseInt(w);
          const start = new Date(year, 0, 1 + (week - 1) * 7);
          range.start = start;
          range.end = new Date(start);
          range.end.setDate(start.getDate() + 7);
        }
        break;
      }
    }

    return range;
  }



  /** ⏪ Réinitialiser le zoom */
  resetZoom() {
    this.zoomLabel = null;
    this.zoomRange = null;
    this.buildChart();
  }
}
