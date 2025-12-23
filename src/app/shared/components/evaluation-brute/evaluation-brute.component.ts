import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { Process } from '../../../core/models/Process';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { RiskLevel, RiskLevelColor, RiskLevelEnum, RiskLevelScores } from '../../../core/enum/riskLevel.enum';
import { Range } from '../../../core/models/range';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';
import { MatrixService } from '../../../core/services/matrix/matrix.service';
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation.service';
import { RiskEvaluationCreateDto } from '../../../core/models/RiskEvaluation';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { MatrixComponent } from '../../../features/cartographie/matrix/matrix.component';
import { GoBackComponent } from '../go-back/go-back.component';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { IncidentListDto } from '../../../core/models/Incident';

interface Indicator {
  frequenceId: number;
  severiteId: number;
  riskLevel: RiskLevel;
}

interface MatrixCell {
  severite: { id: number };
  frequence: { id: number };
  riskLevel: RiskLevel;
}

@Component({
  selector: 'app-evaluation-brute',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatrixComponent,
    EnumLabelPipe,
    GoBackComponent
  ],
  templateUrl: './evaluation-brute.component.html',
  styleUrl: './evaluation-brute.component.scss'
})
export class EvaluationBruteComponent implements OnInit {
  private matrixService = inject(MatrixService);
  private incidentService = inject(IncidentService);
  private evaluationSrv = inject(RiskEvaluationService);
  private snackBarService = inject(SnackBarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  selectedRisk: RiskTemplate | null = null;
  selectedBU: BusinessUnit | null = null;
  selectedProcess: Process | null = null;

  actualFrequency: number = -1;
  actualSeverity: number = -1;

  // Données chargées en interne
  frequencyList: Range[] = [];
  severityList: Range[] = [];
  matrixData: any = null;

  financierIndirect: RiskLevelEnum | null = null;
  financierNonFinancier: RiskLevelEnum | null = null;
  highestRiskLevel: RiskLevelEnum | null = null;
  riskLevels = Object.values(RiskLevelEnum);

  indicators: Indicator[] = [];
  severitiesMap: Map<number, number> = new Map();

  incidents: IncidentListDto[] = [];

  ngOnInit(): void {
    this.loadDataFromSessionStorage();

    if (this.selectedRisk && this.selectedBU && this.selectedProcess) {
      this.loadData();
    } else {
      this.snackBarService.info("Données manquantes pour l'évaluation");
      this.router.navigate(['/cartographie']);
    }

    if (this.selectedRisk) {
      this.incidentService.getIncidentByProcessAndRisk(this.selectedRisk.id).subscribe({
        next: resp => {
          this.incidents = resp;
          this.actualFrequency = resp.length;
          this.actualSeverity = resp.reduce((sum, incident) => {
            // Le '+' force la conversion en nombre pour éviter les erreurs de type
            return sum + (+incident.totalLossAmount || 0);
          }, 0);
        },
        error: err => console.error('Erreur chargement incidents', err)
      });
    }
  }

  private loadDataFromSessionStorage(): void {
    const dataIsInSessionStorage = this.route.snapshot.queryParams['data'] || false;
    const sessionStorageKey = this.route.snapshot.queryParams['key'] || 'object_for_carto';

    if (dataIsInSessionStorage && sessionStorageKey) {
      const obj = JSON.parse(sessionStorage.getItem(sessionStorageKey) || "{}");

      if (obj) {
        this.selectedBU = obj.bu;
        this.selectedProcess = obj.process;
        this.selectedRisk = obj.risk;
      }
    }
  }

  private loadData(): void {
    if (!this.selectedBU) return;

    // Charger la matrice
    this.matrixService.getDefaultMatrix(this.selectedBU.id).subscribe({
      next: resp => this.matrixData = resp,
      error: err => console.error('Erreur chargement matrice', err)
    });

    // Charger les fréquences
    this.matrixService.getFrequenciesByBu(this.selectedBU.id).subscribe({
      next: resp => this.frequencyList = resp,
      error: err => console.error('Erreur chargement fréquences', err)
    });

    // Charger les sévérités
    this.matrixService.getSeveritiesByBu(this.selectedBU.id).subscribe({
      next: resp => {
        this.severityList = resp;
        this.severityList.forEach(s => this.severitiesMap.set(s.id, 0));
      },
      error: err => console.error('Erreur chargement sévérités', err)
    });
  }

  getRiskLevelFromSeverityFrequencySelected(sev: Range): RiskLevelEnum {
    return this.indicators.find(i => i.severiteId === sev.id)?.riskLevel.name || RiskLevelEnum.HIGH;
  }

  getRiskColorEnum(riskLevel: RiskLevelEnum): string {
    return RiskLevelColor[riskLevel];
  }

  getClassByIndex(index: number): string {
    const classes = [
      'impact-faible',
      'impact-modere',
      'impact-significatif',
      'impact-eleve',
      'impact-critique'
    ];
    return classes[index] || '';
  }

  getSeverityValue(id: number): number {
    return this.severitiesMap.get(id) ?? 0;
  }

  setSeverityValue(id: number, value: number): void {
    this.severitiesMap.set(id, value);
  }

  updateRisk(severity: Range): void {
    const frequency = this.severitiesMap.get(severity.id) || -1;

    if (frequency !== -1) {
      const cell: MatrixCell | undefined = this.matrixData.cells.find(
        (c: MatrixCell) => c.severite.id === severity.id && c.frequence.id === frequency
      );

      if (cell) {
        const existingIndex = this.indicators.findIndex(ind => ind.severiteId === severity.id);
        const updatedIndicator: Indicator = {
          severiteId: severity.id,
          frequenceId: frequency,
          riskLevel: cell.riskLevel
        };

        if (existingIndex !== -1) {
          this.indicators[existingIndex] = updatedIndicator;
        } else {
          this.indicators.push(updatedIndicator);
        }
      }

      this.updateHighestRisk();
    }
  }

  updateHighestRisk(): void {
    const selectedRisks: RiskLevelEnum[] = [];

    this.indicators.forEach(s => selectedRisks.push(s.riskLevel.name));

    if (this.financierIndirect) {
      selectedRisks.push(this.financierIndirect);
    }
    if (this.financierNonFinancier) {
      selectedRisks.push(this.financierNonFinancier);
    }

    if (!selectedRisks.length) {
      this.highestRiskLevel = null;
      return;
    }

    this.highestRiskLevel = selectedRisks.reduce(
      (max: RiskLevelEnum, current: RiskLevelEnum) =>
        RiskLevelScores[current] > RiskLevelScores[max] ? current : max
    );
  }

  handleCancel(): void {
    this.router.navigate(['/cartographie']);
  }

  handleNext(): void {
    if (this.highestRiskLevel && this.selectedRisk) {
      const indicators = this.indicators.map(i => ({
        frequenceId: i.frequenceId,
        severiteId: i.severiteId
      }));

      const riskEvaluationCreateDto: RiskEvaluationCreateDto = {
        riskId: this.selectedRisk.id,
        evaluation: this.highestRiskLevel,
        indicators: indicators,
        brut: true,
        commentaire: ""
      };

      this.evaluationSrv.saveEvaluation(riskEvaluationCreateDto).subscribe({
        next: _ => {
          this.snackBarService.info("Évaluation brute sauvegardée");

          // Rediriger vers l'évaluation nette
          const sessionStorageKey = this.route.snapshot.queryParams['key'] || 'object_for_carto';
          this.router.navigate(['/cartographie/evaluation-nette'], {
            queryParams: { data: true, key: sessionStorageKey }
          });
        },
        error: err => {
          this.snackBarService.info("Une évaluation de cet évènement de risque existe déjà");
          console.error(err);
        }
      });
    }
  }
}