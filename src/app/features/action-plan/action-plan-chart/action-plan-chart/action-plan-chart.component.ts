import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-plan-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatCardModule],
  templateUrl: './action-plan-chart.component.html',
  styleUrls: ['./action-plan-chart.component.scss']
})
export class ActionPlanChartComponent implements OnInit {

  constructor(private http: HttpClient) {}

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective<any>;

  doughnutChartType: ChartType = 'doughnut';
  doughnutChartDataFull = {
    labels: [] as string[],
    datasets: [{
      data: [] as number[],
      backgroundColor: ['#29b6f6', '#66bb6a', '#ffa726', '#ef5350'],
      hoverOffset: 20
    }]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: { size: 13 }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  ngOnInit() {
    this.http.get<any[]>('data-example/action-plans-fake-data.json').subscribe(data => {
      const statusCounts: Record<string, number> = {};
      data.forEach(plan => {
        const status = plan.status?.toString().trim();
        if (!status) return;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      this.doughnutChartDataFull.labels = Object.keys(statusCounts);
      this.doughnutChartDataFull.datasets[0].data = Object.values(statusCounts);
      this.chart?.update();
    });
  }
}
