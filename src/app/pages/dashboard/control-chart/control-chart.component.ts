import { Component, ViewChild, OnInit, Input, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ControlService } from '../../../core/services/control/control.service';
import { ControlTemplate } from '../../../core/models/ControlTemplate';
import { Degree, DegreeLabels } from '../../../core/enum/degree.enum';
import { Status, StatusLabels } from '../../../core/enum/status.enum';
import { Plugin } from 'chart.js';

const noDataPlugin: Plugin<'pie'> = {
  id: 'noDataPlugin',
  beforeDraw: (chart) => {
    const data = chart.data.datasets[0].data;
    const total = 0;

    if (total === 0) {
      const { ctx, width, height } = chart;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#999';
      ctx.fillText('Aucune donnée disponible', width / 2, height / 2);
      ctx.restore();
    }
  }
};

@Component({
  selector: 'app-control-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatCardModule, FormsModule, MatButtonToggleModule],
  templateUrl: './control-chart.component.html',
  styleUrls: ['./control-chart.component.scss']
})
export class ControlChartComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  controlService = inject(ControlService);

  groupByLevel = false;
  controls: ControlTemplate[] = [];

  statusLabels = StatusLabels;
  degreeLabels = DegreeLabels;

  noDataPlugin = noDataPlugin;

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
    maintainAspectRatio: false,
    layout: { padding: 20 },
    plugins: {
      legend: {
        position: 'left',
        labels: {
          color: '#333',
          font: {
            size: 14,
            weight: 'bold',
            family: 'Arial, sans-serif'
          },
          boxWidth: 20,
          boxHeight: 15,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          textAlign: 'left'
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
    },
  };

  ngOnInit() {
    this.controlService.getAllTemplates().subscribe(data => {
      this.controls = data;

      let remaining = this.controls.length;

      if (remaining === 0) {
        this.updateChart(); // aucune donnée
        return;
      }

      this.controls.forEach(c => {
        this.controlService.getLastExecution(c.id).subscribe(exec => {
          c.execution = exec;
          remaining--;

          // Mettre à jour uniquement une fois que toutes les exécutions sont récupérées
          if (remaining === 0) {
            this.updateChart();
          }
        });
      });
    });
  }


  updateChart() {
    if (this.groupByLevel) {
      const counts: Record<Degree, number> = {
        [Degree.LEVEL_1]: 0,
        [Degree.LEVEL_2]: 0,
      };

      this.controls.forEach(control => {
        counts[control.controlLevel] = (counts[control.controlLevel] || 0) + 1;
      });

      this.pieChartData.labels = Object.keys(counts).map(
        degree => this.formatDegree(degree as Degree)
      );
      this.pieChartData.datasets[0].data = Object.values(counts);
    } else {
      const counts: Record<Status, number> = {
        [Status.ACHIEVED]: 0,
        [Status.IN_PROGRESS]: 0,
        [Status.NOT_ACHIEVED]: 0,
        [Status.NOT_STARTED]: 0,
        [Status.CANCELLED]: 0
      };

      this.controls.forEach(control => {
        if (control.execution)
          counts[control.execution.status] = (counts[control.execution.status] || 0) + 1;
      });

      this.pieChartData.labels = Object.keys(counts).map(
        statusKey => this.formatStatus(statusKey as Status)
      );
      this.pieChartData.datasets[0].data = Object.values(counts);
    }

    this.chart?.update();
  }

  formatStatus(status: Status) {
    return this.statusLabels[status] || 'Inconnu'
  }

  formatDegree(degree: Degree) {
    return this.degreeLabels[degree] || 'Inconnu'
  }
}
