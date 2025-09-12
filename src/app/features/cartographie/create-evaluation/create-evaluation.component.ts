import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RiskService } from '../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process, ProcessNode } from '../../../core/models/Process';
import { ControlService } from '../../../core/services/control/control.service';
import { ControlTemplate } from '../../../core/models/ControlTemplate';
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation/risk-evaluation.service';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { EvalRiskProcessComponent } from '../create-carto/eval-risk-process/eval-risk-process.component';

@Component({
  selector: 'app-create-evaluation',
  imports: [FormsModule, CommonModule, EvalRiskProcessComponent],
  templateUrl: './create-evaluation.component.html',
  styleUrl: './create-evaluation.component.scss'
})
export class CreateEvaluationComponent implements OnInit {

  private riskService = inject(RiskService);
  private processService = inject(ProcessService);
  private evaluationSrv = inject(RiskEvaluationService);
  private controlService = inject(ControlService);
  private entityService = inject(EntitiesService);
  private IncidentService = inject(IncidentService);


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

  ngOnInit(): void {
    this.entityService.loadEntities().subscribe((entities: BusinessUnit[]) => {
      this.fetchProcesses(entities);
    });

    this.riskService.getAll().subscribe(risks => {
      this.risks = risks;
    });

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
          id: `bu-${entity.name}`,
          lm : entity.lm,
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
      lm : parent.lm,
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
      lm : child.lm,
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

  onSaveEvaluation(){
    this.selectedProcess = null;
    this.selectedRisk = null;
  }

  onRiskChange(): void {
    this.selectedBU = null;
    this.selectedProcess = null;
  }

  selectBusinessUnit(bu: ProcessNode): void {
    this.selectedBU = bu;
    this.selectedProcess = null;
  }

  selectProcess(process: ProcessNode): void {
    this.selectedProcess = process;
    if (this.selectedRisk && this.selectedProcess) {
      this.currentStep = 2;
    }
  }

  onImageSeverityChange(event: any): void {
    this.imageSeverity = parseInt(event.target.value);
  }

  onImageFrequencyChange(event: any): void {
    this.imageFrequency = parseInt(event.target.value);
  }

  onJudicialSeverityChange(event: any): void {
    this.judicialSeverity = parseInt(event.target.value);
  }

  onJudicialFrequencyChange(event: any): void {
    this.judicialFrequency = parseInt(event.target.value);
  }

  getSeverityLabel(value: number): string {
    switch(value) {
      case 1: return 'Faible';
      case 2: return 'Modérée';
      case 3: return 'Moyenne';
      case 4: return 'Élevée';
      case 5: return 'Critique';
      default: return '';
    }
  }

  getFrequencyLabel(value: number): string {
    switch(value) {
      case 1: return 'Rare';
      case 2: return 'Occasionnelle';
      case 3: return 'Intermittente';
      case 4: return 'Fréquente';
      case 5: return 'Continue';
      default: return '';
    }
  }

  getFinancialImpactLabel(): string {
    switch(this.financialImpact) {
      case 1: return 'Faible';
      case 2: return 'Modéré';
      case 3: return 'Significatif';
      case 4: return 'Élevé';
      case 5: return 'Critique';
      default: return 'Non défini';
    }
  }

  calculateOverallRisk(): string {
    // Logique simplifiée pour calculer le risque global
    const avg = (this.financialImpact + this.imageSeverity + this.imageFrequency + 
                this.judicialSeverity + this.judicialFrequency) / 5;
    
    if (avg < 2) return 'Faible';
    if (avg < 3) return 'Modéré';
    if (avg < 4) return 'Significatif';
    if (avg < 4.5) return 'Élevé';
    return 'Critique';
  }

  saveEvaluation(): void {
    // Préparer les données pour l'enregistrement
    const evaluationData = {
      riskId: this.selectedRisk?.id.id,
      processId: this.selectedProcess?.id,
      financialImpact: this.financialImpact,
      imageSeverity: this.imageSeverity,
      imageFrequency: this.imageFrequency,
      judicialSeverity: this.judicialSeverity,
      judicialFrequency: this.judicialFrequency,
      overallRisk: this.calculateOverallRisk()
    };
this.currentStep = 3;
    // Appel au service pour enregistrer
    // this.evaluationSrv.save(evaluationData).subscribe({
    //   next: () => {
    //     this.currentStep = 3;
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
  }
}
