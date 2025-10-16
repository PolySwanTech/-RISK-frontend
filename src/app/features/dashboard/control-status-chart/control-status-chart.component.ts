import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ControlExecution } from '../../../core/models/ControlExecution';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Status } from '../../../core/enum/status.enum';
import { ControlService } from '../../../core/services/control/control.service';

@Component({
  selector: 'app-control-status-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule],
  template: `
  <mat-card class="chart-container mat-elevation-z3">
    <mat-card-header>
      <mat-card-title>📊 Contrôles par statut</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <canvas baseChart
              [data]="data"
              [options]="options"
              type="bar">
      </canvas>
    </mat-card-content>
  </mat-card>
  `,
  styles: [`.chart-container { height: 400px; }`]
})
export class ControlStatusChartComponent implements OnInit, OnDestroy {
  data: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false };
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
    const counts: Record<Status, number> = {} as Record<Status, number>;
    Object.values(Status).forEach(st => counts[st] = 0);

    executions.forEach(exec => counts[exec.status]++);

    this.data = {
      labels: Object.values(Status),
      datasets: [
        {
          label: 'Nombre de contrôles',
          data: Object.values(counts),
          backgroundColor: '#42A5F5'
        }
      ]
    };
  }
}
