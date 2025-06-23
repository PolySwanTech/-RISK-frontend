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
  newAction: Action = new Action('', '', new Date(), '', '', '');

  ngOnInit(): void {

  }

  formatPriority(p: Priority): string {
    return priorityLabels[p] || p;
  }

  // Ajouter une action à la liste
  addAction() {
    if (this.newAction.name.trim()) {
      this.actionPlan.actions.push({ ...this.newAction });
      this.newAction = new Action('', '', new Date(), '', '', ''); // Réinitialiser le champ
    }
  }

  // Supprimer une action de la liste
  removeAction(index: string) {
    this.actionPlan.actions = this.actionPlan.actions.filter(a => a.id !== index);
  }

  // Soumettre le plan d'action
  submitActionPlan() {
    this.actionPlan.riskTemplateId = '3d4c05a3-f2f8-44e6-bc7b-0efea5a66505'
    this.actionPlanService.createActionPlan(this.actionPlan)
      .subscribe(_ => {
        this.dialogRef.close();
        this.confirmService.openConfirmDialog(
          "Création avec succès", "Le plan d'action a été créé avec succès.")
      });
  }

}
