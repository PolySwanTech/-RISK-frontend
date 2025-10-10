import { Component, OnInit, Inject, Optional, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';

import { GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { SelectArborescenceComponent } from '../../../../shared/components/select-arborescence/select-arborescence.component';

import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { ProcessService } from '../../../../core/services/process/process.service';
import { RiskReferentielService } from '../../../../core/services/risk/risk-referentiel.service';

import { RiskTemplate, RiskTemplateCreateDto } from '../../../../core/models/RiskTemplate';
import { RiskLevelEnum, RiskLevelLabels } from '../../../../core/enum/riskLevel.enum';
import { RiskImpactType, RiskImpactTypeLabels } from '../../../../core/enum/riskImpactType.enum';
import { Process } from '../../../../core/models/Process';
import { BaloiseCategoryDto, RiskReferentiel } from '../../../../core/models/RiskReferentiel';
import { SelectRiskEventComponent } from '../../../../shared/components/select-risk-event/select-risk-event.component';
import { RiskSelectionMode } from '../../../../core/enum/riskSelection.enum';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';

@Component({
  selector: 'app-create-risks',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatButtonModule, MatDialogModule,
    GoBackComponent, SelectArborescenceComponent, MatIconModule, MatChipsModule, MatStepperModule
  ],
  providers: [
    // Ajoutez ce provider
    {
      provide: CdkStepper,
      useValue: {}
    }
  ],
  templateUrl: './create-risks.component.html',
  styleUrls: ['./create-risks.component.scss']
})
export class CreateRisksComponent implements OnInit {

  /* ---------------- services ---------------- */
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly riskSrv = inject(RiskService);
  private readonly riskReferentielSrv = inject(RiskReferentielService);
  private readonly confirm = inject(ConfirmService);
  private readonly procSrv = inject(ProcessService);
  private readonly dialog = inject(MatDialog)

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef?: MatDialogRef<CreateRisksComponent>,
  ) { }

  /* ---------------- données ----------------- */
  risks: RiskReferentiel[] = [];
  listProcess: Process[] = [];

  bal1: BaloiseCategoryDto[] = [];
  bal2: BaloiseCategoryDto[] = [];

  pageTitle = 'Création d\'un évènement de risque';
  dialogLabel = { title: 'Création', message: 'création' };

  riskLevels = Object.values(RiskLevelEnum);
  impactTypes = Object.values(RiskImpactType);
  riskLabels = RiskLevelLabels;
  impactLabels = RiskImpactTypeLabels;
  redirectUrl?: string;

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

    let processId: string | null = null;
    let parentRisk: string | null = null;
    let buId: string | null = null;
    let libelle: string | null = null;
    let redirect: string | null = null;
    let id: string | null = null;

    // Mode pop-up (via MatDialog)
    if (this.data) {
      processId = this.data.processId ?? null;
      redirect = this.data.redirect ?? null;
      buId = this.data.buId ?? null;
      parentRisk = this.data.riskReferentielId ?? null;
      libelle = this.data.libelle ?? null;
    }
    // Mode route directe
    else {
      const route = inject(ActivatedRoute);
      processId = route.snapshot.queryParams["processId"];
      parentRisk = route.snapshot.queryParams["riskReferentielId"];
      buId = route.snapshot.queryParams["buId"];
      libelle = route.snapshot.queryParams["libelle"];
      redirect = route.snapshot.queryParams["redirect"];
      id = route.snapshot.paramMap.get('id');
    }

    // Charger les processus
    if (buId) {
      this.procSrv.getProcessTree(buId).subscribe(list => {
        this.listProcess = list;
      });
    }

    this.redirectUrl = redirect ?? undefined;

    if (processId) this.infoForm.get('processId')?.setValue(processId);
    if (libelle) this.infoForm.get('libellePerso')?.setValue(libelle);
    if (parentRisk) this.infoForm.get('parentRisk')?.setValue(parentRisk);
    if (id && id !== 'create') this.loadRiskById(id);
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

  cancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else if (this.redirectUrl) {
      this.router.navigateByUrl(this.redirectUrl);
    } else {
      this.router.navigate(['reglages', 'risks']);
    }
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

    this.riskSrv.save(payload).subscribe(riskId => {
      if (!this.dialogRef) {
        this.confirm.openConfirmDialog(
          this.dialogLabel.title,
          `La ${this.dialogLabel.message} du risque a été réalisée avec succès`,
          false
        );
      }


      if (this.dialogRef) {
        this.dialogRef.close({ createdEventId: riskId, libelle: this.infoForm.get('libellePerso')!.value! });
      } else if (this.redirectUrl) {
        this.router.navigateByUrl(`${this.redirectUrl}?createdEventId=${riskId}`);
      } else {
        this.router.navigate(['reglages', 'risks', riskId]);
      }
    });
  }

  openRiskEventDialog() {
    const processId = this.infoForm.get('processId');
    const dialogRef = this.dialog.open(SelectRiskEventComponent, {
      minWidth: '700px',
      height: '550px',
      data: {
        mode: RiskSelectionMode.Taxonomie,
        processId: processId,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.risk = result;
        this.infoForm.get('parentRisk')?.setValue(this.risk.id);
        console.log(this.risk)
      }
    });
  }
}
