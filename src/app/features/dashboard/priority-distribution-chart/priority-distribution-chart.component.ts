import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { ActionPlanListDto } from '../../../core/models/action-plan/ActionPlan';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Priority } from '../../../core/enum/Priority';

@Component({
  selector: 'app-priority-distribution-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './priority-distribution-chart.component.html',
  styleUrls: ['./priority-distribution-chart.component.scss']
})
export class PriorityDistributionChartComponent implements OnInit, OnDestroy {
  data: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // ✅ Barres horizontales
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => `${context.label}: ${context.formattedValue}`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Nombre d’actions' }
      },
      y: {
        title: { display: true, text: 'Priorité' }
      }
    }
  };

  isLoading = true;
  highPriorityCount = 0;
  totalActions = 0;
  private sub!: Subscription;

  constructor(private actionPlanService: ActionPlanService) {}

  ngOnInit() {
    this.sub = this.actionPlanService.getActionsPlan().subscribe({
      next: (plans: ActionPlanListDto[]) => {
        if (!plans || plans.length === 0) {
          this.isLoading = false;
          return;
        }

        const counts = {
          [Priority.MAXIMUM]: 0,
          [Priority.MEDIUM]: 0,
          [Priority.MINIMAL]: 0
        };

        plans.forEach(plan => {
          if (plan.priority in counts) counts[plan.priority]++;
        });

        this.highPriorityCount = counts[Priority.MAXIMUM];
        this.totalActions = plans.length;

        this.data = {
          labels: ['Haute', 'Moyenne', 'Basse'],
          datasets: [
            {
              label: 'Nombre d’actions',
              data: [
                counts[Priority.MAXIMUM],
                counts[Priority.MEDIUM],
                counts[Priority.MINIMAL]
              ],
              backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
              borderRadius: 6,
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
