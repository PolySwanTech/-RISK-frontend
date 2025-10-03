/* ------------------------------------------------------------------ */
/*  create-risks.component.ts                                          */
/* ------------------------------------------------------------------ */
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

import { GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { ProcessService } from '../../../../core/services/process/process.service';

import { RiskTemplate, RiskTemplateCreateDto } from '../../../../core/models/RiskTemplate';
import { RiskLevelEnum, RiskLevelLabels } from '../../../../core/enum/riskLevel.enum';
import { RiskImpactType, RiskImpactTypeLabels } from '../../../../core/enum/riskImpactType.enum';

import { Process } from '../../../../core/models/Process';
import { RiskCategoryService } from '../../../../core/services/risk/risk-category.service';
import { SelectArborescenceComponent } from '../../../../shared/components/select-arborescence/select-arborescence.component';
import { BaloiseCategoryDto, RiskReferentiel, RiskReferentielCreateDto } from '../../../../core/models/RiskReferentiel';
import { RiskReferentielService } from '../../../../core/services/risk/risk-referentiel.service';

@Component({
  selector: 'app-create-risks',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, SelectArborescenceComponent,
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
  private riskReferentielSrv = inject(RiskReferentielService)
  private readonly confirm = inject(ConfirmService);
  private readonly riskCategoryService = inject(RiskCategoryService);
  private readonly procSrv = inject(ProcessService);

  /* ---------------- données ----------------- */
  risks: RiskTemplate[] = [];
  listProcess: Process[] = [];

  bal1: BaloiseCategoryDto[] = [];
  bal2: BaloiseCategoryDto[] = [];

  pageTitle = 'Création d\'un risque';
  dialogLabel = { title: 'Création', message: 'création' };

  riskLevels = Object.values(RiskLevelEnum);
  impactTypes = Object.values(RiskImpactType);
  riskLabels = RiskLevelLabels;
  impactLabels = RiskImpactTypeLabels;


  /** instance courante (vide ou chargée) */
  risk: RiskTemplate = new RiskTemplate();

  /* -------------   reactive forms ------------- */
  infoForm = this.fb.group({
    parentRisk: this.fb.control<string | null>(null),
    libellePerso: this.fb.nonNullable.control<string>(''),
    balois1: this.fb.nonNullable.control<BaloiseCategoryDto | null>(null, Validators.required),
    balois2: this.fb.control<BaloiseCategoryDto | null>(null),
    processId: this.fb.control<string | null>(null, Validators.required),
    description: this.fb.nonNullable.control<string>(''),
    level: this.fb.nonNullable.control<RiskLevelEnum>(RiskLevelEnum.LOW),
    impactType: this.fb.control<RiskImpactType | null>(null)
  });

  ngOnInit(): void {
    this.riskCategoryService.getAll().subscribe(data => this.bal1 = data);

    this.riskSrv.getAll().subscribe(risks => this.risks = risks);

    const processId = this.route.snapshot.queryParams["processId"];
    const buId = this.route.snapshot.queryParams["buId"];
    const id = this.route.snapshot.paramMap.get('id');

    this.procSrv.getProcessTree(buId).subscribe(list => {
      this.listProcess = list
    });

    if (processId) {
      this.infoForm.get('processId')?.setValue(processId);
    }

    if (id && id !== 'create') {
      this.loadRiskById(id);
    }
  }

  private loadRiskById(id: string): void {
    this.riskSrv.getById(id).subscribe(r => {
      this.risk = new RiskTemplate(r);
      this.pageTitle = `Mise à jour du risque : ${this.risk.riskReference.libelle}`;
      this.dialogLabel = { title: 'Mise à jour', message: 'mise à jour' };

      this.infoForm.patchValue({
        balois1: this.risk.riskReference.category ?? null,
        balois2: this.risk.riskReference.category ?? null,
        description: this.risk.riskReference.description,
        processId: this.risk.processId ?? null,
      });
    });
  }

  onCategoryChange(baloise: BaloiseCategoryDto, level: number): void {
    if (level === 1 && baloise?.libelle) {
      this.riskCategoryService.getByParent(baloise.libelle).subscribe(children => {
        this.bal2 = children;                         // options du niveau 2
        this.infoForm.patchValue({ balois2: null });  // reset du select niveau 2
      });
    }
  }

  onProcessSelected(process: Process) {
    this.infoForm.get('processId')?.setValue(process.id);
  }


  submit(): void {
    if (this.infoForm.invalid) {
      console.error('Formulaire invalide:', this.infoForm.errors);
      return;
    }

    const cat1 = this.infoForm.get('balois1')?.value;
    const cat2 = this.infoForm.get('balois2')?.value;
    const category = cat2 ?? cat1;

    if (!category) {
      console.error('Catégorie obligatoire !');
      return;
    }



    const payload: RiskReferentielCreateDto = {
      libelle: this.infoForm.get('libellePerso')!.value!,
      category: category!,
      description: this.infoForm.get('description')!.value!,
    };

    this.riskReferentielSrv.create(payload).subscribe(riskId => {
      this.confirm.openConfirmDialog(
        this.dialogLabel.title,
        `La ${this.dialogLabel.message} du risque a été réalisée avec succès`,
        false
      );
      this.router.navigate(['reglages', 'risks', riskId]);
    });
  }
}
