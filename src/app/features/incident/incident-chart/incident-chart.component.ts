import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Incident, State } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-incident-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule],
  templateUrl: './incident-chart.component.html',
  styleUrls: ['./incident-chart.component.scss']
})
export class IncidentChartComponent implements OnChanges {
  @Input() incidents: Incident[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective<any>;


  barChartType: ChartType = 'bar';
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
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

  doughnutChartType: ChartType = 'doughnut';
  doughnutChartLabels: string[] = ['Nouveaux', 'Clôturés'];
  doughnutChartDataFull = {
    labels: this.doughnutChartLabels,
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#66bb6a', '#ef5350'],
      hoverOffset: 20
    }]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: { size: 13 }
        }
      },
      tooltip: {
        callbacks: {
          label: context => `${context.label}: ${context.parsed}`
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  ngOnChanges() {
    if (!this.incidents?.length) return;

    const quarterlyCounts = [0, 0, 0, 0];
    for (const incident of this.incidents) {
      const rawDate = incident.survenueAt || incident.declaredAt;
      const date = rawDate ? new Date(rawDate) : null;
      if (!date || isNaN(date.getTime())) continue;
      const quarter = Math.floor(date.getMonth() / 3);
      quarterlyCounts[quarter]++;
    }
    this.barChartData.datasets[0].data = quarterlyCounts;

    let countNew = 0;
    let countClosed = 0;
    for (const incident of this.incidents) {
      switch (incident.state) {
        case State.DRAFT:
          countNew++;
          break;
        case State.CLOSED:
          countClosed++;
          break;
        default:
          // Ignore other states
          break;
      }
    }

    this.doughnutChartDataFull = {
      labels: ['Nouveaux', 'Clôturés'],
      datasets: [{
        data: [countNew, countClosed],
        backgroundColor: ['#66bb6a', '#ef5350'],
        hoverOffset: 20
      }]
    };



    if (this.chart) {
      this.chart.update();
    }
  }
}
