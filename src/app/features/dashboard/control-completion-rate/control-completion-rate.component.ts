import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';
import { ControlService } from '../../../core/services/dmr/control/control.service';
import { ControlTemplate } from '../../../core/models/dmr/ControlTemplate';
import { ControlExecution } from '../../../core/models/dmr/ControlExecution';
import { Status } from '../../../core/enum/status.enum';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-control-completion-rate',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule, MatProgressSpinner],
  templateUrl: './control-completion-rate.component.html',
  styleUrls: ['./control-completion-rate.component.scss']
})
export class ControlCompletionRateComponent implements OnInit, OnDestroy {
  data: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions<'bar'> = {};
  objective = 95;

  totalControls = 0;
  completedControls = 0;
  remainingControls = 0;
  completionRate = 0;
  isLoading = true;

  private sub!: Subscription;

  constructor(private controlService: ControlService) {}

  ngOnInit() {
    // 1️⃣ Charger tous les contrôles
    this.sub = this.controlService.getAllTemplates().subscribe({
      next: (templates: ControlTemplate[]) => {
        if (!templates.length) {
          this.isLoading = false;
          return;
        }

        // 2️⃣ Charger les dernières exécutions pour chaque contrôle
        const requests = templates.map(t => this.controlService.getLastExecution(t.id));
        forkJoin(requests).subscribe({
          next: (executions: (ControlExecution | null)[]) => {
            const validExecutions = executions.filter(e => !!e) as ControlExecution[];
            this.buildChart(validExecutions);
            this.isLoading = false;
          },
          error: () => (this.isLoading = false)
        });
      },
      error: () => (this.isLoading = false)
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  /** 🧩 Construit le graphique à partir des dernières exécutions */
  private buildChart(executions: ControlExecution[]) {
    this.totalControls = executions.length;
    this.completedControls = executions.filter(e => e.status === Status.ACHIEVED).length;
    this.remainingControls = this.totalControls - this.completedControls;

    this.completionRate = this.totalControls > 0
      ? Math.round((this.completedControls / this.totalControls) * 100)
      : 0;

    this.data = {
      labels: ['Taux de réalisation'],
      datasets: [
        {
          label: 'Réalisé',
          data: [this.completionRate],
          backgroundColor: '#10b981'
        },
        {
          label: 'Restant',
          data: [100 - this.completionRate],
          backgroundColor: '#e5e7eb'
        }
      ]
    };

    this.options = {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: context => `${context.dataset.label}: ${context.parsed.x}%`
          }
        }
      },
      scales: {
        x: { beginAtZero: true, max: 100, title: { display: true, text: 'Pourcentage (%)' } },
        y: { display: true, grid: { display: false } }
      }
    };
  }
}
