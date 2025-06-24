/* ------------------------------------------------------------------ */
/*  create-risks.component.ts                                          */
/* ------------------------------------------------------------------ */
import { Component, inject, OnInit }          from '@angular/core';
import { ActivatedRoute, Router }             from '@angular/router';
import { CommonModule }                       from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators }    from '@angular/forms';

import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatOption, MatSelectModule }     from '@angular/material/select';
import { MatStepperModule }    from '@angular/material/stepper';
import { MatButtonModule }     from '@angular/material/button';

import { GoBackComponent }      from '../../../../shared/components/go-back/go-back.component';
import { ConfirmService }       from '../../../../core/services/confirm/confirm.service';
import { RiskService }          from '../../../../core/services/risk/risk.service';
import { ProcessService }       from '../../../../core/services/process/process.service';
import { BaloisCategoriesService }from '../../../../core/services/balois-categories/balois-categories.service';

import { RiskTemplate, RiskTemplateCreateDto } from '../../../../core/models/RiskTemplate';
import { RiskLevel, RiskLevelLabels }            from '../../../../core/enum/riskLevel.enum';
import { RiskImpactType, RiskImpactTypeLabels }       from '../../../../core/enum/riskImpactType.enum';

import { BaloiseCategoryL1, BaloiseCategoryL2 }    from '../../../../core/models/BaloiseCategory';
import { Process }              from '../../../../core/models/Process';

@Component({
<<<<<<< HEAD
  selector: 'app-create-risks',
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule,
    MatSelectModule, GoBackComponent, MatStepperModule, MatButtonModule],
=======
  selector   : 'app-create-risks',
  standalone : true,
  imports    : [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatButtonModule, GoBackComponent
  ],
>>>>>>> 7fdffc6e16c0e3c71c42c9b7e3a158e6923f98c0
  templateUrl: './create-risks.component.html',
  styleUrl   : './create-risks.component.scss'
})
export class CreateRisksComponent implements OnInit {

  /* ---------------- services ---------------- */
  private readonly route     = inject(ActivatedRoute);
  private readonly router    = inject(Router);
  private readonly fb        = inject(FormBuilder);

  private readonly riskSrv   = inject(RiskService);
  private readonly confirm   = inject(ConfirmService);
  private readonly catSrv    = inject(BaloisCategoriesService);
  private readonly procSrv   = inject(ProcessService);

  /* ---------------- données ----------------- */
  categoriesBaloise : BaloiseCategoryL1[] = [];
  processes         : Process[]          = [];

<<<<<<< HEAD
  riskForm = this._formBuilder.group({
    titre: ['', Validators.required],
    balois1: ['', Validators.required],
    balois2: ['', Validators.required],
    process: ['', Validators.required],
  });
=======
  pageTitle   = 'Création d\'un risque';
  dialogLabel = { title: 'Création', message: 'création' };
>>>>>>> 7fdffc6e16c0e3c71c42c9b7e3a158e6923f98c0

  riskLevels   = Object.values(RiskLevel);
  impactTypes  = Object.values(RiskImpactType);
  riskLabels   = RiskLevelLabels;
  impactLabels = RiskImpactTypeLabels;

  /** instance courante (vide ou chargée) */
  risk: RiskTemplate = new RiskTemplate();

  /* -------------   reactive forms ------------- */
  infoForm = this.fb.group({
  libelle   : this.fb.nonNullable.control<string>(''),
  balois1 : this.fb.nonNullable.control<string>(''),       // nom L1
  balois2 : this.fb.control<BaloiseCategoryL2 | null>(     // ← OBJET L2
              null, Validators.required
            ),
  process : this.fb.nonNullable.control<string>('', Validators.required)
});

detailsForm = this.fb.group({
  description: this.fb.nonNullable.control<string>(''),
  level      : this.fb.nonNullable.control<RiskLevel>(RiskLevel.LOW),
  probability: this.fb.control<number | null>(null, Validators.pattern(/^\d+(\.\d+)?$/)),
  impactType : this.fb.control<RiskImpactType | null>(null)
});

  /* Sous-catégories adaptées à la catégorie L1 choisie */
  get sousCategoriesFiltered(): BaloiseCategoryL2[] {
    const catName = this.infoForm.get('balois1')!.value!;
    const catL1   = this.categoriesBaloise.find(c => c.name === catName);
    return catL1?.categoriesL2 ?? [];
  }

