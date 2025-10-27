import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Types pour les données
interface MonthlyDelay {
  month: string;
  avgDelay: number;
}

interface TeamDelay {
  team: string;
  avgDelay: number;
}

// Déclaration pour Chart.js
declare var Chart: any;

@Component({
  selector: 'app-average-implementation-delay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './average-implementation-delay.component.html',
  styleUrls: ['./average-implementation-delay.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AverageImplementationDelayComponent implements OnInit, OnDestroy {
  // Configuration des graphiques
  lineChartData: any = { labels: [], datasets: [] };
  lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Semaines'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  barChartData: any = { labels: [], datasets: [] };
  barChartOptions: any = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Semaines'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  donutChartData: any = { labels: [], datasets: [] };
  donutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    cutout: '75%'
  };

  globalAverage = 0;
  target = 4;
  isLoading = true;

  private lineChart: any;
  private barChart: any;
  private donutChart: any;
  private sub?: Subscription;

  // Données simulées (à remplacer par un service réel)
  private monthlyData: MonthlyDelay[] = [
    { month: 'Janvier', avgDelay: 5.2 },
    { month: 'Février', avgDelay: 4.8 },
    { month: 'Mars', avgDelay: 5.5 },
    { month: 'Avril', avgDelay: 4.2 },
    { month: 'Mai', avgDelay: 3.9 },
    { month: 'Juin', avgDelay: 4.1 },
    { month: 'Juillet', avgDelay: 3.7 },
    { month: 'Août', avgDelay: 4.5 }
  ];

  private teamData: TeamDelay[] = [
    { team: 'Équipe Alpha', avgDelay: 3.2 },
    { team: 'Équipe Beta', avgDelay: 4.8 },
    { team: 'Équipe Gamma', avgDelay: 5.1 },
    { team: 'Équipe Delta', avgDelay: 3.9 },
    { team: 'Équipe Epsilon', avgDelay: 4.5 }
  ];

  ngOnInit(): void {
    // Simulation de chargement asynchrone
    // Remplacer par : this.sub = this.actionPlanService.getDelayStats().subscribe(...)
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    if (this.lineChart) this.lineChart.destroy();
    if (this.barChart) this.barChart.destroy();
    if (this.donutChart) this.donutChart.destroy();
  }

  /** Charge les données et construit les graphiques */
  private loadData(): void {
    // Simulation d'un appel async
    setTimeout(() => {
      this.calculateGlobalAverage();
      this.buildLineChart(this.monthlyData);
      this.buildBarChart(this.teamData);
      this.buildDonutChart();
      
      this.isLoading = false;

      // Initialiser Chart.js après le chargement des données
      this.loadChartJS().then(() => {
        setTimeout(() => this.renderCharts(), 200);
      });
    }, 500);
  }

  /** Calcule la moyenne globale */
  private calculateGlobalAverage(): void {
    const total = this.monthlyData.reduce((sum, item) => sum + item.avgDelay, 0);
    this.globalAverage = Math.round((total / this.monthlyData.length) * 10) / 10;
  }

  /** Construit les données du graphique en ligne */
  private buildLineChart(data: MonthlyDelay[]): void {
    this.lineChartData = {
      labels: data.map(d => d.month),
      datasets: [
        {
          label: 'Délai moyen (semaines)',
          data: data.map(d => d.avgDelay),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Objectif',
          data: Array(data.length).fill(this.target),
          borderColor: '#10b981',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }
      ]
    };
  }

  /** Construit les données du graphique en barres */
  private buildBarChart(data: TeamDelay[]): void {
    this.barChartData = {
      labels: data.map(d => d.team),
      datasets: [
        {
          label: 'Délai moyen (semaines)',
          data: data.map(d => d.avgDelay),
          backgroundColor: data.map(d => 
            d.avgDelay <= this.target ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: data.map(d => 
            d.avgDelay <= this.target ? '#10b981' : '#ef4444'
          ),
          borderWidth: 2,
          borderRadius: 6
        }
      ]
    };
  }

  /** Construit les données du graphique en donut */
  private buildDonutChart(): void {
    const percentage = Math.min((this.target / this.globalAverage) * 100, 100);
    const remaining = 100 - percentage;

    this.donutChartData = {
      labels: ['Réalisé', 'Écart objectif'],
      datasets: [
        {
          data: [percentage, remaining],
          backgroundColor: [
            this.globalAverage <= this.target ? '#10b981' : '#f59e0b',
            '#e5e7eb'
          ],
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }
      ]
    };
  }

  /** Charge Chart.js depuis CDN */
  private loadChartJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Chart.js'));
      document.head.appendChild(script);
    });
  }

  /** Rend les graphiques Chart.js */
  private renderCharts(): void {
    const lineCtx = document.getElementById('lineChart') as HTMLCanvasElement;
    const barCtx = document.getElementById('barChart') as HTMLCanvasElement;
    const donutCtx = document.getElementById('donutChart') as HTMLCanvasElement;

    if (lineCtx && typeof Chart !== 'undefined') {
      this.lineChart = new Chart(lineCtx, {
        type: 'line',
        data: this.lineChartData,
        options: this.lineChartOptions
      });
    }

    if (barCtx && typeof Chart !== 'undefined') {
      this.barChart = new Chart(barCtx, {
        type: 'bar',
        data: this.barChartData,
        options: this.barChartOptions
      });
    }

    if (donutCtx && typeof Chart !== 'undefined') {
      this.donutChart = new Chart(donutCtx, {
        type: 'doughnut',
        data: this.donutChartData,
        options: this.donutChartOptions
      });
    }
  }
}