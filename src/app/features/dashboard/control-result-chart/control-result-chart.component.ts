import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ControlExecution } from '../../../core/models/ControlExecution';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { EvaluationControl } from '../../../core/enum/evaluation-controle.enum';
import { ControlService } from '../../../core/services/control/control.service';

@Component({
  selector: 'app-control-result-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule],
  template: `
  <mat-card class="chart-container mat-elevation-z3">
    <mat-card-header>
      <mat-card-title>🥧 Résultats des contrôles</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <canvas baseChart
              [data]="data"
              [options]="options"
              type="doughnut">
      </canvas>
    </mat-card-content>
  </mat-card>
  `,
  styles: [`.chart-container { height: 400px; }`]
})
export class ControlResultChartComponent implements OnInit, OnDestroy {
  data: ChartData<'doughnut'> = { labels: [], datasets: [] };
  options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' },
      tooltip: {
        callbacks: {
          label: context => {
            const dataset = context.dataset.data as number[];
            const total = dataset.reduce((a, b) => a + b, 0);
            const value = context.parsed;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value} (${percent}%)`;
          }
        }
      }
    }
  };
  private sub!: Subscription;

  constructor(private controlService: ControlService) {}

  ngOnInit() {
    this.sub = this.controlService.getAllExecutions().subscribe(executions => {
      this.buildChart(executions);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private buildChart(executions: ControlExecution[]) {
    const counts: Record<EvaluationControl, number> = {} as Record<EvaluationControl, number>;
    Object.values(EvaluationControl).forEach(ev => counts[ev] = 0);

    executions.forEach(exec => counts[exec.evaluation]++);

    this.data = {
      labels: Object.values(EvaluationControl),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: ['#4caf50', '#ff9800', '#f44336'], // vert, orange, rouge
          hoverOffset: 20
        }
      ]
    };
  }
}
