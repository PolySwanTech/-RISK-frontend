import { Component, inject, OnInit } from '@angular/core';
import { Action, ActionPlan } from '../../../core/models/ActionPlan';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { Priority, priorityLabels } from '../../../core/models/Priority';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Status } from '../../../core/models/ControlExecution';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { MatDialogRef } from '@angular/material/dialog';

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

  private actionPlanService = inject(ActionPlanService);
  private dialogRef = inject(MatDialogRef<CreateActionPlanDialogComponent>);
  private confirmService = inject(ConfirmService);
  priorities = Object.values(Priority);

  actionPlan: ActionPlan = new ActionPlan(
    '', new Date(), '', '', Status.NOT_STARTED, Priority.MAXIMUM,
    '', '', '', '', new Date()
  );

  actions : Action[] = []

  ngOnInit(): void {

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
    this.actionPlan.riskTemplateId = '3d4c05a3-f2f8-44e6-bc7b-0efea5a66505'
    this.actionPlanService.createActionPlan(this.actionPlan)
      .subscribe(id => {
        console.log(this.actions)
        this.actionPlanService.addActions(this.actions, id).subscribe(() => {
        });
        this.dialogRef.close();
        this.confirmService.openConfirmDialog(
          "Création avec succès", "Le plan d'action a été créé avec succès.")
      });
  }

}
