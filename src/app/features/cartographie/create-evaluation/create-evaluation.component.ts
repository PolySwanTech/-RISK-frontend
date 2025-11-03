import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { Process } from '../../../core/models/Process';
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatrixService } from '../../../core/services/matrix/matrix.service';
import { MatrixComponent } from "../matrix/matrix.component";
import { RiskLevel, RiskLevelColor, RiskLevelEnum, RiskLevelScores } from '../../../core/enum/riskLevel.enum';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { ControlService } from '../../../core/services/dmr/control/control.service';
import { ControlTemplateListViewDto } from '../../../core/models/ControlTemplate';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { BuProcessAccordionComponent } from "../../../shared/components/bu-process-accordion/bu-process-accordion.component";
import { GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { AttenuationMetricsService } from '../../../core/services/dmr/attenuationMetrics/attenuation-metrics.service';
import { AttenuationMetrics } from '../../../core/models/AttenuationMetrics';
import { EvaluationControl, EvaluationControlLabels } from '../../../core/enum/evaluation-controle.enum';
import { Range } from '../../../core/models/range';
import { RiskEvaluationCreateDto } from '../../../core/models/RiskEvaluation';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';

interface Indicator {
  frequenceId: number;
  severiteId: number;
  riskLevel: RiskLevel
}

interface MatrixCell {
  severite: { id: number };
  frequence: { id: number };
  riskLevel: RiskLevel;
}


@Component({
  selector: 'app-create-evaluation',
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, MatCardModule, MatChipsModule, FormsModule,
    ReactiveFormsModule, GoBackComponent,
    MatStepperModule,
    MatButtonModule, BuProcessAccordionComponent, MatrixComponent, EnumLabelPipe],
  templateUrl: './create-evaluation.component.html',
  styleUrl: './create-evaluation.component.scss'
})
export class CreateEvaluationComponent implements OnInit {

  private evaluationSrv = inject(RiskEvaluationService);
  private attenuationSrv = inject(AttenuationMetricsService);

