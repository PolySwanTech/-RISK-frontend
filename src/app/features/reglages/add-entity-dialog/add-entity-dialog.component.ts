import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-entity-dialog',
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, FormsModule ],
  templateUrl: './add-entity-dialog.component.html',
  styleUrl: './add-entity-dialog.component.scss'
})
export class AddEntityDialogComponent {

  entityName: string = '';  // For binding the name entered by the user

  constructor(public dialogRef: MatDialogRef<AddEntityDialogComponent>) {}

  // Close the dialog without making any changes
  onCancel(): void {
    this.dialogRef.close();
  }

  // Close the dialog and pass back the entity name
  onSave(): void {
    this.dialogRef.close(this.entityName);
  }
}
