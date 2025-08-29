import { MatButtonModule } from '@angular/material/button';
import { Component, inject, OnInit } from '@angular/core';
import { UtilisateurService } from '../../core/services/utilisateur/utilisateur.service';
import { MatCardModule } from '@angular/material/card';
import { ActionPlanChartComponent } from "../../features/action-plan/action-plan-chart/action-plan-chart/action-plan-chart.component";
import { ControlChartComponent } from "../../features/control/control-chart/control-chart/control-chart.component";
import { IncidentService } from '../../core/services/incident/incident.service';
import { Incident } from '../../core/models/Incident';
import { BarChartComponent } from "../../features/incident/bar-chart/bar-chart.component";
import { DoughnutChartComponent } from "../../features/incident/doughnut-chart/doughnut-chart.component";
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Filter } from '../../core/enum/filter.enum';
import { FilterTableComponent } from "../../shared/components/filter-table/filter-table.component";

@Component({
  selector: 'app-home',
  imports: [MatCardModule, ActionPlanChartComponent, ControlChartComponent,
    BarChartComponent, DoughnutChartComponent, MatIconModule,
    MatOptionModule, MatSelectModule, MatFormFieldModule, FormsModule, MatButtonModule, FilterTableComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  incidents: Incident [] = [];

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

  private incidentService = inject(IncidentService)
  
  constructor(private utilisateurService : UtilisateurService){
  }

  ngOnInit() {
    this.loadIncidents();
  }

  clearFilters(): void {
  this.selectedPeriod = null;
  this.selectedDepartment = null;
}

  loadIncidents() {
    this.incidentService.loadIncidents().subscribe(data => {
      this.incidents = data;
    });
  }

  refreshData(){
    this.ngOnInit();
  }

  handleFiltersChanged(filters: any) {
  }
}
