import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { RiskLevel } from '../../../../core/enum/riskLevel.enum';
import { RiskImpactType } from '../../../../core/enum/riskImpactType.enum';
import { Risk, RiskLevelLabels, RiskImpactTypeLabels } from '../../../../core/models/Risk';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GoBackComponent } from "../../../../shared/components/go-back/go-back.component";
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { ProcessService } from '../../../../core/services/process/process.service';
import { BaloisCategoriesService, BaloiseCategoryL1, BaloiseCategoryL2 } from '../../../../core/services/balois-categories/balois-categories.service';
import { Process } from '../../../../core/models/Process';


@Component({
  selector: 'app-create-risks',
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule,
    MatSelectModule, GoBackComponent, MatStepperModule, MatButtonModule],
  templateUrl: './create-risks.component.html',
  styleUrl: './create-risks.component.scss'
})
export class CreateRisksComponent implements OnInit {

  private route = inject(ActivatedRoute)
  private riskService = inject(RiskService);
  private confirmService = inject(ConfirmService);
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private baloisCategoriesService = inject(BaloisCategoriesService);
  private processService = inject(ProcessService);

  categoriesBaloise: BaloiseCategoryL1[] = [];
  process: Process[] = [];


  riskForm = this._formBuilder.group({
    titre: ['', Validators.required],
    balois1: ['', Validators.required],
    balois2: ['', Validators.required],
    process: ['', Validators.required],
  });

  riskForm2 = this._formBuilder.group({
    description: ['', Validators.required],
    level: ['', Validators.required],
    probability: [null as number | null, [Validators.pattern(/^\d+(\.\d+)?$/)]],
    impactType: [null as RiskImpactType | null]
  });

  get sousCategoriesFiltered(): BaloiseCategoryL2[] {
    const selectedCatName = this.riskForm.get('balois1')?.value;
    const catL1 = this.categoriesBaloise.find(cb => cb.name === selectedCatName);
    return catL1?.categoriesL2 ?? [];
  }


  pageTitle = "Création d'un risque"
  responseMessage = { title: 'Création', message: 'création' }

  riskLevels = Object.values(RiskLevel);

  impactTypes = Object.values(RiskImpactType);

  riskLabels = RiskLevelLabels;

  impactLabels = RiskImpactTypeLabels;

  risk: Risk | undefined

  ngOnInit(): void {
    this.baloisCategoriesService.getAll().subscribe(data => {
      this.categoriesBaloise = data;
    });
    this.processService.getAll().subscribe(processes => {
      this.process = processes
    });
    this.risk = new Risk('', '', '', '', '');
  }

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
    }
  }

}

