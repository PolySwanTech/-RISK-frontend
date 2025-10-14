import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

import { GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { ProcessService } from '../../../../core/services/process/process.service';

import { RiskLevelEnum, RiskLevelLabels } from '../../../../core/enum/riskLevel.enum';
import { RiskImpactType, RiskImpactTypeLabels } from '../../../../core/enum/riskImpactType.enum';

import { Process } from '../../../../core/models/Process';
import { BaloiseCategoryDto, baloisFormatLabel, RiskReferentiel, RiskReferentielCreateDto } from '../../../../core/models/RiskReferentiel';
import { RiskReferentielService } from '../../../../core/services/risk/risk-referentiel.service';
import { RiskSelectionMode } from '../../../../core/enum/riskSelection.enum';
import { SelectRiskEventComponent } from '../../../../shared/components/select-risk-event/select-risk-event.component';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule, MatChipListbox } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-create-risks-referentiel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatButtonModule, GoBackComponent,
    MatRadioModule,
    GoBackComponent,
    NgIf,
    MatIconModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatChipsModule,
    MatChipListbox],
  templateUrl: './create-risks-referentiel.component.html',
  styleUrl: './create-risks-referentiel.component.scss'
})
export class CreateRisksReferentielComponent {
  /* ---------------- services ---------------- */
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private dialog = inject(MatDialog)


  private riskReferentielSrv = inject(RiskReferentielService)
  private readonly confirm = inject(ConfirmService);
  private readonly procSrv = inject(ProcessService);


  /* ---------------- données ----------------- */
  listProcess: Process[] = [];

  balois: BaloiseCategoryDto | null = null;

  pageTitle = 'Création d\'un risque référentiel';
  dialogLabel = { title: 'Création', message: 'création' };

  riskLevels = Object.values(RiskLevelEnum);
  impactTypes = Object.values(RiskImpactType);
  riskLabels = RiskLevelLabels;
  impactLabels = RiskImpactTypeLabels;

  isBaloisPreselected = false;

  /** instance courante (vide ou chargée) */
  risk: RiskReferentiel = new RiskReferentiel();

  /* -------------   reactive forms ------------- */
  infoForm = this.fb.group({
    libellePerso: this.fb.nonNullable.control<string>(''),
    balois: this.fb.nonNullable.control<BaloiseCategoryDto | null>(null, Validators.required),
    description: this.fb.nonNullable.control<string>(''),
  });

  ngOnInit(): void {
    const buId = this.route.snapshot.queryParams["buId"];
    const id = this.route.snapshot.paramMap.get('id');

    const balois = this.route.snapshot.queryParams['bal']

    if (balois) {

      this.balois = {
        libelle: balois,
        label: balois,
        definition: null,
        parent: null
      }

      this.infoForm.get('balois')?.setValue(balois);
      this.isBaloisPreselected = true
    }

    this.procSrv.getProcessTree(buId).subscribe(list => {
      this.listProcess = list
    });

    if (id && id !== 'create') {
      this.loadRiskById(id);
    }
  }

  private loadRiskById(id: string): void {
    this.riskReferentielSrv.getById(id).subscribe(r => {
      this.risk = r;
      this.pageTitle = `Mise à jour du risque : ${this.risk.libelle}`;
      this.dialogLabel = { title: 'Mise à jour', message: 'mise à jour' };

      this.infoForm.patchValue({
        balois: this.risk.category ?? null,
        description: this.risk.description,
      });
    });
  }

  openSubCategorySelector(): void {
    const dialogRef = this.dialog.open(SelectRiskEventComponent, {
      minWidth: '700px',
      height: '550px',
      data: { mode: RiskSelectionMode.CategoryLevel2 }
    });

    dialogRef.afterClosed().subscribe(subcategory => {
      if (subcategory) {
        this.balois = subcategory;
        this.infoForm.get('balois')?.setValue(subcategory.libelle);
      }
    });
  }

  format(label?: string): string {
    return baloisFormatLabel(label ?? '');
  }



  submit(): void {
    if (this.infoForm.invalid) {
      console.error('Formulaire invalide:', this.infoForm.errors);
      return;
    }

    const category = this.infoForm.get('balois')?.value;

    if (!category) {
      console.error('Catégorie obligatoire !');
      return;
    }

    const payload: RiskReferentielCreateDto = {
      libelle: this.infoForm.get('libellePerso')!.value!,
      category: category!,
      description: this.infoForm.get('description')!.value!,
    };

    this.riskReferentielSrv.create(payload).subscribe(risk => {
      this.confirm.openConfirmDialog(
        this.dialogLabel.title,
        `La ${this.dialogLabel.message} du risque a été réalisée avec succès`,
        false
      );
      const next = this.route.snapshot.queryParams['next']
      if(next){
        this.router.navigateByUrl(next);
      }
    });
  }
}
