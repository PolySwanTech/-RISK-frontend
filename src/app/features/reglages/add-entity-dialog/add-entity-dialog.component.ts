import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';

@Component({
  selector: 'app-add-entity-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, 
    MatSlideToggleModule, ReactiveFormsModule ],
  templateUrl: './add-entity-dialog.component.html',
  styleUrls: ['./add-entity-dialog.component.scss']
})
export class AddEntityDialogComponent {

  private _formBuilder = inject(FormBuilder);

  formGroup: FormGroup = this._formBuilder.group({
    name: ['', Validators.required],
    isLM: [false], // Default to false if not provided
  });

  entiteResponsable = new EntiteResponsable(0, '', false, []);

  constructor(public dialogRef: MatDialogRef<AddEntityDialogComponent>) {}

  onSave(): void {
    // Ensure form value is applied to the entity
    this.entiteResponsable.name = this.formGroup.get('name')?.value;
    this.entiteResponsable.isLM = this.formGroup.get('isLM')?.value;
    this.dialogRef.close(this.entiteResponsable);
  }

  change() {
    alert('change');
  }
}
