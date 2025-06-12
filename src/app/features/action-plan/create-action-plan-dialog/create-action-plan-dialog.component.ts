import { Component, inject, OnInit } from '@angular/core';
import { ActionPlan } from '../../../core/models/ActionPlan';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { Impact } from '../../../core/models/Impact';
import { Process } from '../../../core/models/Process';
import { Risk } from '../../../core/models/RiskTemplate';
import { Statut } from '../../../core/models/Statut';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RiskService } from '../../../core/services/risk/risk.service';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { Utilisateur } from '../../../core/models/Utilisateur';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur.service';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { Priority } from '../../../core/models/Priority';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-action-plan-dialog',
  imports: [
    FormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './create-action-plan-dialog.component.html',
  styleUrl: './create-action-plan-dialog.component.scss'
})
export class CreateActionPlanDialogComponent implements OnInit {

  riskService = inject(RiskService);
  buService = inject(EntitiesService);
  processService = inject(ProcessService);
  userService = inject(UtilisateurService);
  actionPlanService = inject(ActionPlanService);
  private fb = inject(FormBuilder);

  actionPlan: ActionPlan = new ActionPlan(
    '', '', '', '', null!, null!, '', null!, new Date(), null!, null!, null!
  );

  form: FormGroup = this.fb.group({
    libelle: ['', Validators.required],
    description: ['', Validators.required],
    echeance: [null, Validators.required],
    status: ['', Validators.required],
    priority: ['', Validators.required],
    impact: ['', Validators.required],
    entiteResponsableId: ['', Validators.required],
    processId: ['', Validators.required],
    riskId: ['', Validators.required]
  });

  risks: Risk[] = [/* à remplir */];
  impacts: Impact[] = [/* à remplir */];
  statuts = Object.values(Statut);
  priorities = Object.values(Priority);
  entitesResponsables: EntiteResponsable[] = [/* à remplir */];
  processes: Process[] = [/* à remplir */];
  responsables: Utilisateur[] = [/* à remplir */];

  entiteResponsableId = ""
  processId = "";


  ngOnInit(): void {
    this.buService.loadEntities().subscribe(entites => {
      this.entitesResponsables = entites;
    });

    this.userService.getUsers().subscribe(responsables => {
      this.responsables = responsables;
    });
  }

  onSubmit() {
    if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const actionPlan: ActionPlan = {
    ...this.form.value,
    echeance: new Date(this.form.value.echeance),
  };

  this.actionPlanService.createActionPlan(actionPlan).subscribe(
    response => {
      console.log('Action Plan créé avec succès', response);
    },
    error => {
      console.error('Erreur lors de la création de l\'Action Plan', error);
    }
  );
  }

  onEntiteResponsableChange() {
  const entiteResponsableId = this.form.get('entiteResponsableId')?.value;
  if (entiteResponsableId) {
    this.processService.getAllByEntite(entiteResponsableId).subscribe(processes => {
      this.processes = processes;
    });
  }
}

onProcessChange() {
  const processId = this.form.get('processId')?.value;
  if (processId) {
    this.riskService.getAllByProcess(processId).subscribe(risks => {
      this.risks = risks;
    });
  }
}
}
