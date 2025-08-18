import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RiskService } from '../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process, ProcessNode } from '../../../core/models/Process';
import { ImpactService } from '../../../core/services/impact/impact.service';
import { ControlService } from '../../../core/services/control/control.service';
import { ControlTemplate } from '../../../core/models/ControlTemplate';
import { CreateRisksEvaluationsComponent } from "../../reglages/risks/risk-evaluation/create-risks-evaluations/create-risks-evaluations.component";
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation/risk-evaluation.service';
import { Router } from '@angular/router';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { Incident } from '../../../core/models/Incident';
import { IncidentService } from '../../../core/services/incident/incident.service';

@Component({
  selector: 'app-create-evaluation',
  imports: [CurrencyPipe, FormsModule, CommonModule, CreateRisksEvaluationsComponent],
  templateUrl: './create-evaluation.component.html',
  styleUrl: './create-evaluation.component.scss'
})
export class CreateEvaluationComponent implements OnInit {

  private riskService = inject(RiskService);
  private processService = inject(ProcessService);
  private evaluationSrv = inject(RiskEvaluationService);
  private impactService = inject(ImpactService);
  private controlService = inject(ControlService);
  private entityService = inject(EntitiesService);
  private IncidentService = inject(IncidentService);

  risks: any[] = [];

  selectedYear = new Date().getFullYear();

  totalImpact = 0

  selectedRisk: any | null = null;
  selectedProcess: ProcessNode |null = null;
  selectedControl: ControlTemplate | null = null;

  processes: Process[] = [];

  hierarchicalProcesses: ProcessNode[] = [];
  filteredProcesses: ProcessNode[] = [];

  controls: ControlTemplate[] = []

  incidents: Incident[] = [];

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
    console.log('Selected Risk:', risk);
    this.processService.getAllByRisks(risk.id.id).subscribe(processes => {
      this.processes = processes;
      this.totalImpact = 0;
      // this.processes.forEach(process => {
      //   this.impactService.sumByProcess(process.id).subscribe(sum => {
      //     process.sum = sum
      //     this.totalImpact += sum;
      //   });
      // });
      console.log('Processus:', this.processes);
      this.selectedRisk = risk
      if (this.selectedProcess) {
        this.getIncidentsByProcessAndRisk(this.selectedProcess, risk);
      }
    });
  }

  trackByProcessId = (_: number, p: ProcessNode) => p.id;

  onSelectProcess(p: ProcessNode) {
    if (this.selectedProcess?.id !== p.id) {
      this.getControlsByProcessAndRisk(p); // ta méthode existante
    }
    if (this.selectedRisk) {
      this.getIncidentsByProcessAndRisk(p, this.selectedRisk);
    }
  }

  getIncidentsByProcessAndRisk(process: ProcessNode, risk: RiskTemplate) {
    if (!risk || !process) {
      this.incidents = [];
      return;
    }
    this.IncidentService.getIncidentByProcessAndRisk(process.id, risk.id.id).subscribe(
      incidents => {
        this.incidents = incidents;
        console.log('Incidents:', this.incidents);
      },
      error => {
        console.error('Error fetching incidents:', error);
      }
    );
  }

  getControlsByProcessAndRisk(process: ProcessNode) {
    this.selectedProcess = process
    if (this.selectedRisk && this.selectedProcess)
      this.controlService.getAllTemplates(this.selectedProcess.id, this.selectedRisk.id.id).subscribe(
        controls => this.controls = controls
      )
  }

  submitEvaluation(data: any) {
    console.log(data)

    const payload: any = {
      commentaire: data.commentaire!,
      probability: data.probability!,
      riskNet: data.riskNet!,
      riskId: this.selectedRisk.id.id,
    };

    this.evaluationSrv.save(payload).subscribe(resp => {
      console.log(resp)
    },
      error => {
        console.error(error)
      })
  }
}
