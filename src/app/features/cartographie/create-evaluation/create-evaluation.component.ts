import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RiskService } from '../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { ImpactService } from '../../../core/services/impact/impact.service';
import { ControlService } from '../../../core/services/control/control.service';
import { ControlTemplate } from '../../../core/models/ControlTemplate';
import { CreateRisksEvaluationsComponent } from "../../reglages/risks/risk-evaluation/create-risks-evaluations/create-risks-evaluations.component";

@Component({
  selector: 'app-create-evaluation',
  imports: [CurrencyPipe, FormsModule, CommonModule, CreateRisksEvaluationsComponent],
  templateUrl: './create-evaluation.component.html',
  styleUrl: './create-evaluation.component.scss'
})
export class CreateEvaluationComponent implements OnInit {

  private riskService = inject(RiskService);
  private processService = inject(ProcessService);
  private impactService = inject(ImpactService);
  private controlService = inject(ControlService);

  risks: RiskTemplate[] = [];

  selectedYear = new Date().getFullYear();

  totalImpact = 0

  selectedRisk: RiskTemplate | null = null;
  selectedProcess: Process | null = null;
  selectedControl: ControlTemplate | null = null;

  processes: Process[] = [];

  controls: ControlTemplate[] = []

  evaluations = [];

  ngOnInit(): void {
    this.riskService.getAll().subscribe(risks => {
      this.risks = risks;
    });
  }

  getProcessByRisks(risk: RiskTemplate) {
    this.processService.getAllByRisks(risk.id.id).subscribe(processes => {
      this.processes = processes;
      this.totalImpact = 0;
      this.processes.forEach(process => {
        this.impactService.sumByProcess(process.id).subscribe(sum => 
          {
          process.sum = sum
          this.totalImpact += sum;
        });
      });
      console.log('Processus:', this.processes);
      this.selectedRisk = risk
    });
  }

  getControlsByProcessAndRisk(process: Process) {
    this.selectedProcess = process
    if (this.selectedRisk && this.selectedProcess)
      this.controlService.getAllTemplates(this.selectedProcess.id, this.selectedRisk.id.id).subscribe(
        controls => this.controls = controls
      )
  }

  submitEvaluation(data: any) {
    // this.evaluations.push({
    //   risk: this.selectedRisk,
    //   process: this.selectedProcess,
    //   control: this.selectedControl,
    //   ...data
    // });
    alert('Évaluation enregistrée.');
  }
}
