import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UtilisateurProfil } from '../../../../core/models/UtilisateurProfil';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { Equipe, EquipeService } from '../../../../core/services/equipe/equipe.service';
import { EntitiesService } from '../../../../core/services/entities/entities.service';

@Component({
  selector: 'app-update-user-pop-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './update-user-pop-up.component.html',
  styleUrls: ['./update-user-pop-up.component.scss'],
})
export class UpdateUserPopUpComponent implements OnInit {
  private fb = inject(FormBuilder);
  private entitiesService = inject(EntitiesService);

  form: FormGroup;
  equipes: Equipe[] = [];

  constructor(
    private dialogRef: MatDialogRef<UpdateUserPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UtilisateurProfil
  ) {
    this.form = this.fb.group({
      username: [data.username, Validators.required],
      equipeId: [null, Validators.required],
      role: [data.role, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEquipes();
  }

  submit() {
    if (this.form.valid) {
      const updatedUser = {
        ...this.data,
        username: this.form.value.username,
        role: this.form.value.role,
        equipeId: this.form.value.equipeId
      };

      this.dialogRef.close(updatedUser);
    }
  }

  loadEquipes() {
    this.entitiesService.loadEntities().subscribe(equipes => {
      this.equipes = equipes;

      const matched = equipes.find(e => e.name === this.data.equipeName);
      if (matched) {
        this.form.get('equipeId')?.setValue(matched.id);
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
