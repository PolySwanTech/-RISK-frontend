import { MatButtonModule } from '@angular/material/button';
import { Component, inject, OnInit } from '@angular/core';
import { UtilisateurService } from '../../core/services/utilisateur/utilisateur.service';
import { MatCardModule } from '@angular/material/card';
import { MatrixComponent } from "../../features/risk/matrix/matrix.component";
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
import { RiskDetailsComponent } from "../../features/risk/risk-details/risk-details.component";
import { EquipeService } from '../../core/services/equipe/equipe.service';
import { Router } from '@angular/router';
import { EntitiesService } from '../../core/services/entities/entities.service';
@Component({
  selector: 'app-risk-page',
  imports: [MatCardModule, MatrixComponent, MatIconModule,
    MatOptionModule, MatSelectModule, MatFormFieldModule, FormsModule, MatButtonModule, RiskDetailsComponent],
  templateUrl: './risk-page.component.html',
  styleUrl: './risk-page.component.scss'
})
export class RiskPageComponent {

  selectedNiveau: string | null = 'all';
  selectedBU: string | null = 'all';

  selectedRisk: any = null;

  buNameList: string[] = [];

  
  risks: any[] = [
    {
      "id": "R1",
      "name": "Le risque numéro 1",
      "description": "Risque de défaillance du système central de la banque pouvant entraîner une interruption des services clientèle ou une interruption des services Plan central.",
      "level": "Critique",
      "bu_name": "Direction IT",
      "frequency": 5,
      "impact": 5,
      "processus": "Processus de gestion des incidents",
      "sub_category": "Système central",
      "controls": [
        "Plan de continuité d'activité",
        "Redondance des systèmes",
        "Tests de récupération des systèmes"
      ]
    },
    {
      "id": "R4",
      "name": "Le risque numéro 4",
      "description": "Risque de défaillance du système central de la banque pouvant entraîner une interruption des services clientèle ou une interruption des services Plan central.",
      "level": "Moyen",
      "bu_name": "BU2",
      "frequency": 2,
      "impact": 3,
      "processus": "Processus de gestion des incidents",
      "sub_category": "Système central",
      "controls": [
        "Plan de continuité d'activité",
        "Redondance des systèmes",
        "Tests de récupération des systèmes"
      ]
    },
    {
      "id": "R7",
      "name": "Le risque numéro 7",
      "description": "Risque de défaillance du système central de la banque pouvant entraîner une interruption des services clientèle ou une interruption des services Plan central.",
      "level": "Moyen",
      "bu_name": "Direction IT",
      "frequency": 2,
      "impact": 3,
      "processus": "Processus de gestion des incidents",
      "sub_category": "Système central",
      "controls": [
        "Plan de continuité d'activité",
        "Redondance des systèmes",
        "Tests de récupération des systèmes"
      ]
    },
    {
      "id": "R3",
      "name": "Le risque numéro 3",
      "description": "Risque de défaillance du système central de la banque pouvant entraîner une interruption des services clientèle ou une interruption des services Plan central.",
      "level": "Très faible",
      "bu_name": "BU1",
      "frequency": 1,
      "impact": 2,
      "processus": "Processus de gestion des incidents",
      "sub_category": "Système central",
      "controls": [
        "Plan de continuité d'activité",
        "Redondance des systèmes",
        "Tests de récupération des systèmes"
      ]
    },
    {
      "id": "R5",
      "name": "Le risque numéro 5",
      "description": "Risque de défaillance du système central de la banque pouvant entraîner une interruption des services clientèle ou une interruption des services Plan central.",
      "level": "Élevé",
      "bu_name": "BU2",
      "frequency": 3,
      "impact": 5,
      "processus": "Processus de gestion des incidents",
      "sub_category": "Système central",
      "controls": [
        "Plan de continuité d'activité",
        "Redondance des systèmes",
        "Tests de récupération des systèmes"
      ]
    },
    {
      "id": "R6",
      "name": "Le risque numéro 6",
      "description": "Risque de défaillance du système central de la banque pouvant entraîner une interruption des services clientèle ou une interruption des services Plan central.",
      "level": "Faible",
      "bu_name": "BU1",
      "frequency": 3,
      "impact": 1,
      "processus": "Processus de gestion des incidents",
      "sub_category": "Système central",
      "controls": [
        "Plan de continuité d'activité",
        "Redondance des systèmes",
        "Tests de récupération des systèmes"
      ]
    }
  ]

  filteredRisks: any[] = [];

  private equipeService = inject(EntitiesService);
  private router = inject(Router);

  clearFilters(): void {
    this.selectedNiveau = null;
    this.selectedBU = null;
    this.applyFilters();
  }

  ngOnInit(): void {
    this.getAllBUs()
    this.filteredRisks = [...this.risks];
  }

  refreshData(){
    this.ngOnInit();
  }

  getAllBUs() {
    this.equipeService.loadEntities().forEach(resp => {
      this.buNameList = resp.map(equipe => equipe.name);
    });
  }

  applyFilters(): void {
    let tempRisks = [...this.risks]; // Start with the full list of risks

 
    if (this.selectedBU && this.selectedBU !== 'all') {
      tempRisks = tempRisks.filter(risk => risk.bu_name === this.selectedBU);
      console.log(tempRisks);
    }

   
    if (this.selectedNiveau && this.selectedNiveau !== 'all') {
        tempRisks = tempRisks.filter(risk => {
            // Map your level strings to a comparable value if needed, or directly compare
            // For example, if 'low', 'medium', 'high' correspond to specific levels
            const riskLevel = risk.level.toLowerCase(); // Convert to lowercase for consistent comparison
            switch (this.selectedNiveau) {
                case 'low': return riskLevel === 'faible' || riskLevel === 'très faible';
                case 'medium': return riskLevel === 'moyen';
                case 'high': return riskLevel === 'élevé' || riskLevel === 'critique';
                default: return true; // Should not happen with 'all' handled
            }
        });
    }

    this.filteredRisks = tempRisks; // Update the array passed to the matrix
 
  }

  onSelectRisk(selected: any): void {
    console.log('Selected risk:', selected);
    this.selectedRisk = selected;
  }

  goToAddRisk(): void {
    this.router.navigate(
      ['reglages', 'risks', 'create']
    );
  }

  handleModifyRisk(risk: any): void {
    // this.selectedRisk = risk;
  }
}