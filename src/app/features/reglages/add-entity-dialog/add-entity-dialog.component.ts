import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { SelectEntitiesComponent } from "../../../shared/components/select-entities/select-entities.component";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-entity-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatSlideToggleModule, ReactiveFormsModule, SelectEntitiesComponent, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './add-entity-dialog.component.html',
  styleUrls: ['./add-entity-dialog.component.scss']
})
export class AddEntityDialogComponent {

  private _formBuilder = inject(FormBuilder);

  formGroup: FormGroup = this._formBuilder.group({
    name: ['', Validators.required],
    lm: [false],
    parent: [null]
  });

  entiteResponsable = new EntiteResponsable("", '', false, [], null);

  titlePage = "Création d'une entité responsable";

  constructor(public dialogRef: MatDialogRef<AddEntityDialogComponent>, public entitiesService : EntitiesService,
    @Inject(MAT_DIALOG_DATA) public data: EntiteResponsable, private cdRef: ChangeDetectorRef
  ) {
    this.entiteResponsable = data || new EntiteResponsable("", '', false, [], null);
  }

  ngOnInit(): void {
    if(this.data){
      this.titlePage = "Modification de l'entité responsable : " + this.data.name;
      this.formGroup.get('name')?.setValue(this.data.name);
      this.formGroup.get('lm')?.setValue(this.data.lm);
      this.formGroup.get('parent')?.setValue(this.data.parent);
    }
    setTimeout(() => {
      this.cdRef.detectChanges(); // Force la détection des changements
    }, 0);
  }

  entiteChange(event: any) {
    this.formGroup.get('parent')?.setValue(event.id);
  }

  onSave(): void {
    this.entiteResponsable.name = this.formGroup.get('name')?.value;
    this.entiteResponsable.lm = this.formGroup.get('lm')?.value;
    this.entiteResponsable.parentId = this.formGroup.get('parent')?.value;
    this.dialogRef.close(this.entiteResponsable);
  }

  change() {
    alert('change');
  }

  goBack(){
    this.dialogRef.close();
  }
}
