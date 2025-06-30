import { Component, ViewChild, OnInit, Input, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ControlService } from '../../../../core/services/control/control.service';

@Component({
  selector: 'app-control-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatCardModule, FormsModule, MatButtonToggleModule],
  templateUrl: './control-chart.component.html',
  styleUrls: ['./control-chart.component.scss']
})
export class ControlChartComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  dialog = inject(MatDialog);

  @Input() createControl = false;

  groupByLevel = false;
  controls: any[] = [];

  pieChartData = {
    labels: [] as string[],
    datasets: [{
      data: [] as number[],
      backgroundColor: ['#ef5350', '#ffa726', '#66bb6a', '#29b6f6'],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false, // permet d'adapter la taille à son conteneur
    layout: { padding: 20 },
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
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.parsed;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };


  controlService = inject(ControlService);

  ngOnInit() {
    this.controlService.getAllTemplates().subscribe(data => {
      this.controls = data;
      this.controlService.getAllExections().subscribe(data => {
        this.controls = this.controls.concat(data);
        this.updateChart();
      });
    });
  }

  updateChart() {
    const counts: Record<string, number> = {};

    this.controls.forEach(control => {
      const key = this.groupByLevel
        ? control.level?.toString().trim()
        : control.status?.toString().trim();

      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });

    this.pieChartData.labels = Object.keys(counts);
    this.pieChartData.datasets[0].data = Object.values(counts);
    this.chart?.update();
  }
}
