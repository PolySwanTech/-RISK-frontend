import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ChartConfiguration, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Incident } from '../../../core/models/Incident';

@Component({
  selector: 'app-incidents-trend-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgChartsModule],
  templateUrl: './incidents-trend-chart.component.html',
  styleUrls: ['./incidents-trend-chart.component.scss']
})
export class IncidentsTrendChartComponent implements OnChanges {

  @Input() incidents: Incident[] = [];

  lineChartData!: ChartData<'line'>;
  lineChartOptions!: ChartConfiguration['options'];
  trendText: string = '';
  trendValue: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['incidents'] && this.incidents?.length > 0) {
      this.generateChartData();
    }
  }

  private generateChartData() {
    // 🧮 Regrouper les incidents par trimestre
    const grouped = this.groupByQuarter(this.incidents);

    const labels = Object.keys(grouped).sort(); // Ex: ["Q1 2024", "Q2 2024", ...]
    const totalIncidents = labels.map(label => grouped[label].total);
    const resolvedIncidents = labels.map(label => grouped[label].resolved);

    // 📊 Config Chart.js
    this.lineChartData = {
      labels,
      datasets: [
        {
          label: 'Total incidents',
          data: totalIncidents,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.2)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 4,
        },
        {
          label: 'Incidents résolus',
          data: resolvedIncidents,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.2)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 4,
        }
      ]
    };

    this.lineChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 20, boxHeight: 12 }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: false, grid: { color: '#f0f0f0' } }
      }
    };

    // 📈 Calculer la tendance (%)
    const last = totalIncidents.at(-1)!;
    const previous = totalIncidents.at(-2)!;
    this.trendValue = previous ? Math.round(((last - previous) / previous) * 100) : 0;
    this.trendText = `${this.trendValue >= 0 ? '+' : ''}${this.trendValue}% vs trimestre précédent`;
  }

  private groupByQuarter(incidents: Incident[]): Record<string, { total: number; resolved: number }> {
    const result: Record<string, { total: number; resolved: number }> = {};

    for (const inc of incidents) {
      const date = new Date(inc.declaredAt ?? inc.survenueAt);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const key = `Q${quarter} ${year}`;

      if (!result[key]) {
        result[key] = { total: 0, resolved: 0 };
      }

      result[key].total += 1;
      if (inc.closedAt) {
        result[key].resolved += 1;
      }
    }

    return result;
  }
}
