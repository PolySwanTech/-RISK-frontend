import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  incidents: any[] = [];
  totalIncidents: number = 0;
  categoriesCount: Record<string, number> = {};
  monthlyCount: Record<string, number> = {};

  barChartLabels: string[] = [];
  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], label: '' }] };
  barChartType: ChartType = 'bar';
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14 }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 14 } } },
      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 14 } } }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadIncidents();
  }

  loadIncidents() {
    this.http.get<any[]>('/data-example/incident-example.json').subscribe((data) => {
      this.incidents = data || [];
      this.totalIncidents = this.incidents.length;
      this.calculateCategoryStats();
      this.calculateMonthlyStats();
    });
  }

  calculateCategoryStats() {
    this.categoriesCount = {};
    this.incidents.forEach((incident) => {
      const category = incident.riskPrincipal?.taxonomie || 'Autre';
      this.categoriesCount[category] = (this.categoriesCount[category] || 0) + 1;
    });

    this.updateChart('category');
  }

  calculateMonthlyStats() {
    this.monthlyCount = {};
    this.incidents.forEach((incident) => {
      if (!incident.dateDeclaration) return;
      const date = new Date(incident.dateDeclaration);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      this.monthlyCount[monthKey] = (this.monthlyCount[monthKey] || 0) + 1;
    });
  }

  updateChart(type: 'category' | 'month') {
    if (type === 'category') {
      this.barChartLabels = Object.keys(this.categoriesCount);
      this.barChartData = { 
        labels: this.barChartLabels,
        datasets: [{ 
          data: Object.values(this.categoriesCount), 
          label: 'Incidents par catégorie',
          backgroundColor: 'rgba(255, 99, 132, 0.6)'
        }]
      };
    } else {
      this.barChartLabels = Object.keys(this.monthlyCount);
      this.barChartData = { 
        labels: this.barChartLabels,
        datasets: [{ 
          data: Object.values(this.monthlyCount), 
          label: 'Incidents par mois',
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      };
    }
  }
  
}
