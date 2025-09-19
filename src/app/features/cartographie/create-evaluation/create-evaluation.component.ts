import { ControlEvaluation } from './../../../core/models/ControlEvaluation';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RiskService } from '../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process, ProcessNode } from '../../../core/models/Process';
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation/risk-evaluation.service';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { EvalRiskProcessComponent } from '../create-carto/eval-risk-process/eval-risk-process.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatrixService } from '../../../core/services/matrix/matrix.service';
import { MatrixComponent } from "../matrix/matrix.component";
import { RiskLevelColor, RiskLevelEnum, RiskLevelLabels, RiskLevelScores } from '../../../core/enum/riskLevel.enum';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { ControlService } from '../../../core/services/control/control.service';
import { ControlTemplate } from '../../../core/models/ControlTemplate';
import { Recurrence, RecurrenceLabels } from '../../../core/enum/recurrence.enum';
import { Degree, DegreeLabels } from '../../../core/enum/degree.enum';
import { ControlTypeLabels, Type } from '../../../core/enum/controltype.enum';
import { BuProcessAccordionComponent } from "../../../shared/components/bu-process-accordion/bu-process-accordion.component";

@Component({
  selector: 'app-create-evaluation',
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatSelectModule, MatCardModule, MatChipsModule, FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule, BuProcessAccordionComponent],
  templateUrl: './create-evaluation.component.html',
  styleUrl: './create-evaluation.component.scss'
})
export class CreateEvaluationComponent implements OnInit {

  private riskService = inject(RiskService);
  private processService = inject(ProcessService);
  private evaluationSrv = inject(RiskEvaluationService);
  private entityService = inject(EntitiesService);
  private matrixService = inject(MatrixService);
  private controlService = inject(ControlService);


  @Output() changeToEvaluationStep = new EventEmitter<void>();

  risks: any[] = [];

  selectedYear = new Date().getFullYear();

  selectedRisk: any | null = null;
  selectedProcess: ProcessNode | null = null;

  processes: Process[] = [];

  hierarchicalProcesses: ProcessNode[] = [];
  filteredProcesses: ProcessNode[] = [];

  evaluations = [];

  currentStep: number = 1;
  selectedBU: ProcessNode | null = null;
  financialImpact: number = 0;
  imageSeverity: number = 3;
  imageFrequency: number = 2;
  judicialSeverity: number = 1;
  judicialFrequency: number = 1;

  frequencyList: any[] = [];
  severityList: any[] = [];
  matrixData: any = [];

  financierIndirect: RiskLevelEnum | null = null;
  financierNonFinancier: RiskLevelEnum | null = null;

  highestRiskLevel: RiskLevelEnum | null = null;
  highestRiskLevelNet: RiskLevelEnum | null = null;
  riskLevels = Object.values(RiskLevelEnum);

  controls: ControlTemplate[] = [];

  selectedBPR : any = null;

  ngOnInit(): void {
    this.entityService.loadEntities().subscribe((entities: BusinessUnit[]) => {
      this.fetchProcesses(entities);
    });
  }

  getRiskLevelEnum(riskLevel: RiskLevelEnum) {
    return RiskLevelLabels[riskLevel];
  }

  getRiskColorEnum(riskLevel: RiskLevelEnum) {
    return RiskLevelColor[riskLevel];
  }

  getRecLabel(rec: Recurrence) {
    return RecurrenceLabels[rec];
  }

  getDegreeLabels(degree: Degree) {
    return DegreeLabels[degree];
  }

  getControlTypeLabels(controlType: Type) {
    return ControlTypeLabels[controlType];
  }

  gotoSteppe3(event: any) {
    this.highestRiskLevelNet = this.highestRiskLevel;
    event.next();
  }

  fetchProcesses(allEntities: BusinessUnit[]): void {
    this.processService.getAll().subscribe((data: any[]) => {
      this.processes = data;
      this.buildHierarchy(allEntities);
      this.filteredProcesses = [...this.hierarchicalProcesses];
    });
  }

  buildHierarchy(allEntities: BusinessUnit[]): void {
    const buMap = new Map<string, Process[]>();

    this.processes.forEach(process => {
      const buName = process.buName;
      if (!buMap.has(buName)) {
        buMap.set(buName, []);
      }
      buMap.get(buName)!.push(process);
    });

    this.hierarchicalProcesses = allEntities
      .map(entity => {
        const processes = buMap.get(entity.name) || [];
        return {
          id: `${entity.id}`,
          lm: entity.lm,
          name: entity.name,
          niveau: 0,
          type: 'bu' as const,
          children: this.buildBUChildren(processes)
        };
      });
  }

  private buildBUChildren(processes: any[]): ProcessNode[] {
    // Séparer les parents (pas de parentName) des enfants
    const parents = processes.filter(p => !p.parentName);
    const children = processes.filter(p => p.parentName);

    return parents.map(parent => ({
      id: parent.id,
      lm: parent.lm,
      name: parent.name,
      niveau: parent.niveau,
      type: this.determineNodeType(parent),
      buName: parent.buName,
      parentName: parent.parentName,
      children: this.findChildren(parent.name, children)
    }));
  }

  private findChildren(parentName: string, allChildren: any[]): ProcessNode[] {
    const directChildren = allChildren.filter(child => child.parentName === parentName);

    return directChildren.map(child => ({
      id: child.id,
      lm: child.lm,
      name: child.name,
      niveau: child.niveau,
      type: this.determineNodeType(child),
      buName: child.buName,
      parentName: child.parentName,
      children: this.findChildren(child.name, allChildren.filter(c => c.id !== child.id))
    }));
  }

  private determineNodeType(process: any): 'parent' | 'child' {
    return process.parentName ? 'child' : 'parent';
  }

