import { MatButtonModule } from '@angular/material/button';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActionPlanChartComponent } from "../../features/action-plan/action-plan-chart/action-plan-chart/action-plan-chart.component";
import { ControlChartComponent } from "../../features/control/control-chart/control-chart/control-chart.component";
import { IncidentService } from '../../core/services/incident/incident.service';
import { Incident } from '../../core/models/Incident';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Filter } from '../../core/enum/filter.enum';
import { FilterTableComponent } from "../../shared/components/filter-table/filter-table.component";
import { BarChartComponent } from '../../features/dashboard/bar-chart/bar-chart.component';
import { DoughnutChartComponent } from '../../features/dashboard/doughnut-chart/doughnut-chart.component';
import { BaloiseCategoryChartComponent } from "../../features/dashboard/baloise-category-chart/baloise-category-chart.component";

@Component({
  selector: 'app-home',
  imports: [MatCardModule, ActionPlanChartComponent, ControlChartComponent,
    BarChartComponent, DoughnutChartComponent, MatIconModule,
    MatOptionModule, MatSelectModule, MatFormFieldModule, FormsModule, MatButtonModule, FilterTableComponent, BaloiseCategoryChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  incidents: Incident[] = [];
  selectedMode: 'month' | 'quarter' | 'year' = 'month';


  filtersConfig: Filter[] = [
    {
      key: 'department',
      label: 'Département',
      type: 'select',
      icon: 'domain', // 🏢
      options: [
        { value: 'all', label: 'Tous les départements' },
        { value: 'it', label: 'IT' },
        { value: 'rh', label: 'RH' },
        { value: 'finance', label: 'Finance' },
      ],
    },
    {
      key: 'date',
      label: 'Période',
      type: 'date',
      icon: 'event' // 📅
    }
  ];

  selectedPeriod: string | null = null;
  selectedDepartment: string | null = null;

  goBackButtons: GoBackButton[] = [
    {
      label: 'Exporter',
      icon: 'file_download',
      action: () => this.export(),
      class: 'btn-green',
      show: true,
      permission: [PermissionName.PREPARE_REPORTS]
    }
  ]

  private incidentService = inject(IncidentService)


  ngOnInit() {
    this.loadIncidents();
  }

  clearFilters(): void {
    this.selectedPeriod = null;
    this.selectedDepartment = null;
  }

  loadIncidents() {
    this.incidentService.loadIncidentsFull().subscribe(data => {
      this.incidents = data;
    });
  }

  refreshData() {
    this.ngOnInit();
  }

  handleFiltersChanged(filters: any) {
  }

  export(){
    console.error("Fonctionnalité non-impémentée")
  }
}
