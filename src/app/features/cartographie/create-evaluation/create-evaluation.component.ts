import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { Process } from '../../../core/models/Process';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { BuProcessAccordionComponent } from "../../../shared/components/bu-process-accordion/bu-process-accordion.component";
import { GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { RiskLevelEnum } from '../../../core/enum/riskLevel.enum';
import { EvaluationBruteComponent } from '../../../shared/components/evaluation-brute/evaluation-brute.component';
import { EvaluationNetteComponent } from '../../../shared/components/evaluation-nette/evaluation-nette.component';

@Component({
  selector: 'app-create-evaluation',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    ReactiveFormsModule,
    GoBackComponent,
    MatStepperModule,
    MatButtonModule,
    BuProcessAccordionComponent,
    EvaluationBruteComponent,
    EvaluationNetteComponent
  ],
  templateUrl: './create-evaluation.component.html',
  styleUrl: './create-evaluation.component.scss'
})
export class CreateEvaluationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  selectedRisk: RiskTemplate | null = null;
  selectedBU: BusinessUnit | null = null;
  selectedProcess: Process | null = null;

  // Données pour passer à l'évaluation nette
  bruteRiskLevel: RiskLevelEnum | null = null;
  bruteIndicators: Array<{frequenceId: number, severiteId: number}> = [];

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
        this.selectedBU = obj.bu;
        this.selectedProcess = obj.process;
        this.selectedRisk = obj.risk;
      }
    }
  }

  onEvaluationBruteSaved(data: {riskLevel: RiskLevelEnum, indicators: Array<{frequenceId: number, severiteId: number}>}): void {
    this.bruteRiskLevel = data.riskLevel;
    this.bruteIndicators = data.indicators;
  }

  newEvaluation(): void {
    window.location.reload();
  }
}