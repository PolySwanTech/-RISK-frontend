import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Right, Utilisateur } from '../../../../core/models/Utilisateur';
import { CategorySelectionComponent } from '../../../../shared/components/category-selection/category-selection.component';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  userForm: FormGroup;
  
  constructor(private fb: FormBuilder, 
    private authService : AuthService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  onSubmit() {

    this.authService.register(this.userForm.value).subscribe(
      (data) => {
      }
    );
    

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
