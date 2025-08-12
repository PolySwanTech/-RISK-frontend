import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RiskLevel, RiskLevelLabels } from '../../../../../core/enum/riskLevel.enum';
import { RiskEvaluationCreateDto } from '../../../../../core/models/RiskEvaluation';
import { RiskId, RiskTemplate } from '../../../../../core/models/RiskTemplate';
import { RiskEvaluationService } from '../../../../../core/services/risk-evaluation/risk-evaluation/risk-evaluation.service';
import { RiskService } from '../../../../../core/services/risk/risk.service';
import { EntiteResponsable } from '../../../../../core/models/EntiteResponsable';
import { Process } from '../../../../../core/models/Process';
import { EntitiesService } from '../../../../../core/services/entities/entities.service';
import { ProcessService } from '../../../../../core/services/process/process.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


// src/app/reglages/risks/risk-evaluation/risk-evaluation.component.ts
@Component({
  selector: 'app-risk-evaluation',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatButtonModule
  ],
  templateUrl: './create-risks-evaluations.component.html',
  styleUrls: ['./create-risks-evaluations.component.scss'],
})
/* … imports inchangés, sauf qu’on peut retirer EntitiesService & ProcessService */

export class CreateRisksEvaluationsComponent implements OnInit {

  private fb = inject(FormBuilder);
  private evaluationSrv = inject(RiskEvaluationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private riskSrv = inject(RiskService);      // ← garde le service en secours

  riskLevels = Object.values(RiskLevel);
  riskLabels = RiskLevelLabels;

  @Input() riskId: string = '';
  @Output() onSumbit = new EventEmitter<any>();

  currentRisk?: RiskTemplate;

  form = this.fb.group({
    probability: [null as number | null, Validators.required],
    riskNet: [null as RiskLevel | null, Validators.required],
    riskId: ['', Validators.required],
    comment: ['']
  });

  /* -------------------------------------------------------------- */
  ngOnInit(): void {

    /* 1. — essayer de récupérer le risque depuis navigation.state */
    const nav = this.router.getCurrentNavigation();
    const navRisk = nav?.extras.state?.['risk'] as RiskTemplate | undefined;



    if (navRisk) {
      this.currentRisk = navRisk;
      this.form.patchValue({ riskId: navRisk.id.id });
      return;                                  // pas de requête HTTP 🎉
    }

    /* 2. — sinon fallback : queryParams → appel REST */
    const riskId = this.route.snapshot.queryParamMap.get('id')! ? this.route.snapshot.queryParamMap.get('id')! : this.riskId;
    const version = this.route.snapshot.queryParamMap.get('version');

    this.form.patchValue({ riskId });

    this.riskSrv.getById(riskId).subscribe(risk => {
      this.currentRisk = risk;
    });
  }

  /* -------------------------------------------------------------- */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: RiskEvaluationCreateDto = {
      commentaire: this.form.value.comment!,
      probability: this.form.value.probability!,
      riskNet: this.form.value.riskNet!,
    };

    if (this.riskId) {
      this.onSumbit.emit(payload);
    }
    else {
      this.evaluationSrv.save(payload).subscribe({
        next: () => this.router.navigate(
          ['/reglages/risks', this.form.value.riskId!]),
        error: err => console.error('Erreur création évaluation', err)
      });
    }
  }
}