  getProcessByRisks(risk: RiskTemplate) {
    this.selectedRisk = risk;
    this.processService.getAllByRisks(risk.id.id).subscribe(processes => {
      this.processes = processes;
    });
  }

  getMatrix(id: string) {
    this.matrixService.getDefaultMatrix(id).subscribe({
      next: resp => {
        console.log(resp);
        this.matrixData = resp;

      },
      error: err => console.error(err)
    });
  }

  getFrequenciesByBu(buId: string) {
    this.matrixService.getFrequenciesByBu(buId).subscribe({
      next: resp => {
        console.log(resp);
        this.frequencyList = resp;

      },
      error: err => console.error(err)
    });
  }

  getSeveritiesByBu(buId: string) {
    this.matrixService.getSeveritiesByBu(buId).subscribe({
      next: resp => {
        console.log(resp);
        this.severityList = resp;

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

  updateRisk(severityId: number, frequencyId: number) {
    interface MatrixCell {
      severite: { id: number };
      frequence: { id: number };
      riskLevel: RiskLevelEnum;
    }

    const cell: MatrixCell | undefined = this.matrixData.cells.find(
      (c: MatrixCell) => c.severite.id == severityId && c.frequence.id == Number(frequencyId)
    );

    if (cell) {
      // retrouver la sévérité concernée et lui attacher le niveau de risque
      const sev = this.severityList.find(s => s.id == severityId);
      if (sev) {
        sev.riskLevel = cell.riskLevel; // ⚡ maintenant une string (ex: "LOW")
      }
      console.log("➡️ Sévérité mise à jour :", sev);
    }

    // toujours recalculer après chaque changement
    this.updateHighestRisk();
  }

  updateHighestRisk() {
    const selectedRisks: RiskLevelEnum[] = [];

    // risques venant de la matrice
    this.severityList.forEach(s => {
      if (s.riskLevel) {
        selectedRisks.push(s.riskLevel.name); // ✅ plus de .name
      }
    });

    // risques venant des selects "Financier Indirect" et "Non Financier"
    if (this.financierIndirect) {
      selectedRisks.push(this.financierIndirect);
    }
    if (this.financierNonFinancier) {
      selectedRisks.push(this.financierNonFinancier);
    }

    console.log("➡️ Niveaux de risque sélectionnés :", selectedRisks);

    if (!selectedRisks.length) {
      this.highestRiskLevel = null;
      return;
    }

    this.highestRiskLevel = selectedRisks.reduce(
      (max: RiskLevelEnum, current: RiskLevelEnum) =>
        RiskLevelScores[current] > RiskLevelScores[max] ? current : max
    );

    console.log("➡️ Highest Risk Level =", this.highestRiskLevel);
  }

  trackByProcessId = (_: number, p: ProcessNode) => p.id;

  onSelectProcess(p: ProcessNode) {
    this.selectedProcess = p;
    this.changeToEvaluationStep.emit();
  }

  submitEvaluation(data: any) {
    const payload: any = {
      commentaire: data.commentaire!,
      probability: data.probability!,
      riskNet: data.riskNet!,
      riskId: this.selectedRisk.id.id,
    };

    this.evaluationSrv.save(payload).subscribe(
      {
        next: resp => {
        },
        error: err => {
        }
      })
  }

  onSaveEvaluation() {
    this.selectedProcess = null;
    this.selectedRisk = null;
  }

  onRiskChange(event: any): void {
    this.currentStep = 2;
    this.selectedBPR = event;
    this.selectedBU = event.bu
    if (this.selectedBU) {
      this.getMatrix(this.selectedBU.id);
      this.getFrequenciesByBu(this.selectedBU.id);
      this.getSeveritiesByBu(this.selectedBU.id);
    }

    this.selectedProcess = event.process
    this.selectedRisk = event.risk

    this.controlService.getAllTemplatesByProcessAndRisk(this.selectedProcess, this.selectedRisk!).subscribe(controls => {
      console.log(controls);
      this.controls = controls;
    });
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

  selectBusinessUnit(bu: ProcessNode): void {
    this.selectedBU = bu;
    this.getMatrix(bu.id);
    this.getFrequenciesByBu(bu.id);
    this.getSeveritiesByBu(bu.id);
    this.selectedProcess = null;
  }

  selectProcess(process: ProcessNode): void {
    this.selectedProcess = process;
    console.log(this.selectedProcess)
    this.riskService.getAllByProcess(this.selectedProcess?.id).subscribe(risks => {
      this.risks = risks;
      console.log(risks)
    });

    if (this.selectedRisk && this.selectedProcess) {
      this.currentStep = 2;
    }
  }

  saveEvaluation(stepper: any): void {
    // Préparer les données pour l'enregistrement
    const evaluationData = {
      riskId: this.selectedRisk?.id.id,
      processId: this.selectedProcess?.id,
      frequencyList: this.frequencyList,
      financierIndirect: this.financierIndirect,
      financierNonFinancier: this.financierNonFinancier,
      highestRiskLevel: this.highestRiskLevel,
      highestRiskLevelNet: this.highestRiskLevelNet
    };

    console.log(evaluationData);

    stepper.next();
    // this.evaluationSrv.save(evaluationData).subscribe({
    //   next: () => {
    //     stepper.next();
    //   },
    //   error: (err) => {
    //     console.error('Erreur lors de l\'enregistrement', err);
    //   }
    // });
  }

  newEvaluation(): void {
    this.currentStep = 1;
    this.selectedRisk = null;
    this.selectedBU = null;
    this.selectedProcess = null;
    this.financialImpact = 0;
    this.imageSeverity = 3;
    this.imageFrequency = 2;
    this.judicialSeverity = 1;
    this.judicialFrequency = 1;
    this.highestRiskLevel = null;
  }
}
