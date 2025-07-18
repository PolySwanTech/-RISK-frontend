import { UtilisateurService } from './../../../../core/services/utilisateur/utilisateur.service';
import { Component, Inject, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Equipe, EquipeService } from '../../../../core/services/equipe/equipe.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OrganigrammeComponent } from "../../../organigramme/organigramme/organigramme.component";
import { MatButtonModule } from '@angular/material/button';
import { arrayNotEmptyValidator } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule, OrganigrammeComponent, MatButtonModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  @ViewChild(OrganigrammeComponent)
  organigrammeComponent!: OrganigrammeComponent;

  private _formBuilder = inject(FormBuilder);
  equipes: Equipe[] = [];
  teamRoles: any[] = [];
  title: string = "Créer";

  update: boolean = false;

  userForm: FormGroup = this._formBuilder.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    teamRoleList: [[], [arrayNotEmptyValidator]]
  });

  private userService = inject(UtilisateurService);
  private dialogRef = inject(MatDialogRef<CreateUserComponent>);
  private authService = inject(AuthService);

  constructor
    (@Inject(MAT_DIALOG_DATA) public data: any) {
  }


  ngOnInit() {
    if (this.data && this.data.update) {
      this.title = "Modifier";
      this.update = this.data.update;

      this.userForm.removeControl('password');

      this.userForm.patchValue({
        username: this.data.user.username,
        email: this.data.user.email,
      });
    }
  }

  getRoles(event: any) {
    this.userForm.patchValue({
      teamRoleList: event
    });
  }
  
  onSubmit() {
    this.organigrammeComponent.getRoles();
    if (this.userForm.valid) {
      if (this.update) {
        let payload =
        {
          username: this.userForm.value.username,
          email: this.userForm.value.email,
        }
        this.userService.updateUser(this.data.user.id, payload).subscribe({
          next: user => {
            this.dialogRef.close(true);
            this.userService.updateUserRoles(user.id, this.userForm.value.teamRoleList).subscribe({
              next: () => {
                this.dialogRef.close(true);
              }
            });
          }
        });
      }
      else {
        this.authService.register(this.userForm.value).subscribe({
          next: user => {
            this.userService.updateUserRoles(user.id, this.userForm.value.teamRoleList).subscribe({
              next: () => {
                alert("✅ Utilisateur créé avec succès");
                this.dialogRef.close(true);
              }
            });
          },
          error: () => {
            alert("❌ Une erreur est survenue");
          }
        });
      }
    }
  }

}
