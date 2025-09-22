import { Component, inject, Inject, OnInit } from '@angular/core';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Action } from '../../../core/models/ActionPlan';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { PopupHeaderComponent } from '../../../shared/components/popup-header/popup-header.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-action-dialog',
  imports: [FormsModule, CommonModule, MatFormFieldModule, PopupHeaderComponent,
     MatIconModule, MatInputModule, MatCardModule, MatButtonModule],
  templateUrl: './add-action-dialog.component.html',
  styleUrl: './add-action-dialog.component.scss'
})
export class AddActionDialogComponent implements OnInit{

  private actionPlanService = inject(ActionPlanService);
  private snackBarService = inject(SnackBarService);
  private dialogRef = inject(MatDialogRef<AddActionDialogComponent>);

  actions : Action[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: {actionPlanId: string}){}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  save(){
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
  
  closePopup(){
    this.dialogRef.close();
  }

  addAction(){
    this.actions.push(new Action('', '', new Date(), '', '', ''));
  }

  removeAction(index : number){
    this.actions.splice(index, 1);
  }
}
