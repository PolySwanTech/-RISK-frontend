import { Component, inject, Inject } from '@angular/core';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { PopupHeaderComponent } from '../../../shared/components/popup-header/popup-header.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActionCreationDto } from '../../../core/models/action-plan/Action';
import { ReviewStatus } from '../../../core/enum/reviewStatus.enum';

@Component({
  selector: 'app-add-action-dialog',
  imports: [FormsModule, CommonModule, MatFormFieldModule, PopupHeaderComponent,
    MatIconModule, MatInputModule, MatCardModule, MatButtonModule],
  templateUrl: './add-action-dialog.component.html',
  styleUrl: './add-action-dialog.component.scss'
})
export class AddActionDialogComponent {

  private actionPlanService = inject(ActionPlanService);
  private snackBarService = inject(SnackBarService);
  private dialogRef = inject(MatDialogRef<AddActionDialogComponent>);

  actions: ActionCreationDto[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { actionPlanId: string }) { }

  save() {
    this.actionPlanService.addActions(this.actions, this.data.actionPlanId).subscribe({
      next: (action) => {
        this.snackBarService.info("Action(s) ajoutée(s) avec succès");
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBarService.error("Erreur lors de l'ajout des actions");
        this.dialogRef.close(false);
      }
    });
  }

  closePopup() {
    this.dialogRef.close();
  }

  addAction() {
    let action: ActionCreationDto = {
      name: "",
      actif: true,
      actionPlanId: this.data.actionPlanId,
      performedAt: undefined,
      performedBy: undefined,
      reviewStatus: ReviewStatus.PENDING
    }
    this.actions.push(action);
  }

  removeAction(index: number) {
    this.actions.splice(index, 1);
  }
}
