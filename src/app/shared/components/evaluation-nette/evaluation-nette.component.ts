import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { Process } from '../../../core/models/Process';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { RiskLevelColor, RiskLevelEnum } from '../../../core/enum/riskLevel.enum';
import { ControlTemplateListViewDto } from '../../../core/models/ControlTemplate';
import { AttenuationMetrics } from '../../../core/models/AttenuationMetrics';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';
import { ControlService } from '../../../core/services/dmr/control/control.service';
import { AttenuationMetricsService } from '../../../core/services/dmr/attenuationMetrics/attenuation-metrics.service';
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation.service';
import { RiskEvaluationCreateDto } from '../../../core/models/RiskEvaluation';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';

@Component({
  selector: 'app-evaluation-nette',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    EnumLabelPipe
  ],
  templateUrl: './evaluation-nette.component.html',
  styleUrl: './evaluation-nette.component.scss'
})
export class EvaluationNetteComponent implements OnInit {
  private controlService = inject(ControlService);
  private attenuationSrv = inject(AttenuationMetricsService);
  private evaluationSrv = inject(RiskEvaluationService);
  private snackBarService = inject(SnackBarService);

  @Input() selectedRisk!: RiskTemplate;
  @Input() selectedBU!: BusinessUnit;
  @Input() selectedProcess!: Process;
  @Input() initialRiskLevel!: RiskLevelEnum;
  @Input() bruteIndicators!: Array<{frequenceId: number, severiteId: number}>;

  @Output() onSave = new EventEmitter<void>();
  @Output() onPrevious = new EventEmitter<void>();

  // Données chargées en interne
  controls: ControlTemplateListViewDto[] = [];
  attenuationMetrics: AttenuationMetrics[] = [];

  highestRiskLevelNet: RiskLevelEnum | null = null;
  riskLevels = Object.values(RiskLevelEnum);

  ngOnInit(): void {
    this.highestRiskLevelNet = this.initialRiskLevel;
    this.loadData();
  }

  private loadData(): void {
    if (!this.selectedProcess || !this.selectedRisk) return;

    // Charger les contrôles
    this.controlService.getAllTemplates(this.selectedProcess.id, this.selectedRisk.id).subscribe({
      next: controls => this.controls = controls,
      error: err => console.error('Erreur chargement contrôles', err)
    });

    // Charger les mesures d'atténuation
    this.attenuationSrv.getByRisk(this.selectedRisk.id).subscribe({
      next: metrics => this.attenuationMetrics = metrics,
      error: err => console.error('Erreur chargement atténuations', err)
    });
  }

  getRiskColorEnum(riskLevel: RiskLevelEnum): string {
    return RiskLevelColor[riskLevel];
  }

  getContrastColor(hexColor: string): string {
    if (!hexColor) return '#000';
    const c = hexColor.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  }

  handlePrevious(): void {
    this.onPrevious.emit();
  }

  handleSave(): void {
    if (this.highestRiskLevelNet && this.selectedRisk) {
      const riskEvaluationCreateDto: RiskEvaluationCreateDto = {
        riskId: this.selectedRisk.id,
        evaluation: this.highestRiskLevelNet,
        indicators: this.bruteIndicators,
        brut: false,
        commentaire: ""
      };
      
      this.evaluationSrv.saveEvaluation(riskEvaluationCreateDto).subscribe({
        next: _ => {
          this.snackBarService.info("Évaluation nette sauvegardée");
          this.onSave.emit();
        },
        error: err => {
          this.snackBarService.info("Erreur lors de la sauvegarde");
          console.error(err);
        }
      });
    }
  }
}