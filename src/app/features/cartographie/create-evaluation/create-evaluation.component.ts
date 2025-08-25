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
          console.log(resp)
        },
        error: err => {
          console.error(err)
        }
      })
  }

  onSaveEvaluation(){
    this.selectedProcess = null;
    this.selectedRisk = null;
  }
}