  private matrixService = inject(MatrixService);
  private controlService = inject(ControlService);
  private snackBarService = inject(SnackBarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Output() changeToEvaluationStep = new EventEmitter<void>();

  currentStep: number = 1;

  frequencyList: Range[] = [];
  severityList: Range[] = [];
  matrixData: any = [];

  financierIndirect: RiskLevelEnum | null = null;
  financierNonFinancier: RiskLevelEnum | null = null;

  highestRiskLevel: RiskLevelEnum | null = null;
  highestRiskLevelNet: RiskLevelEnum | null = null;
  riskLevels = Object.values(RiskLevelEnum);

  indicators: Indicator[] = [];

  controls: ControlTemplateListViewDto[] = [];

  selectedRisk: RiskTemplate | null = null;
  selectedBU: BusinessUnit | null = null;
  selectedProcess: Process | null = null;

  attenuationMetrics: AttenuationMetrics[] = [];


  severitiesMap: Map<number, number> = new Map();

  ngOnInit(): void {
    const dataIsInSessionStorage = this.route.snapshot.queryParams['data'] || false;
    const sessionStorageKey = this.route.snapshot.queryParams['key'] || false;

    if (dataIsInSessionStorage && sessionStorageKey) {
      const obj = JSON.parse(sessionStorage.getItem(sessionStorageKey) || "");
      sessionStorage.removeItem(sessionStorageKey);
      this.router.navigate([], {
        queryParams: {},
        replaceUrl: true
      });
      if (obj) {
        this.selectedBU = obj.bu
        this.selectedProcess = obj.process
        this.selectedRisk = obj.risk
        if (this.selectedBU && this.selectedProcess && this.selectedRisk) {
          
          this.getMatrix(this.selectedBU.id);
          this.getFrequenciesByBu(this.selectedBU.id);
          this.getSeveritiesByBu(this.selectedBU.id);
          this.controlService.getAllTemplates(this.selectedProcess.id, this.selectedRisk.id).subscribe(
            controls => this.controls = controls
          )
          this.attenuationSrv.getByRisk(this.selectedRisk.id).subscribe({
            next: metrics => this.attenuationMetrics = metrics,
            error: err => console.error('Erreur chargement atténuations', err)
          });
        }
      }
    }
  }

  getRiskLevelFromSeverityFrequencySelected(sev: Range) {
    return this.indicators.find(i => i.severiteId == sev.id)!.riskLevel.name || RiskLevelEnum.HIGH
  }

  getRiskColorEnum(riskLevel: RiskLevelEnum) {
    return RiskLevelColor[riskLevel];
  }

  gotoSteppe3(event: any) {
    this.highestRiskLevelNet = this.highestRiskLevel;
    console.log(this.highestRiskLevelNet);
    if (this.highestRiskLevel && this.selectedRisk) {
      const riskEvaluationCreateDto: RiskEvaluationCreateDto = {
        riskId: this.selectedRisk.id,
        evaluation: this.highestRiskLevel,
        indicators: this.indicators.map(i => ({frequenceId: i.frequenceId, severiteId: i.severiteId})),
        brut: false,
        commentaire: "" // TODO ajouter un champ commentaire dans le formulaire
      };
      console.log(riskEvaluationCreateDto);
      this.evaluationSrv.saveEvaluation(riskEvaluationCreateDto)
        .subscribe(
          {
            next: _ => {
              this.snackBarService.info("Evaluation sauvegardée");
              event.next();
            },
            error : err => {
              this.snackBarService.info("Une évaluation de cet évènement de risque redouté, existe déjà");
              window.location.reload();
            }
          }
        )
    }
  }

  getMatrix(id: string) {
    this.matrixService.getDefaultMatrix(id).subscribe({
      next: resp => {
        this.matrixData = resp;

      },
      error: err => console.error(err)
    });
  }

  getFrequenciesByBu(buId: string) {
    this.matrixService.getFrequenciesByBu(buId).subscribe({
      next: resp => {
        this.frequencyList = resp;

      },
      error: err => console.error(err)
    });
  }

  getSeveritiesByBu(buId: string) {
    this.matrixService.getSeveritiesByBu(buId).subscribe({
      next: resp => {
        this.severityList = resp;
        this.severityList.forEach(s => this.severitiesMap.set(s.id, 0))

      },
      error: err => console.error(err)
    });
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

  updateRisk(severity: Range) {

    let frequency = this.severitiesMap.get(severity.id) || -1;

    if (frequency != -1) {

      const cell: MatrixCell | undefined = this.matrixData.cells.find(
        (c: MatrixCell) => c.severite.id == severity.id && c.frequence.id == frequency);

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

      // toujours recalculer après chaque changement
      this.updateHighestRisk();
    }
  }

  updateHighestRisk() {
    const selectedRisks: RiskLevelEnum[] = [];

    this.indicators.map(s => s.riskLevel.name).forEach(r => selectedRisks.push(r))
    // risques venant des selects "Financier Indirect" et "Non Financier"
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

  getContrastColor(hexColor: string): string {
    if (!hexColor) return '#000';
    const c = hexColor.substring(1); // supprime #
    const rgb = parseInt(c, 16); // convertit en nombre
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  }

  saveEvaluation(stepper: any): void {

    if (this.highestRiskLevelNet && this.selectedRisk) {
      const riskEvaluationCreateDto: RiskEvaluationCreateDto = {
        riskId: this.selectedRisk.id,
        evaluation: this.highestRiskLevelNet,
        indicators: this.indicators.map(i => ({frequenceId: i.frequenceId, severiteId: i.severiteId})),
        brut: false,
        commentaire: "" // TODO ajouter un champ commentaire dans le formulaire
      };
      console.log(riskEvaluationCreateDto);
      this.evaluationSrv.saveEvaluation(riskEvaluationCreateDto).subscribe(
        _ => {
          this.snackBarService.info("Evaluation sauvegardée");
          stepper.next();
        }
      )
    }
  }

  newEvaluation(): void {
    window.location.reload();
  }
}
