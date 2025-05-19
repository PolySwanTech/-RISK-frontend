import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { Risk } from '../../../../core/models/Risk';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GoBackComponent } from "../../../../shared/components/go-back/go-back.component";
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-create-risks',
  imports: [FormsModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatSelectModule, GoBackComponent,  MatStepperModule,],
  templateUrl: './create-risks.component.html',
  styleUrl: './create-risks.component.scss'
})
export class CreateRisksComponent {

  private route = inject(ActivatedRoute)
  private riskService = inject(RiskService);
  private confirmService = inject(ConfirmService);
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);

  riskForm = this._formBuilder.group({
    titre: ['', Validators.required],
    taxonomie: ['', Validators.required],
    balois: ['', Validators.required],

  });

  riskForm2 = this._formBuilder.group({
    description: ['', Validators.required],
    plan: ['', Validators.required],
    level: ['', Validators.required]
  });


  pageTitle = "Création d'un risque"
  responseMessage = { title: 'Création', message: 'création' }

  levels = ["FAIBLE", "MOYEN", "FORT"]

  risk: Risk | undefined

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || "";
    if (id === 'create') {
      this.risk = new Risk('', '', '', []);
    }
    else {
      this.loadRiskById(id);
    }
  }

  setLevel(level: string) {
    console.log(level);
  }

  loadRiskById(id: string) {
    this.riskService.getById(id).subscribe(rep => 
      { 
        this.risk = rep 
        this.pageTitle = "Mise à jour du risque : " + this.risk.titre;
        this.responseMessage = { title: 'Mise à jour', message: 'mise à jour' }
        this.riskForm.get('titre')?.setValue(this.risk.titre);
        this.riskForm.get('taxonomie')?.setValue(this.risk.taxonomie);
        this.riskForm.get('balois')?.setValue(this.risk.balois);
        this.riskForm2.get('description')?.setValue(this.risk.description);
        this.riskForm2.get('plan')?.setValue(this.risk.actionPlan);
        this.riskForm2.get('level')?.setValue(this.risk.level);
      });
  }

  createRisk() {
    if (this.risk && this.riskForm.valid) {
      this.risk.titre = this.riskForm.get('titre')?.value ?? '';
      this.risk.taxonomie = this.riskForm.get('taxonomie')?.value ?? '';
      this.risk.balois = this.riskForm.get('balois')?.value ?? '';
      this.risk.description = this.riskForm2.get('description')?.value ?? '';
      this.risk.actionPlan = this.riskForm2.get('plan')?.value ?? '';
      this.risk.level = this.riskForm2.get('level')?.value ?? '';

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

