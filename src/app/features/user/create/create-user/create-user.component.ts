import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Right, Utilisateur } from '../../../../core/models/Utilisateur';
import { CategorySelectionComponent } from '../../../../shared/components/category-selection/category-selection.component';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Equipe, EquipeService } from '../../../../core/services/equipe/equipe.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private equipeService = inject(EquipeService);
  equipes: Equipe[] = [];
  userForm: FormGroup = this._formBuilder.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    equipeId: [null, Validators.required],
    role: ['MEMBRE', Validators.required]
  });

  constructor(
    private authService: AuthService, private dialogRef: MatDialogRef<CreateUserComponent>) {
  }

  ngOnInit() {
    this.equipeService.getAllEquipes().subscribe(equipes => {
      this.equipes = equipes;
    });
  }

  onSubmit() {

    console.log(this.userForm)

    if (this.userForm.valid) {
      this.authService.register(this.userForm.value).subscribe({
        next: () => {
          alert("✅ Utilisateur créé !");
          this.dialogRef.close(true);
        },
        error: () => {
          alert("❌ Une erreur est survenue");
        }
      });
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
