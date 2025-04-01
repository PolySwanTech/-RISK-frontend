import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { EntitiesService } from '../../../core/services/entities/entities.service';

@Component({
  selector: 'app-modif-entity-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
      MatSlideToggleModule, ReactiveFormsModule],
  templateUrl: './modif-entity-dialog.component.html',
  styleUrl: './modif-entity-dialog.component.scss'
})
export class ModifEntityDialogComponent {

  entite : EntiteResponsable = new EntiteResponsable("", '', false, [], null);

  entitiesList : EntiteResponsable[] = [];

 

  constructor(public dialogRef: MatDialogRef<ModifEntityDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: EntiteResponsable, 
    public entitiesService : EntitiesService, private cdRef: ChangeDetectorRef) {
      this.entite = data || new EntiteResponsable("", '', false, [], null);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.entite.isLM = true; // Modification après l'initialisation
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
