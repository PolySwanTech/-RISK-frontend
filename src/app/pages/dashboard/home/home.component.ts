import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { Filter } from "../../../core/enum/filter.enum";
import { PermissionName } from "../../../core/enum/permission.enum";
import { Incident } from "../../../core/models/Incident";
import { IncidentService } from "../../../core/services/incident/incident.service";
import { BaloiseCategoryChartComponent } from "../../../features/dashboard/baloise-category-chart/baloise-category-chart.component";
import { BarChartComponent } from "../../../features/dashboard/bar-chart/bar-chart.component";
import { DoughnutChartComponent } from "../../../features/dashboard/doughnut-chart/doughnut-chart.component";
import { FilterTableComponent } from "../../../shared/components/filter-table/filter-table.component";
import { GoBackButton, GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { ActionPlanChartComponent } from "../action-plan-chart/action-plan-chart.component";
import { ControlChartComponent } from "../control-chart/control-chart.component";
import { MatTabsModule } from '@angular/material/tabs';
import { IncidentsTrendChartComponent } from "../../../features/dashboard/incidents-trend-chart/incidents-trend-chart.component";

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatTabsModule, ActionPlanChartComponent, ControlChartComponent,
    BarChartComponent, DoughnutChartComponent, MatIconModule, GoBackComponent,
    MatOptionModule, MatSelectModule, MatFormFieldModule, FormsModule, MatButtonModule, FilterTableComponent, BaloiseCategoryChartComponent, IncidentsTrendChartComponent],
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
