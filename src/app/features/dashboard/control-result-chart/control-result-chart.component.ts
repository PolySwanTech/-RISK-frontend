import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin, of, switchMap, map, catchError } from 'rxjs';
import { ControlService } from '../../../core/services/dmr/control/control.service';
import { ControlTemplateListViewDto } from '../../../core/models/ControlTemplate';
import { ControlExecution } from '../../../core/models/ControlExecution';
import { EvaluationControl, EvaluationControlLabels } from '../../../core/enum/evaluation-controle.enum';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-control-result-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './control-result-chart.component.html',
  styleUrls: ['./control-result-chart.component.scss']
})
export class ControlResultChartComponent implements OnInit, OnDestroy {
  data: ChartData<'doughnut'> = { labels: [], datasets: [] };
  options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 14 },
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

  conformityRate = 0;
  isLoading = true;
  private sub!: Subscription;

  constructor(private controlService: ControlService) {}

  ngOnInit() {
    this.sub = this.controlService.getAllTemplates().pipe(
      switchMap((templates: ControlTemplateListViewDto[]) => {
        if (!templates.length) return of([]);

        // 🧩 Étape 1 : récupérer la dernière exécution de chaque contrôle
        const lastExecRequests = templates.map(t =>
          this.controlService.getLastExecution(t.id).pipe(
            catchError(() => of(null))
          )
        );

        return forkJoin(lastExecRequests);
      }),
      switchMap((executions: (ControlExecution | null)[]) => {
        const validExecutions = executions.filter(e => !!e) as ControlExecution[];
        if (!validExecutions.length) return of([]);

        // 🧩 Étape 2 : pour chaque exécution, récupérer l’évaluation associée
        const evaluationRequests = validExecutions.map(exec =>
          this.controlService.getEvaluationByExecution(exec.id).pipe(
            map((evaluation: any) => ({ exec, evaluation })),
            catchError(() => of(null))
          )
        );

        return forkJoin(evaluationRequests);
      })
    ).subscribe({
      next: (results: any[]) => {
        const validResults = results
          .filter(r => r && r.evaluation && r.evaluation.evaluation) // garde seulement ceux évalués
          .map(r => ({
            evaluation: r.evaluation.evaluation as EvaluationControl
          }));

        this.buildChart(validResults.map(r => r.evaluation));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  /** 🧩 Construit le graphique des évaluations */
  private buildChart(evaluations: EvaluationControl[]) {
    const counts: Record<EvaluationControl, number> = {} as Record<EvaluationControl, number>;
    Object.values(EvaluationControl).forEach(ev => (counts[ev] = 0));

    evaluations.forEach(ev => {
      if (ev in counts) counts[ev]++;
    });

    const labels = Object.values(EvaluationControl);
    const values = labels.map(l => counts[l]);
    const total = values.reduce((a, b) => a + b, 0);

    // ✅ Calcul du taux de conformité global
    const conform = counts[EvaluationControl.CONFORME] || 0;
    this.conformityRate = total > 0 ? Math.round((conform / total) * 1000) / 10 : 0;

    this.data = {
      labels: labels.map(l => EvaluationControlLabels[l]),
      datasets: [
        {
          data: values,
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], // vert / orange / rouge
          hoverOffset: 20
        }
      ]
    };
  }
}
