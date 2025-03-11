import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Utilisateur } from '../../../../core/models/Utilisateur';
import { CategorySelectionComponent } from '../../../../shared/components/category-selection/category-selection.component';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  userForm: FormGroup;
  categories: any[] = [];
  selectedCategories: string[] = [];

  rights : string[] = ['VIEWER', 'EDITOR', 'ADMIN', 'CENTRAL'];

  constructor(private fb: FormBuilder, private http: HttpClient, private dialog: MatDialog) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      firstname: ['', Validators.required],
      mail: ['', Validators.required],
      password: ['', Validators.required],
      equipe: ['', Validators.required],
      rights: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.http.get<any[]>('/data-example/equipe.json').subscribe(
      (data) => {
        this.categories = JSON.parse(JSON.stringify(data));
      }
    );
  }

  openCategoryDialog() {
    const dialogRef = this.dialog.open(CategorySelectionComponent, {
      width: '400px',
      data: { categories: this.categories, selected: [...this.selectedCategories] }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedCategories = result;
        this.userForm.patchValue({ equipe: this.selectedCategories.join(' > ') });
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const newUser: Utilisateur = this.userForm.value;
      newUser.equipe = {
        id: 0,
        name: this.selectedCategories.join(' > '),
        isLM: false, 
        children : [],
        childrenVisible : false
      };

      localStorage.setItem('user', JSON.stringify(newUser));
      alert('Utilisateur ajouté avec succès !');
      this.userForm.reset();
      this.selectedCategories = [];
    }
  }
}
