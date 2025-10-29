import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SelectEntitiesComponent } from "../../../shared/components/select-entities/select-entities.component";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BasePopupComponent, PopupAction } from "../../../shared/components/base-popup/base-popup.component";

@Component({
  selector: 'app-add-entity-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatCardModule,
    MatSlideToggleModule, ReactiveFormsModule, SelectEntitiesComponent, MatFormFieldModule, MatInputModule, MatButtonModule, BasePopupComponent],
  templateUrl: './add-entity-dialog.component.html',
  styleUrls: ['./add-entity-dialog.component.scss']
})
export class AddEntityDialogComponent {

  titlePage: string = 'Créer une entité';
  formGroup!: FormGroup;
  popupActions: PopupAction[] = [];
  BusinessUnit: any = {};
  data: any;

  constructor(private fb: FormBuilder) {}
  private dialogRef = inject(MatDialogRef<AddEntityDialogComponent>);

  ngOnInit(): void {
    this.initForm();
    this.initActions();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      name: ['', Validators.required],
      lm: [false]
    });
  }

  getDialogRef(){
    return this.dialogRef;
  }

  initActions(): void {
  this.popupActions = [
    {
      label: 'Annuler',
      icon: 'close',
      color: 'red',
      onClick: () => this.goBack()
    },
    {
      label: this.data ? 'Mettre à jour' : 'Créer',
      icon: 'check',
      primary: true,
      disabled: () => this.formGroup.invalid, // ✅ fonction dynamique
      onClick: () => this.onSave()
    }
  ];
}

  goBack(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onSave(): void {
    if (this.formGroup.valid) {
      console.log('Saving:', this.formGroup.value);
      // Logique de sauvegarde
    }
  }

  entiteChange(event: any): void {
    console.log('Entity changed:', event);
  }
}