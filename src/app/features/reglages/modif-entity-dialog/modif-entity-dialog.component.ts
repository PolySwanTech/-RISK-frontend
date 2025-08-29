import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../core/services/entities/entities.service';

@Component({
  selector: 'app-modif-entity-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
      MatSlideToggleModule, ReactiveFormsModule],
  templateUrl: './modif-entity-dialog.component.html',
  styleUrl: './modif-entity-dialog.component.scss'
})
export class ModifEntityDialogComponent {

  entite : BusinessUnit = new BusinessUnit("", '', false, [], null);

  entitiesList : BusinessUnit[] = [];

 

  constructor(public dialogRef: MatDialogRef<ModifEntityDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: BusinessUnit, 
    public entitiesService : EntitiesService, private cdRef: ChangeDetectorRef) {
      this.entite = data || new BusinessUnit("", '', false, [], null);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.entite.lm = true; // Modification après l'initialisation
      this.cdRef.detectChanges(); // Force la détection des changements
    }, 0);
  }

  entiteChange(event: any) {
    this.entite.parent = event;
  }

  onSave(): void {
    this.dialogRef.close(this.entite);
  }

  goBack(){
    this.dialogRef.close();
  }

}
