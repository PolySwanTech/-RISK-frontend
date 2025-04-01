import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EntiteImpactee } from '../../../core/models/EntiteImpactee';
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

  entitiesList : EntiteImpactee[] = [];

  entiteImpactee = new EntiteImpactee("", '', false, [], null);

  titlePage = "Création d'une entité impactée";

  constructor(public dialogRef: MatDialogRef<AddEntityDialogComponent>, public entitiesService : EntitiesService,
    @Inject(MAT_DIALOG_DATA) public data: EntiteImpactee, private cdRef: ChangeDetectorRef
  ) {
    this.entiteImpactee = data || new EntiteImpactee("", '', false, [], null);
  }

  ngOnInit(): void {
    if(this.data){
      this.titlePage = "Modification de l'entité impactée : " + this.data.name;
      this.formGroup.get('name')?.setValue(this.data.name);
      this.formGroup.get('isLM')?.setValue(this.data.isLM);
      this.formGroup.get('parent')?.setValue(this.data.parent);
    }
    setTimeout(() => {
      this.cdRef.detectChanges(); // Force la détection des changements
    }, 0);
  }

  entiteChange(event: any) {
    console.log(event);
    this.formGroup.get('parent')?.setValue(event.id);
  }

  onSave(): void {
    this.entiteImpactee.name = this.formGroup.get('name')?.value;
    this.entiteImpactee.isLM = this.formGroup.get('isLM')?.value;
    this.entiteImpactee.parentId = this.formGroup.get('parent')?.value;
    this.dialogRef.close(this.entiteImpactee);
  }

  change() {
    alert('change');
  }

  goBack(){
    this.dialogRef.close();
  }
}
