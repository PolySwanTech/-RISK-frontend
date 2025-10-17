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
import { FilterTableComponent } from "../../../shared/components/filter-table/filter-table.component";
import { GoBackButton, GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { ActionPlanChartComponent } from "../action-plan-chart/action-plan-chart.component";
import { ControlChartComponent } from "../control-chart/control-chart.component";
import { MatTabsModule } from '@angular/material/tabs';
import { IncidentsTrendChartComponent } from "../../../features/dashboard/incidents-trend-chart/incidents-trend-chart.component";
import { State } from "../../../core/enum/state.enum";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatTabsModule, ActionPlanChartComponent, ControlChartComponent,
    BarChartComponent, MatIconModule, GoBackComponent, MatDatepickerModule, MatInputModule, MatNativeDateModule,
    MatOptionModule, MatSelectModule, MatFormFieldModule, FormsModule, MatButtonModule, FilterTableComponent, BaloiseCategoryChartComponent, IncidentsTrendChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  incidents: Incident[] = [];
  filteredIncidents: Incident[] = [];

  startDate: Date | null = null;
  endDate: Date | null = null;


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

  selectedDepartment: string | null = null;

  totalIncidents = 0;
  resolvedIncidents = 0;
  inProgressIncidents = 0;
  draftIncidents = 0;
  avgResolutionTime = 0;
  resolutionRate = 0;

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


  /** ✅ Appliquer le filtre de date */
  applyDateFilter() {
    if (!this.startDate && !this.endDate) {
      this.filteredIncidents = [...this.incidents];
    } else {
      this.filteredIncidents = this.incidents.filter(i => {
        const declared = new Date(i.declaredAt);
        return (
          (!this.startDate || declared >= this.startDate) &&
          (!this.endDate || declared <= this.endDate)
        );
      });
    }

    this.updateStats();
  }

  /** ✅ Réinitialiser le filtre */
  clearDateFilter() {
    this.startDate = null;
    this.endDate = null;
    this.filteredIncidents = [...this.incidents];
    this.updateStats();
  }

  loadIncidents() {
    this.incidentService.loadIncidentsFull().subscribe(data => {
      this.incidents = data;
      this.filteredIncidents = data;
      this.updateStats();
    });
  }

  refreshData() {
    this.ngOnInit();
  }
  
  updateStats() {
    const incidents = this.filteredIncidents;
    this.totalIncidents = incidents.length;
    this.resolvedIncidents = incidents.filter(i => i.state === State.CLOSED).length;
    this.draftIncidents = incidents.filter(i => i.state === State.DRAFT).length;
    this.inProgressIncidents = incidents.filter(i => i.state === State.SUBMIT).length + this.draftIncidents;
    this.resolutionRate = this.totalIncidents ? Math.round((this.resolvedIncidents / this.totalIncidents) * 100) : 0;

    // Calcul du temps moyen de résolution
    const resolved = incidents.filter(i => i.closedAt);
    const durations = resolved.map(i =>
      (new Date(i.closedAt!).getTime() - new Date(i.declaredAt).getTime()) / (1000 * 3600 * 24)
    );
    this.avgResolutionTime = durations.length
      ? parseFloat((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1))
      : 0;
  }

  export(){
    console.error("Fonctionnalité non-impémentée")
  }
}
