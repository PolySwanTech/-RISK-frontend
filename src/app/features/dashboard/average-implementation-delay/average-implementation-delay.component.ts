import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { ActionPlan } from '../../../core/models/ActionPlan';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-average-implementation-delay',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './average-implementation-delay.component.html',
  styleUrls: ['./average-implementation-delay.component.scss']
})
export class AverageImplementationDelayComponent implements OnInit, OnDestroy {
  data: ChartData<'line'> = { labels: [], datasets: [] };
  options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    elements: {
      line: { tension: 0.4, fill: true, borderWidth: 3 },
      point: { radius: 4, backgroundColor: '#2563eb' }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Nombre de plans d\'action' } },
      x: {
        type: 'linear',
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1
        },
        title: { display: true, text: 'Nombre de semaines' }
      }
    }
  };

  avgGlobalDelay = 0;
  isLoading = true;
  private sub!: Subscription;

  private actionPlanService = inject(ActionPlanService)

  ngOnInit() {
    this.sub = this.actionPlanService.getActionsPlan().subscribe({
      next: (plans: ActionPlan[]) => {
        if (!plans || plans.length === 0) {
          this.isLoading = false;
          return;
        }

        // Compter le nombre de plans par nombre de semaines
        const weeklyCounts: Record<number, number> = {};

        plans
          .filter(p => p.createdAt && p.closedAt)
          .forEach(plan => {
            const started = new Date(plan.createdAt);
            const closed = new Date(plan.closedAt!);
            const delayWeeks = (closed.getTime() - started.getTime()) / (1000 * 3600 * 24 * 7);
            const roundedWeeks = Math.ceil(delayWeeks); // arrondi à la semaine supérieure

            if (roundedWeeks > 10) return; // Ignorer >10 semaines si tu veux fixer l'axe
            weeklyCounts[roundedWeeks] = (weeklyCounts[roundedWeeks] || 0) + 1;
          });

        // Générer les labels 0 à 10 semaines
        const labels = Array.from({ length: 11 }, (_, i) => i); // 0,1,2,...,10

        // Construire le dataset correspondant aux counts
        const dataCounts = labels.map(week => weeklyCounts[week] || 0);

        // Calcul global : nombre total de plans
        this.avgGlobalDelay = plans.length;

        this.data = {
          labels,
          datasets: [
            {
              label: 'Nombre de plans d’action',
              data: dataCounts,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              fill: true,
            }
          ]
        };

        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

}
