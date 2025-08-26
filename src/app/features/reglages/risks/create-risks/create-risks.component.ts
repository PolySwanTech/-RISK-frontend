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

import { Process } from '../../../../core/models/Process';
import { RiskCategoryService } from '../../../../core/services/risk/risk-category.service';
import { BaloiseCategoryEnum } from '../../../../core/enum/baloisecategory.enum';
import { SelectArborescenceComponent } from '../../../../shared/components/select-arborescence/select-arborescence.component';

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
  private readonly confirm = inject(ConfirmService);
  private readonly riskCategoryService = inject(RiskCategoryService);
  private readonly procSrv = inject(ProcessService);

  /* ---------------- données ----------------- */
  risks: RiskTemplate[] = [];
  listProcess: Process[] = [];

  bal1: BaloiseCategoryEnum[] = [];
  bal2: BaloiseCategoryEnum[] = [];

  pageTitle = 'Création d\'un risque';
  dialogLabel = { title: 'Création', message: 'création' };

  risk: RiskTemplate = new RiskTemplate();

  /* -------------   reactive forms ------------- */
  infoForm = this.fb.group({
    parentRisk: this.fb.control<string | null>(null),
    libellePerso: this.fb.nonNullable.control<string>(''),
    balois1: this.fb.nonNullable.control<BaloiseCategoryEnum | null>(null, Validators.required),
    balois2: this.fb.control<BaloiseCategoryEnum | null>(null),
    processId: this.fb.control<string | null>(null, Validators.required),
    description: this.fb.nonNullable.control<string>(''),
  });

  ngOnInit(): void {
    this.riskCategoryService.getAll().subscribe(data => this.bal1 = data);

    this.procSrv.getAll().subscribe(list => this.listProcess = list);

    this.riskSrv.getAll().subscribe(risks => this.risks = risks);

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'create') {
      this.loadRiskById(id);
    }
  }

  private loadRiskById(id: string): void {
    this.riskSrv.getById(id).subscribe(r => {
      this.risk = new RiskTemplate(r);
      this.pageTitle = `Mise à jour du risque : ${this.risk.libellePerso}`;
      this.dialogLabel = { title: 'Mise à jour', message: 'mise à jour' };

      this.infoForm.patchValue({
        balois1: this.risk.category ?? null,
        balois2: this.risk.category ?? null,
        description: this.risk.description,
        processId: this.risk.processId ?? null,
      });
    });
  }

  onCategoryChange(baloise: BaloiseCategoryEnum, level: number): void {
    if (level === 1) {
      this.riskCategoryService.getByParent(baloise).subscribe(data => {
        this.bal2 = data;
        this.infoForm.patchValue({ balois2: null });
      });
    }
  }

  onProcessSelected(process: Process) {
    this.infoForm.get('processId')?.setValue(process.id);
    // this.infoForm.get('processId')?.markAsDirty();
    // this.infoForm.get('processId')?.updateValueAndValidity();
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

    const payload: RiskTemplateCreateDto = {
      libellePerso: this.infoForm.get('libellePerso')!.value!,
      category: category!,
      description: this.infoForm.get('description')!.value!,
      processId: this.infoForm.get('processId')!.value!,
      parent: this.infoForm.get('parentRisk')?.value ?? null,
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
