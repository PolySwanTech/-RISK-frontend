import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { SelectEntitiesComponent } from "../../../shared/components/select-entities/select-entities.component";

@Component({
  selector: 'app-add-entity-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatSlideToggleModule, ReactiveFormsModule, SelectEntitiesComponent],
  templateUrl: './add-entity-dialog.component.html',
  styleUrls: ['./add-entity-dialog.component.scss']
})
export class AddEntityDialogComponent {

  private _formBuilder = inject(FormBuilder);

  formGroup: FormGroup = this._formBuilder.group({
    name: ['', Validators.required],
    isLM: [false],
    parent: [null]
  });

  entitiesList : EntiteResponsable[] = [];

  entiteResponsable = new EntiteResponsable("", '', false, [], null);

  constructor(public dialogRef: MatDialogRef<AddEntityDialogComponent>, public entitiesService : EntitiesService) {
  }

  entiteChange(event: any) {
    console.log(event);
    this.formGroup.get('parent')?.setValue(event);
  }

  onSave(): void {
    this.entiteResponsable.name = this.formGroup.get('name')?.value;
    this.entiteResponsable.isLM = this.formGroup.get('isLM')?.value;
    this.entiteResponsable.parent = this.formGroup.get('parent')?.value;
    this.dialogRef.close(this.entiteResponsable);
  }

  change() {
    alert('change');
  }

  goBack(){
    this.dialogRef.close();
  }
}
