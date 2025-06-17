/* ------------------------------------------------------------------ */
/*  create-risks-evaluations.component.ts                              */
/* ------------------------------------------------------------------ */
import { Component, inject, OnInit }           from '@angular/core';
import { Router, ActivatedRoute }              from '@angular/router';
import { CommonModule }                        from '@angular/common';
import { FormBuilder, ReactiveFormsModule,
         Validators }                          from '@angular/forms';

import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatSelectModule }     from '@angular/material/select';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatStepperModule }    from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RiskLevel, RiskLevelLabels } from '../../../../../core/enum/riskLevel.enum';
import { RiskEvaluationCreateDto } from '../../../../../core/models/RiskEvaluation';
import { RiskTemplate } from '../../../../../core/models/RiskTemplate';
import { ConfirmService } from '../../../../../core/services/confirm/confirm.service';
import { RiskEvaluationService } from '../../../../../core/services/risk-evaluation/risk-evaluation/risk-evaluation.service';
import { RiskService } from '../../../../../core/services/risk/risk.service';


@Component({
  selector   : 'app-create-risks-evaluations',
  standalone : true,
  imports    : [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatButtonModule, MatStepperModule, CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-risks-evaluations.component.html',
  styleUrl   : './create-risks-evaluations.component.scss'
})
export class CreateRisksEvaluationsComponent implements OnInit {

  /* ---------------- services ---------------- */
  private readonly router     = inject(Router);
  private readonly route      = inject(ActivatedRoute);
  private readonly fb         = inject(FormBuilder);

  private readonly riskSrv    = inject(RiskService);
  private readonly evalSrv    = inject(RiskEvaluationService);
  private readonly confirmSrv = inject(ConfirmService);

  /* ---------------- données ----------------- */
  riskTemplates : RiskTemplate[] = [];
  riskLevels    = Object.values(RiskLevel);
  riskLabels    = RiskLevelLabels;

  pageTitle = 'Nouvelle évaluation de risque';

  /* ----------------- formulaire ------------- */
  form = this.fb.group({
    riskTemplate: [null as RiskTemplate | null, Validators.required],  // id (ou l’objet selon votre choix)
    riskNet     : ['', Validators.required]   // RiskLevel
  });

  /* ========================================================= */
  /*                       CYCLE DE VIE                        */
  /* ========================================================= */
  ngOnInit(): void {

    /* on peut recevoir un pré-sélection via l’URL :
       /evaluations/create/:templateId                                */
    const preSelectId = this.route.snapshot.paramMap.get('templateId');

    /* on charge tous les templates pour le select ------------------ */
    this.riskSrv.getAll().subscribe(list => {
      this.riskTemplates = list;

      if (preSelectId) {
        /* si l’id passé existe dans la liste on pré-sélectionne       */
        const tpl = this.riskTemplates.find(t => t.id.id === preSelectId);
        if (tpl) {
          this.form.get('riskTemplate')?.setValue(tpl);
        }
      }
    });
  }

  /* ========================================================= */
  /*                          SUBMIT                           */
  /* ========================================================= */
  submit(): void {

    if (this.form.invalid) { return; }

    /* constitution du payload DTO --------------------------------- */
    const dto: RiskEvaluationCreateDto = {
        riskNet: this.form.get('riskNet')!.value as RiskLevel,
        riskTemplate: this.form.get('riskTemplate')!.value as RiskTemplate
        // `evaluator` est renseigné côté back à partir de l’utilisateur connecté
        ,
        description: '',
        evaluator: '',
        probability: null,
        createdAt: ''
    };

    /* appel service ------------------------------------------------ */
    this.evalSrv.save(dto).subscribe(() => {
      this.confirmSrv.openConfirmDialog(
        'Création', 'L’évaluation a bien été enregistrée', false
      );
      this.router.navigate(['risks', 'evaluations']);   // ► page liste
    });
  }
}
