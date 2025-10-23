import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RiskService } from '../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { RiskLevelEnum, RiskLevelLabels, RiskLevelColor } from '../../../core/enum/riskLevel.enum';

@Component({
  selector: 'app-risk-criticality-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './risk-criticality-chart.component.html',
  styleUrls: ['./risk-criticality-chart.component.scss']
})
export class RiskCriticalityChartComponent implements OnInit, OnDestroy {
  data: ChartData<'bar'> = { labels: [], datasets: [] };
  options: ChartOptions<'bar'> = {
    indexAxis: 'y', // ✅ barres horizontales
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { stepSize: 1 }
      },
      y: {
        grid: { display: false },
        ticks: { font: { weight: 'bold' } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => `${context.parsed.x} risque${context.parsed.x > 1 ? 's' : ''}`
        }
      }
    }
  };

  total = 0;
  isLoading = true;
  private sub!: Subscription;

  constructor(private riskService: RiskService) {}

  ngOnInit() {
    this.sub = this.riskService.getAll().subscribe({
      next: (risks: RiskTemplate[]) => {
        if (!risks?.length) {
          this.isLoading = false;
          return;
        }

        // ✅ Initialiser le compteur
        const counts: Record<RiskLevelEnum, number> = {
          [RiskLevelEnum.LOW]: 0,
          [RiskLevelEnum.MEDIUM]: 0,
          [RiskLevelEnum.HIGH]: 0,
          [RiskLevelEnum.VERY_HIGH]: 0
        };

        // ✅ Comptage basé sur la dernière évaluation brute
        risks.forEach(risk => {
          const latestEval = risk.riskBrut?.[risk.riskBrut.length - 1]?.evaluation;
          if (latestEval && counts.hasOwnProperty(latestEval.name)) counts[latestEval.name]++;
        });

        this.total = Object.values(counts).reduce((a, b) => a + b, 0);

        this.data = {
          labels: Object.values(RiskLevelLabels),
          datasets: [
            {
              data: [
                counts[RiskLevelEnum.LOW],
                counts[RiskLevelEnum.MEDIUM],
                counts[RiskLevelEnum.HIGH],
                counts[RiskLevelEnum.VERY_HIGH]
              ],
              backgroundColor: [
                RiskLevelColor[RiskLevelEnum.LOW],
                RiskLevelColor[RiskLevelEnum.MEDIUM],
                RiskLevelColor[RiskLevelEnum.HIGH],
                RiskLevelColor[RiskLevelEnum.VERY_HIGH]
              ],
              borderRadius: 6,
              borderSkipped: false
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
