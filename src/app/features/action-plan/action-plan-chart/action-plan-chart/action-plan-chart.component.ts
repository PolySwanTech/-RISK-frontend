import { Component, ViewChild, OnInit, inject, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CreateActionPlanDialogComponent } from '../../create-action-plan-dialog/create-action-plan-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-action-plan-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatCardModule, MatButtonModule],
  templateUrl: './action-plan-chart.component.html',
  styleUrls: ['./action-plan-chart.component.scss']
})
export class ActionPlanChartComponent implements OnInit {

  dialog = inject(MatDialog);

  @Input() createPlan = false;

  constructor(private http: HttpClient) {}

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective<any>;

  doughnutChartType: ChartType = 'doughnut';
  doughnutChartDataFull = {
    labels: [] as string[],
    datasets: [{
      data: [] as number[],
      backgroundColor: ['#29b6f6', '#66bb6a', '#ffa726', '#ef5350'],
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
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  ngOnInit() {
    this.http.get<any[]>('data-example/action-plans-fake-data.json').subscribe(data => {
      const statusCounts: Record<string, number> = {};
      data.forEach(plan => {
        const status = plan.status?.toString().trim();
        if (!status) return;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      this.doughnutChartDataFull.labels = Object.keys(statusCounts);
      this.doughnutChartDataFull.datasets[0].data = Object.values(statusCounts);
      this.chart?.update();
    });
  }

  create(){
    const dialogRef = this.dialog.open(CreateActionPlanDialogComponent, {
      width: '600px !important',
      height: '600px',
      minWidth: '600px',
      maxWidth: '600px',
    });
  }
}
