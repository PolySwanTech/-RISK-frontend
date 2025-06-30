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
  selector   : 'app-risk-evaluation',
  standalone : true,
    imports     : [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatButtonModule
  ],
  templateUrl: './create-risks-evaluations.component.html',
  styleUrls  : ['./create-risks-evaluations.component.scss'],
})
export class CreateRisksEvaluationsComponent implements OnInit {
 /* ==============  services  ============== */
  private fb              = inject(FormBuilder);
  private evaluationSrv   = inject(RiskEvaluationService);
  private entiteSrv       = inject(EntitiesService);
  private processSrv      = inject(ProcessService);
  private riskSrv         = inject(RiskService);
  private router          = inject(Router);

  /* ==============  données de sélection (select)  ============== */
  entites:  EntiteResponsable[] = [];
  processes: Process[]          = [];
  risks:     RiskTemplate[]     = [];
  riskLevels   = Object.values(RiskLevel);
  riskLabels   = RiskLevelLabels;

  /* ==============  FormGroup  ============== */
  form = this.fb.group({
    /* 1.  composantes chiffrées  */
    probability : [null as number | null, Validators.required],  // 1-10
    riskNet     : [null as RiskLevel | null, Validators.required],

    /* 2.  contexte (filtre BU → Process → Risk) */
    entiteId : ['', Validators.required],
    processId: ['', Validators.required],
    riskId   : ['', Validators.required],

    /* (optionnel) commentaire libre */
    comment  : ['']
  });

  /* ============================================================= */
  ngOnInit(): void {
    /* charge la liste des entités pour le 1er select */
    this.entiteSrv.loadEntities()
      .subscribe(list => this.entites = list);

    /* réagit au changement d’entité → charge les process */
    this.form.get('entiteId')!.valueChanges
      .subscribe(entiteId => {
        this.processes = [];
        this.risks     = [];
        this.form.patchValue({ processId: '', riskId: '' }, { emitEvent:false });

        if (entiteId) {
          this.processSrv.getAllByEntite(entiteId)
              .subscribe(list => this.processes = list);
        }
      });

    /* réagit au changement de process → charge les risques */
    this.form.get('processId')!.valueChanges
      .subscribe(procId => {
        this.risks = [];
        this.form.patchValue({ riskId: '' }, { emitEvent:false });

        if (procId) {
          this.riskSrv.getAllByProcess(procId)
              .subscribe(list => this.risks = list);
        }
      });
  }

  /* ============================================================= */
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    /* construction propre du payload */
    const payload: RiskEvaluationCreateDto = {
      riskNet      : this.form.value.riskNet!,
      probability  : this.form.value.probability!,
      taxonomie : this.form.value.riskId!,
    };

    this.evaluationSrv.save(payload).subscribe({
      next : () => this.router.navigate(['/reglages/risks', this.form.value.riskId]),
      error: err => console.error('Erreur création évaluation', err)
    });
  }
}