import { UtilisateurService } from './../../../../core/services/utilisateur/utilisateur.service';
import { Component, Inject, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule, OrganigrammeComponent],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  equipes: Equipe[] = [];
  teamRoles: any[] = [];
  title: string = "Créer";

  userForm: FormGroup = this._formBuilder.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    teamRoleList: [[], Validators.required]
  });

  constructor(
    private authService: AuthService, 
    private userService: UtilisateurService,
    private dialogRef: MatDialogRef<CreateUserComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    if(this.data){
      this.title = "Modifier";

      this.userForm.removeControl('password');
      this.userForm.addControl('id', this._formBuilder.control(this.data.id));

      this.userForm.patchValue({
        username: this.data.username,
        email: this.data.email,
      });

      this.userService.getUserRoles(this.data.id).subscribe((res: any) => {
        this.teamRoles = res;
      })
    }
  }

  getRoles(event: any) {
    this.userForm.get('teamRoleList')?.setValue(event);
  }

  onSubmit() {

    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value)
      // this.authService.register(this.userForm.value).subscribe({
      //   next: () => {
      //     alert("✅ Utilisateur créé !");
      //     this.dialogRef.close(true);
      //   },
      //   error: () => {
      //     alert("❌ Une erreur est survenue");
      //   }
      // });
    }


    // if (this.userForm.valid) {
    //   const newUser: Utilisateur = this.userForm.value;
    //   newUser.equipe = {
    //     id: "",
    //     name: this.selectedCategories.join(' > '),
    //     isLM: false, 
    //     children : [],
    //     childrenVisible : false
    //   };

    //   localStorage.setItem('user', JSON.stringify(newUser));
    //   alert('Utilisateur ajouté avec succès !');
    //   this.userForm.reset();
    //   this.selectedCategories = [];
    // }
  }
}
