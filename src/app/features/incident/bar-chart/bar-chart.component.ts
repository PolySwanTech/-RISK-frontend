import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Incident } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnChanges {
  @Input() incidents: Incident[] = [];

  barChartType: ChartType = 'bar';
 barChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Nombre d’incidents'
      },
      ticks: {
        precision: 0, // évite les virgules
        callback: (value) => value.toString()
      }
    },
    x: {
      title: {
        display: true,
        text: 'Trimestre'
      }
    }
  }
};

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['T1', 'T2', 'T3', 'T4'],
    datasets: [{
      data: [0, 0, 0, 0],
      label: 'Nombre d’incidents',
      backgroundColor: '#42A5F5'
    }]
  };

  ngOnChanges() {
  if (!this.incidents?.length) {
    console.warn('Aucun incident reçu.');
    return;
  }

  // Calcul des données par trimestre
  const quarterlyCounts = [0, 0, 0, 0];
  for (const incident of this.incidents) {
    const rawDate = incident.survenueAt || incident.declaredAt;
    const date = rawDate ? new Date(rawDate) : null;
    if (!date || isNaN(date.getTime())) continue;
    const quarter = Math.floor(date.getMonth() / 3);
    quarterlyCounts[quarter]++;
  }

  // Important : recréer l'objet `barChartData` pour déclencher le rafraîchissement du graphique
  this.barChartData = {
    labels: ['T1', 'T2', 'T3', 'T4'],
    datasets: [{
      data: quarterlyCounts,
      label: 'Nombre d’incidents',
      backgroundColor: '#42A5F5'
    }]
  };

}
}