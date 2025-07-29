/* ------------------------------------------------------------------ */
/*  create-risks.component.ts                                          */
/* ------------------------------------------------------------------ */
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

import { GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { ProcessService } from '../../../../core/services/process/process.service';

import { RiskId, RiskTemplate, RiskTemplateCreateDto } from '../../../../core/models/RiskTemplate';
import { RiskLevel, RiskLevelLabels } from '../../../../core/enum/riskLevel.enum';
import { RiskImpactType, RiskImpactTypeLabels } from '../../../../core/enum/riskImpactType.enum';

import { Process } from '../../../../core/models/Process';
import { RiskCategoryService } from '../../../../core/services/risk/risk-category.service';
import { BaloiseCategoryEnum } from '../../../../core/enum/baloisecategory.enum';

@Component({
  selector: 'app-create-risks',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatButtonModule, GoBackComponent
  ],
  templateUrl: './create-risks.component.html',
  styleUrl: './create-risks.component.scss'
})
export class CreateRisksComponent implements OnInit {

  /* ---------------- services ---------------- */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly riskSrv = inject(RiskService);
  private readonly confirm = inject(ConfirmService);
  private readonly riskCategoryService = inject(RiskCategoryService);
  private readonly procSrv = inject(ProcessService);

  /* ---------------- données ----------------- */
  risks: RiskTemplate[] = []; // liste des risques existants

  process1: Process[] = [];
  process2: Process[] = [];
  process3: Process[] = [];

  pageTitle = 'Création d\'un risque';
  dialogLabel = { title: 'Création', message: 'création' };

  riskLevels = Object.values(RiskLevel);
  impactTypes = Object.values(RiskImpactType);
  riskLabels = RiskLevelLabels;
  impactLabels = RiskImpactTypeLabels;


  /** instance courante (vide ou chargée) */
  risk: RiskTemplate = new RiskTemplate();

  /* -------------   reactive forms ------------- */
  infoForm = this.fb.group({
    parentRisk: this.fb.control<string | null>(null), // pour les risques enfants
    libellePerso: this.fb.nonNullable.control<string>(''),
    libelleBalois: this.fb.nonNullable.control<string>(''),
    process1: this.fb.nonNullable.control<Process | null>(null, Validators.required),
    process2: this.fb.control<Process | null>(null),
    process3: this.fb.control<Process | null>(null)
  });

  detailsForm = this.fb.group({
    description: this.fb.nonNullable.control<string>(''),
    level: this.fb.nonNullable.control<RiskLevel>(RiskLevel.LOW),
    impactType: this.fb.control<RiskImpactType | null>(null)
  });

  onProcessChange(process: Process, level: number): void {
    if (level === 1) {
      this.process2 = process.enfants ?? [];
    }
    if (level === 2) {
      this.process3 = process.enfants ?? [];
    }
  }

  /* ========================================================= */
  /*                       CYCLE DE VIE                        */
  /* ========================================================= */
  ngOnInit(): void {

    /* --- chargements parallèles --- */
    this.procSrv.getAll().subscribe(list => this.process1 = list);

    this.riskSrv.getAll().subscribe(risks => this.risks = risks);

    /* --- id dans l’URL ?  => édition  ---------------------- */
    const id = this.route.snapshot.paramMap.get('id');   // id OU 'create'
    if (id && id !== 'create') {
      // this.loadRiskById(id);
    }
  }

  /* ========================================================= */
  /*                   CHARGEMENT D’UN RISQUE                  */
  /* ========================================================= */
  private loadRiskById(id: string): void {

    this.riskSrv.getById(id).subscribe(r => {
      this.risk = new RiskTemplate(r);     // instanciation propre
      this.pageTitle = `Mise à jour du risque : ${this.risk.libellePerso}`;
      this.dialogLabel = { title: 'Mise à jour', message: 'mise à jour' };

      /* pré-remplissage des formulaires */
      this.infoForm.patchValue({
        libellePerso: this.risk.libellePerso,
        // process1: this.risk.processId,
      });

      this.detailsForm.patchValue({
        description: this.risk.description,
        level: this.risk.riskBrut,
        // impactType: this.risk.impactTypes[0] ?? null   // simple sélection
      });
    });
  }

  /* ========================================================= */
  /*                     CRÉATION / MÀJ                       */
  /* ========================================================= */
  submit(): void {
    if (this.infoForm.invalid || this.detailsForm.invalid) {
      console.error('Formulaire invalide:', this.infoForm.errors, this.detailsForm.errors);
      return;
    }

    const riskLevel = this.detailsForm.get('level')?.value;
    const impactType = this.detailsForm.get('impactType')?.value;

    if (!riskLevel || !impactType) {
      console.error('Valeurs obligatoires manquantes');
      return;
    }

    const payload: RiskTemplateCreateDto = {
      libellePerso: this.infoForm.get('libellePerso')!.value!,
      libelleBalois: this.infoForm.get('libelleBalois')!.value!,
      description: this.detailsForm.get('description')!.value!,
      processId: (this.infoForm.get('process1')!.value as unknown as Process).id,
      riskBrut: riskLevel,
      impactTypes: [impactType],
      parent: this.infoForm.get('parentRisk')?.value // si c'est un risque enfant
    };

    this.riskSrv.save(payload).subscribe(riskId => {
      this.confirm.openConfirmDialog(
        this.dialogLabel.title,
        `La ${this.dialogLabel.message} du risque a été réalisée avec succès`,
        false
      );
      this.router.navigate(['reglages', 'risks', riskId]);
    });
  }
}
