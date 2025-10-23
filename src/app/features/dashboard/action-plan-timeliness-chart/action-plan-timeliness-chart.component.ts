import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { ActionPlan } from '../../../core/models/ActionPlan';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Status } from '../../../core/enum/status.enum';

@Component({
  selector: 'app-action-plan-timeliness-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './action-plan-timeliness-chart.component.html',
  styleUrls: ['./action-plan-timeliness-chart.component.scss']
})
export class ActionPlanTimelinessChartComponent implements OnInit, OnDestroy {
  data: ChartData<'doughnut'> = { labels: [], datasets: [] };
  options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'top' },
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

  onTimeRate = 0;
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

        let onTime = 0;
        let late = 0;

        const now = new Date();

        plans.forEach(plan => {
          const echeance = new Date(plan.echeance);

          if (plan.closedAt) {
            // ✅ Si le plan est clôturé
            const closedAt = new Date(plan.closedAt);
            if (closedAt <= echeance) onTime++;
            else late++;
          } else {
            // ⚠️ Si le plan n'est pas clôturé mais la date d'échéance est dépassée
            if (echeance < now && plan.status !== Status.CANCELLED) {
              late++;
            }
          }
        });

        const total = onTime + late;
        this.onTimeRate = total > 0 ? Math.round((onTime / total) * 1000) / 10 : 0;

        this.data = {
          labels: ['À temps', 'En retard'],
          datasets: [
            {
              data: [onTime, late],
              backgroundColor: ['#10b981', '#ef4444'],
              hoverOffset: 20
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
