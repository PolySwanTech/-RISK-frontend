import { Component, Input, OnChanges } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Incident } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule],
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnChanges {
  @Input() incidents: Incident[] = [];

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
    maintainAspectRatio: false, // permet d'adapter la taille à son conteneur
    layout: {
      padding: {
        top: 30,
        bottom: 30 
      }
    },
    plugins: {
      legend: {
        position: 'left',
        labels: {
          color: '#333',                 // couleur du texte
          font: {
            size: 14,                    // taille du texte
            weight: 'bold',              // épaisseur (normal, bold, etc.)
            family: 'Arial, sans-serif' // police de caractères
          },
          boxWidth: 20,                  // taille du carré de couleur
          boxHeight: 15,                 // hauteur du carré de couleur (Chart.js 4+)
          padding: 20,                   // espacement autour du texte dans la légende
          usePointStyle: true,          // affiche un rond au lieu d'un carré
          pointStyle: 'circle',         // 'circle', 'rect', 'star', etc.
          textAlign: 'left'             // alignement du texte (start, center, end)
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

    let countNew = 0;
    let countClosed = 0;
    for (const incident of this.incidents) {
      const state = incident.state?.toUpperCase?.();
      if (state === 'DRAFT') countNew++;
      else if (state === 'CLOSED') countClosed++;
    }

    this.doughnutChartDataFull = {
      labels: ['Brouillons', 'Clôturés'],
      datasets: [{
        data: [countNew, countClosed],
        backgroundColor: ['#66bb6a', '#ef5350'],
        hoverOffset: 20
      }]
    };
  }
}