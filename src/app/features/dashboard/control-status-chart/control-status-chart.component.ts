import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { ControlService } from '../../../core/services/dmr/control/control.service';
import { ControlTemplate } from '../../../core/models/dmr/ControlTemplate';
import { ControlExecution } from '../../../core/models/dmr/ControlExecution';
import { Status, StatusLabels } from '../../../core/enum/status.enum';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-control-status-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule, MatProgressSpinner],
  templateUrl: './control-status-chart.component.html',
  styleUrls: ['./control-status-chart.component.scss']
})
export class ControlStatusChartComponent implements OnInit, OnDestroy {
  data: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

  total = 0;
  isLoading = true;
  private sub!: Subscription;

  constructor(private controlService: ControlService) {}

  ngOnInit() {
    // Étape 1️⃣ — Récupérer tous les contrôles
    this.sub = this.controlService.getAllTemplates().subscribe({
      next: (templates: ControlTemplate[]) => {
        if (!templates.length) {
          this.isLoading = false;
          return;
        }

        // Étape 2️⃣ — Pour chaque contrôle, récupérer sa dernière exécution
        const requests = templates.map(t => this.controlService.getLastExecution(t.id));
        forkJoin(requests).subscribe({
          next: (executions: (ControlExecution | null)[]) => {
            // Étape 3️⃣ — Construire le graphique
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
    const counts: Record<Status, number> = {} as Record<Status, number>;
    Object.values(Status).forEach(status => (counts[status] = 0));

    executions.forEach(exec => {
      if (exec.status in counts) counts[exec.status]++;
    });

    const labels = Object.values(Status);
    const dataValues = labels.map(l => counts[l]);
    this.total = dataValues.reduce((a, b) => a + b, 0);

    // Palette cohérente avec les statuts
    const colorMap: Record<string, string> = {
      PLANNED: '#06b6d4',
      IN_PROGRESS: '#f59e0b',
      COMPLETED: '#10b981',
      CANCELED: '#ef4444'
    };

    this.data = {
      labels: labels.map(l => this.getStatusLabel(l)),
      datasets: [
        {
          label: 'Nombre de contrôles',
          data: dataValues,
          backgroundColor: labels.map(l => colorMap[l] || '#94a3b8')
        }
      ]
    };
  }

  getStatusLabel(status: Status): string {
    return StatusLabels[status] || status;
  }
}
