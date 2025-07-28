import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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
export class SelectUsersComponent implements OnInit {
  users: Utilisateur[] = []
  searchQuery: string | Utilisateur | null = null;
  stateCtrl = new FormControl<string | Utilisateur | null>(null);
  filteredStates!: Observable<Utilisateur[]>;
  filteredUsers!: Utilisateur[];
  username: string = '';

  @Input() placeholder: string = 'Collaborateurs';
  @Output() userSelected = new EventEmitter<any>();
  @Input() selectedUserId?: string | null; // ID de l'utilisateur sélectionné

  constructor(
    private userService: UtilisateurService, private authService: AuthService) {
  }


  ngOnInit(): void {
    this.username = this.authService.decryptToken()?.sub ?? '';
    this.loadUsers();
  }

loadUsers(): void {
  this.userService.getUsers().subscribe(users => {
    this.users = this.filteredUsers = users;
    this.initFiltering();
    if (this.selectedUserId) {
      const u = users.find(us => us.id === this.selectedUserId);
      if (u) {
        this.searchQuery = u;
        this.stateCtrl.setValue(u.username);
      }
    }
  });
}

  private initFiltering() {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(null),                  // plutôt que ''
      map(v => this._filterStates(v))
    );
  }

  filterBySearch(): void {
  const value = this.stateCtrl.value;

  if (!value) {                                 // null ou ''
    this.filteredUsers = this.users;
  } else if (typeof value === 'string') {      
    const searchLower = value.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.username.toLowerCase().includes(searchLower)
    );
  } else {                                      // déjà un Utilisateur
    this.filteredUsers = [value];
  }

  this.changeAutocompleteList();
}

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value;
    this.searchQuery = user;
    this.userSelected.emit(user);
  }

  changeAutocompleteList() {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map(state => (state ? this._filterStates(state) : this.filteredUsers.slice())),
    );
  }

  private _filterStates(value: string | Utilisateur | null): Utilisateur[] {
    if (!value) return this.users;

    const filterValue = typeof value === 'string'
          ? value.toLowerCase()
          : value.username.toLowerCase();

    return this.users.filter(u =>
      u.username.toLowerCase().includes(filterValue)
    );
  }
  displayFn = (user?: Utilisateur): string => {
    return user ? user.username : '';
  };
}
