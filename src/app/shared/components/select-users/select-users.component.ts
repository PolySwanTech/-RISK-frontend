import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Utilisateur } from "../../../core/models/Utilisateur";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { map, Observable, startWith } from "rxjs";
import { UtilisateurService } from "../../../core/services/utilisateur/utilisateur.service";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../../core/services/auth/auth.service";
import { MatInputModule } from "@angular/material/input";


@Component({
  selector: 'app-select-users',
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './select-users.component.html',
  styleUrl: './select-users.component.scss'
})
export class SelectUsersComponent {
  users: Utilisateur[] = []

  stateCtrl = new FormControl('');
  filteredStates!: Observable<Utilisateur[]>;
  filteredUsers!: Utilisateur[];
  username: string = '';

  @Input() placeholder: string = 'Collaborateurs';
  @Output() userSelected = new EventEmitter<any>();

  constructor(
    private userService: UtilisateurService, private authService: AuthService) {

  }


  ngOnInit(): void {
    this.username = this.authService.decryptToken().sub ?? '';
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  filterBySearch() {
    const value = this.stateCtrl.value;
    if (!value) {
      this.filteredUsers = this.users;
    } else if (typeof value === 'string') {
      const searchLower = value.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(searchLower)
      );
    }
    this.changeAutocompleteList();
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value; // Stocke l'objet utilisateur
    this.userSelected.emit(user)
  }

  changeAutocompleteList() {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map(state => (state ? this._filterStates(state) : this.filteredUsers.slice())),
    );
  }

  private _filterStates(value: any): Utilisateur[] {
    if (!value) return this.users;

    let filterValue: string;

    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value.username) {
      filterValue = value.username.toLowerCase();
    } else {
      console.warn('Valeur de recherche invalide:', value);
      return [];
    }

    return this.users.filter(user =>
      user.username.toLowerCase().includes(filterValue)
    );
  }

  displayFn = (user?: Utilisateur): string => {
    return user ? user.username : '';
  };
}
