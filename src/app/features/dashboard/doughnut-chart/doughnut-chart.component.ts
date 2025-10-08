import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { Incident } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';
import { State, StateLabels } from '../../../core/enum/state.enum';
import { Subscription } from 'rxjs';
import { IncidentFilterService } from '../../../core/services/incident-filter/incident-filter.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [NgChartsModule, MatCardModule, CommonModule],
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnInit, OnDestroy {
  @Input() incidents: Incident[] = [];
  doughnutChartType: 'doughnut' = 'doughnut';
  doughnutChartDataFull: any = { labels: [], datasets: [] };

  private sub!: Subscription;
  selectedState: State | null = null; // état sélectionné

  constructor(private filterService: IncidentFilterService) {}

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'left' }
    }
  };

  ngOnInit() {
    this.filterService.setIncidents(this.incidents);
    this.sub = this.filterService.filteredIncidents$.subscribe(filtered => {
      this.buildChart(filtered);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private buildChart(source: Incident[]) {
    const counts: Record<State, number> = {
      [State.DRAFT]: 0,
      [State.VALIDATE]: 0,
      [State.SUBMIT]: 0,
      [State.PROCESS]: 0,
      [State.CLOSED]: 0,
      [State.REJECTED]: 0,
    };

    for (const inc of source) {
      if (inc.state && counts.hasOwnProperty(inc.state)) {
        counts[inc.state]++;
      }
    }

    const labels = Object.values(State).map(st => StateLabels[st]);
    const data = Object.values(State).map(st => counts[st]);

    this.doughnutChartDataFull = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            '#42a5f5',
            '#66bb6a',
            '#ffa726',
            '#ab47bc',
            '#ef5350',
            '#26c6da'
          ],
          hoverOffset: 20
        }
      ]
    };
  }

  onChartClick(event: any) {
    if (!event.active?.length) return;
    const index = event.active[0].index;
    const clickedLabel = this.doughnutChartDataFull.labels[index];

    const stateKey = Object.keys(StateLabels).find(
      key => StateLabels[key as State] === clickedLabel
    ) as State;

    if (!stateKey) return;

    this.selectedState = stateKey;
    this.filterService.setFilter('state', (inc: Incident) => inc.state === stateKey);
  }

  goBack() {
    this.selectedState = null;
    this.filterService.clearFilter('state');
  }

  getStateLabel(state: State | null): string {
    return state ? StateLabels[state] : 'Tous les états';}
}
