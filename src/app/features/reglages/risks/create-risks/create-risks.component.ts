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
  private readonly procSrv = inject(ProcessService);

  /* ---------------- données ----------------- */
  risks: RiskReferentiel[] = [];
  listProcess: Process[] = [];

  bal1: BaloiseCategoryDto[] = [];
  bal2: BaloiseCategoryDto[] = [];

  pageTitle = 'Création d\'un évenement de risque';
  dialogLabel = { title: 'Création', message: 'création' };

  riskLevels = Object.values(RiskLevelEnum);
  impactTypes = Object.values(RiskImpactType);
  riskLabels = RiskLevelLabels;
  impactLabels = RiskImpactTypeLabels;
  redirectUrl?: string;



  /** instance courante (vide ou chargée) */
  risk: RiskTemplate = new RiskTemplate();

  /* -------------   reactive forms ------------- */
  infoForm = this.fb.group({
    parentRisk: this.fb.control<string>(''),
    libellePerso: this.fb.nonNullable.control<string>(''),
    processId: this.fb.control<string | null>(null, Validators.required),
    description: this.fb.control<string | null>(null)
  });

  ngOnInit(): void {
    this.riskReferentielSrv.getAll().subscribe(risks => this.risks = risks);

    const processId = this.route.snapshot.queryParams["processId"];
    const buId = this.route.snapshot.queryParams["buId"];
    const libelle = this.route.snapshot.queryParams["libelle"]
    const redirect = this.route.snapshot.queryParams["redirect"];
    const id = this.route.snapshot.paramMap.get('id');

    this.procSrv.getProcessTree(buId).subscribe(list => {
      this.listProcess = list
    });

    this.redirectUrl = redirect;

    if (processId) {
      this.infoForm.get('processId')?.setValue(processId);
    }

    if (libelle) {
      this.infoForm.get('libellePerso')?.setValue(libelle);
    }

    if (id && id !== 'create') {
      this.loadRiskById(id);
    }
  }

  private loadRiskById(id: string): void {
    this.riskSrv.getById(id).subscribe(r => {
      this.risk = new RiskTemplate(r);
      this.pageTitle = `Mise à jour du risque : ${this.risk.riskReferentiel?.libelle ?? ''}`;
      this.dialogLabel = { title: 'Mise à jour', message: 'mise à jour' };

      this.infoForm.patchValue({
        libellePerso: this.risk.libelle,
        parentRisk: this.risk.riskReferentiel.libelle,
        processId: this.risk.processId ?? null,
        description: this.risk.description
      });
    });
  }

  onProcessSelected(process: Process) {
    this.infoForm.get('processId')?.setValue(process.id);
  }


  submit(): void {
    if (this.infoForm.invalid) {
      console.error('Formulaire invalide:', this.infoForm.errors);
      return;
    }

    const payload: RiskTemplateCreateDto = {
      libelle: this.infoForm.get('libellePerso')!.value!,
      processId: this.infoForm.get('processId')!.value!,
      riskReferentielId: this.infoForm.get('parentRisk')!.value!,
      description: this.infoForm.get('description')?.value ?? null,
    };

    console.log(payload);

    this.riskSrv.save(payload).subscribe(riskId => {
      this.confirm.openConfirmDialog(
        this.dialogLabel.title,
        `La ${this.dialogLabel.message} du risque a été réalisée avec succès`,
        false
      );
      if (this.redirectUrl) {
        this.router.navigateByUrl(this.redirectUrl);
      } else {
        this.router.navigate(['reglages', 'risks', riskId]);
      }
    });
  }
}
