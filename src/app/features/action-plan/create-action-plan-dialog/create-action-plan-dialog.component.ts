import { Component, Inject, inject, OnInit } from '@angular/core';
import { Action, ActionPlan } from '../../../core/models/ActionPlan';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { Priority, priorityLabels } from '../../../core/enum/Priority';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Equipe, EquipeService } from '../../../core/services/equipe/equipe.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Status } from '../../../core/enum/status.enum';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { RiskService } from '../../../core/services/risk/risk.service';

@Component({
  selector: 'app-create-action-plan-dialog',
  imports: [
    CommonModule,
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

  private actionPlanService = inject(ActionPlanService);
  private dialogRef = inject(MatDialogRef<CreateActionPlanDialogComponent>);
  private confirmService = inject(ConfirmService);
  private equipeService = inject(EquipeService);
  private riskService = inject(RiskService);
  private router = inject(Router);
  priorities = Object.values(Priority);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { incidentId: string, reference : string }
  ) { }

  listTeams: Equipe[] = [];

  risks: RiskTemplate[] = [];

  actionPlan: ActionPlan = new ActionPlan(
    '', new Date(), '', '', Status.NOT_STARTED, Priority.MAXIMUM,
    '', '', null, '', new Date()
  );

  actions: Action[] = []

  ngOnInit(): void {
    this.fetchTeams();
    this.getRisk();
  }

  getRisk() {
    this.riskService.getAll().subscribe(data => {
      this.risks = data;
    });
  }


  fetchTeams(): void {
    this.equipeService.getAllEquipes().subscribe({
      next: teams => {
        this.listTeams = teams;
      },
      error: err => {
        console.error("Erreur lors du chargement des équipes", err);
      }
    });
  }


  formatPriority(p: Priority): string {
    return priorityLabels[p] || p;
  }

  // Ajouter une action à la liste
  addAction() {
    this.actions.push(new Action('', '', new Date(), '', '', ''));
  }

  updateAction(index: number, action: Action) {
    console.log(action)
    // Mettre à jour l'action à l'index spécifié
    this.actions[index] = action;
  }

  // Supprimer une action de la liste
  removeAction(index: number) {
    this.actions.splice(index, 1);
  }

  // Soumettre le plan d'action
  submitActionPlan() {
    if(this.data){
      this.actionPlan.incidentId = this.data.incidentId
    }
    console.log(this.actionPlan);
    this.actionPlanService.createActionPlan(this.actionPlan)
      .subscribe(id => {
        this.actionPlanService.addActions(this.actions, id).subscribe(() => {
        });
        this.dialogRef.close();
        this.confirmService.openConfirmDialog(
          "Création avec succès", "Aller à la consultation ?").subscribe((value) => {
            value ? this.router.navigate(['/action-plan', id]) : this.ngOnInit();
          })
      });
  }
}