  /* ========================================================= */
  /*                       CYCLE DE VIE                        */
  /* ========================================================= */
  ngOnInit(): void {
<<<<<<< HEAD
    this.baloisCategoriesService.getAll().subscribe(data => {
      this.categoriesBaloise = data;
=======

    /* --- chargements parallèles --- */
    this.catSrv.getAll().subscribe(list => this.categoriesBaloise = list);
    this.procSrv.getAll().subscribe(list => this.processes         = list);

    /* --- id dans l’URL ?  => édition  ---------------------- */
    const id = this.route.snapshot.paramMap.get('id');   // id OU 'create'
    if (id && id !== 'create') {
      this.loadRiskById(id);
    }
  }

  /* ========================================================= */
  /*                   CHARGEMENT D’UN RISQUE                  */
  /* ========================================================= */
  private loadRiskById(id: string): void {
    this.riskSrv.getById(id).subscribe(r => {
      this.risk        = new RiskTemplate(r);     // instanciation propre
      this.pageTitle   = `Mise à jour du risque : ${this.risk.libelle}`;
      this.dialogLabel = { title: 'Mise à jour', message: 'mise à jour' };

      /* pré-remplissage des formulaires */
      this.infoForm.patchValue({
        libelle   : this.risk.libelle,
        balois1 : this.risk.categoryL2?.categoryL1?.name ?? '',
        balois2 : this.risk.categoryL2 ?? null,
        process : this.risk.processId
      });

      this.detailsForm.patchValue({
        description: this.risk.description,
        level      : this.risk.riskBrut,
        impactType : this.risk.impactTypes[0] ?? null   // simple sélection
      });
>>>>>>> 7fdffc6e16c0e3c71c42c9b7e3a158e6923f98c0
    });
    this.processService.getAll().subscribe(processes => {
      this.process = processes
    });
    this.risk = new Risk('', '', '', '', '');
  }

<<<<<<< HEAD
  // loadRiskById(id: string) {
  //   this.riskService.getById(id).subscribe(rep => {
  //     this.risk = rep
  //     this.pageTitle = "Mise à jour du risque : " + this.risk.name;
  //     this.responseMessage = { title: 'Mise à jour', message: 'mise à jour' }
  //     this.riskForm.get('titre')?.setValue(this.risk.name);
  //     this.riskForm.get('balois1')?.setValue(this.risk.taxonomie);
  //     this.riskForm.get('balois2')?.setValue(this.risk.balois);
  //     this.riskForm.get('process')?.setValue(this.risk.processId);
  //     this.riskForm2.get('description')?.setValue(this.risk.description);
  //     this.riskForm2.get('level')?.setValue(this.risk.level);
  //     this.riskForm2.get('probability')?.setValue(this.risk.probability)
  //     this.riskForm2.get('impactType')?.setValue(this.risk.impactType)
  //   });
  // }

  createRisk() {
    if (this.risk && this.riskForm.valid) {
      this.risk.name = this.riskForm.get('titre')?.value ?? '';
      this.risk.taxonomie = this.riskForm.get('balois1')?.value ?? '';
      this.risk.balois = this.riskForm.get('balois2')?.value ?? '';
      this.risk.processId = this.riskForm.get('process')?.value ?? '';
      this.risk.description = this.riskForm2.get('description')?.value ?? '';
      this.risk.level = this.riskForm2.get('level')?.value ?? '';
      this.risk.probability = this.riskForm2.get('probability')?.value ?? null;
      this.risk.impactType = this.riskForm2.get('impactType')?.value ?? null;

      console.log(this.risk)

      this.riskService.save(this.risk).subscribe(
        risk => {
          this.confirmService.openConfirmDialog(this.responseMessage.title, "La " + this.responseMessage.message + " du risque a été réalisé avec succès", false)
          this.router.navigate(['reglages', 'risks'])
        }
      )
=======
  /* ========================================================= */
  /*                     CRÉATION / MÀJ                       */
  /* ========================================================= */
  submit(): void {
    if (this.infoForm.invalid || this.detailsForm.invalid) { 
      console.error('Formulaire invalide:', this.infoForm.errors, this.detailsForm.errors);
      return; 
>>>>>>> 7fdffc6e16c0e3c71c42c9b7e3a158e6923f98c0
    }

    const riskLevel = this.detailsForm.get('level')?.value;
    const category = this.infoForm.get('balois2')?.value;
    const impactType = this.detailsForm.get('impactType')?.value;

    if (!riskLevel || !category || !impactType) {
      console.error('Valeurs obligatoires manquantes');
      return;
    }

    const payload: RiskTemplateCreateDto = {
      libelle: this.infoForm.get('libelle')!.value!,
      description: this.detailsForm.get('description')!.value!,
      processId: this.infoForm.get('process')!.value!,
      riskBrut: riskLevel,
      categoryL2: category,
      impactTypes: [impactType]
    };

    // Log pour débug
    console.log('Payload à envoyer:', payload);

    this.riskSrv.save(payload).subscribe(() => {
    this.confirm.openConfirmDialog(
      this.dialogLabel.title,
      `La ${this.dialogLabel.message} du risque a été réalisée avec succès`,
      false
    );
    this.router.navigate(['reglages','risks']);
    console.log('Risque créé avec succès', payload);
  });
  }
}
