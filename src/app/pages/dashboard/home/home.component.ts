import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { PermissionName } from "../../../core/enum/permission.enum";
import { IncidentListViewDto } from "../../../core/models/Incident";
import { IncidentService } from "../../../core/services/incident/incident.service";
import { BaloiseCategoryChartComponent } from "../../../features/dashboard/baloise-category-chart/baloise-category-chart.component";
import { GoBackButton, GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { MatTabsModule } from '@angular/material/tabs';
import { IncidentsTrendChartComponent } from "../../../features/dashboard/incidents-trend-chart/incidents-trend-chart.component";
import { State } from "../../../core/enum/state.enum";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ControlCompletionRateComponent } from "../../../features/dashboard/control-completion-rate/control-completion-rate.component";
import { ControlResultChartComponent } from "../../../features/dashboard/control-result-chart/control-result-chart.component";
import { ControlStatusChartComponent } from "../../../features/dashboard/control-status-chart/control-status-chart.component";
import { ActionPlanTimelinessChartComponent } from "../../../features/dashboard/action-plan-timeliness-chart/action-plan-timeliness-chart.component";
import { AverageImplementationDelayComponent } from "../../../features/dashboard/average-implementation-delay/average-implementation-delay.component";
import { PriorityDistributionChartComponent } from "../../../features/dashboard/priority-distribution-chart/priority-distribution-chart.component";
import { RiskEvaluationSummaryComponent } from "../../../features/dashboard/risk-evaluation-summary/risk-evaluation-summary.component";
import { RiskCriticalityChartComponent } from "../../../features/dashboard/risk-criticality-chart/risk-criticality-chart.component";
import { TopCriticalRisksComponent } from "../../../features/dashboard/top-critical-risks/top-critical-risks.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCardModule,
    MatTabsModule,
    ControlCompletionRateComponent,
    ControlResultChartComponent,
    ControlStatusChartComponent,
    MatIconModule,
    GoBackComponent,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatButtonModule,
    BaloiseCategoryChartComponent,
    IncidentsTrendChartComponent,
    ActionPlanTimelinessChartComponent,
    AverageImplementationDelayComponent,
    PriorityDistributionChartComponent,
    RiskEvaluationSummaryComponent,
    RiskCriticalityChartComponent,
    TopCriticalRisksComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  incidents: IncidentListViewDto[] = [];
  filteredIncidents: IncidentListViewDto[] = [];

  startDate: Date | null = null;
  endDate: Date | null = null;

  selectedDepartment: string | null = null;

  totalIncidents = 0;
  resolvedIncidents = 0;
  inProgressIncidents = 0;
  draftIncidents = 0;
  avgResolutionTime = '';
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
  ];

  private incidentService = inject(IncidentService);

  ngOnInit() {
    this.loadIncidents();
  }

  /** 🔄 Charger tous les incidents */
  loadIncidents() {
    this.incidentService.loadIncidentsFull().subscribe(data => {
      this.incidents = data;
      this.filteredIncidents = data;
      this.updateStats();
    });
  }

  /** 📅 Appliquer le filtre de période */
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

  /** 🔁 Réinitialiser le filtre */
  clearDateFilter() {
    this.startDate = null;
    this.endDate = null;
    this.filteredIncidents = [...this.incidents];
    this.updateStats();
  }

  /** 📊 Met à jour toutes les statistiques du dashboard */
  updateStats() {
    const incidents = this.filteredIncidents;
    this.totalIncidents = incidents.length;

    this.resolvedIncidents = incidents.filter(i => i.state === State.CLOSED).length;
    this.draftIncidents = incidents.filter(i => i.state === State.DRAFT).length;
    this.inProgressIncidents = incidents.filter(i => i.state === State.SUBMIT).length;

    this.resolutionRate = this.totalIncidents
      ? Math.round((this.resolvedIncidents / this.totalIncidents) * 100)
      : 0;

    this.avgResolutionTime = this.calculateAverageResolutionTime(incidents);
  }

  private calculateAverageResolutionTime(incidents: IncidentListViewDto[]): string {
    const resolved = incidents.filter(i => i.closedAt && i.declaredAt);

    // Calcul des durées en jours
    const durations = resolved
      .map(i => {
        const declared = new Date(i.declaredAt).getTime();
        const closed = new Date(i.closedAt!).getTime();
        const diffDays = (closed - declared) / (1000 * 3600 * 24);
        return diffDays > 0 ? diffDays : 0;
      })
      .filter(d => d > 0);

    if (!durations.length) return "Aucune donnée";

    // Moyenne en jours
    const avgDays = durations.reduce((a, b) => a + b, 0) / durations.length;

    // Convertir la moyenne en années / mois / jours / heures
    const years = Math.floor(avgDays / 365);
    const remainingDaysAfterYears = avgDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const remainingDaysAfterMonths = remainingDaysAfterYears % 30;
    const days = Math.floor(remainingDaysAfterMonths);
    const hours = Math.round((remainingDaysAfterMonths - days) * 24);

    // Construire une phrase naturelle
    const parts: string[] = [];
    if (years > 0) parts.push(`${years} an${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} mois`);
    if (days > 0 && years === 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
    if (hours > 0 && years === 0 && months === 0) parts.push(`${hours} heure${hours > 1 ? 's' : ''}`);

    const durationStr = parts.join(' et ');
    return `${durationStr}`;
  }


  refreshData() {
    this.ngOnInit();
  }

  export() {
    console.error("Fonctionnalité non implémentée");
  }
}
