import { Component, OnInit, OnDestroy } from '@angular/core';
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
      y: { beginAtZero: true, title: { display: true, text: 'Jours' } },
      x: { title: { display: true, text: 'Mois' } }
    }
  };

  avgGlobalDelay = 0;
  isLoading = true;
  private sub!: Subscription;

  constructor(private actionPlanService: ActionPlanService) {}

  ngOnInit() {
    this.sub = this.actionPlanService.getActionsPlan().subscribe({
      next: (plans: ActionPlan[]) => {
        if (!plans || plans.length === 0) {
          this.isLoading = false;
          return;
        }

        // Grouper les plans par mois de clôture
        const monthlyDurations: Record<string, number[]> = {};
        const now = new Date();

        plans
          .filter(p => p.closedAt && p.createdAt)
          .forEach(plan => {
            const created = new Date(plan.createdAt);
            const closed = new Date(plan.closedAt!);
            const delayDays = (closed.getTime() - created.getTime()) / (1000 * 3600 * 24);

            const monthLabel = closed.toLocaleString('fr-FR', { month: 'short' });
            if (!monthlyDurations[monthLabel]) monthlyDurations[monthLabel] = [];
            monthlyDurations[monthLabel].push(delayDays);
          });

        // Calculer la moyenne par mois
        const labels = Object.keys(monthlyDurations);
        const monthlyAverages = labels.map(month => {
          const delays = monthlyDurations[month];
          const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
          return parseFloat(avg.toFixed(1));
        });

        // Calcul global
        const allDelays = Object.values(monthlyDurations).flat();
        this.avgGlobalDelay = allDelays.length
          ? Math.round(allDelays.reduce((a, b) => a + b, 0) / allDelays.length)
          : 0;

        this.data = {
          labels,
          datasets: [
            {
              label: 'Délai moyen (jours)',
              data: monthlyAverages,
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
