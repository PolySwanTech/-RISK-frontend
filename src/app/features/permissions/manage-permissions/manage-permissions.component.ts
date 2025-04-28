import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur.service';
import { PermissionService } from '../../../core/services/permission/permission.service';
import { Utilisateur, permissionLabels, PermissionName } from '../../../core/models/Utilisateur';

@Component({
  selector: 'app-manage-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule
  ],
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.scss']
})
export class ManagePermissionsComponent implements OnInit {
  
  users: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  permissions: PermissionName[] = [];
  selectedUser: Utilisateur | null = null;
  
  searchQuery: string | Utilisateur | null = null;
  
  constructor(
    private userService: UtilisateurService,
    private permissionService: PermissionService
  ) { }
  
  formatPermission(p: PermissionName) {
    return permissionLabels[p] || p;
  }
  
  ngOnInit(): void {
    this.loadUsers();
    this.loadPermissions();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  loadPermissions(): void {
    this.permissionService.getPermissions().subscribe(permissions => {
      console.log(permissions);
      this.permissions = permissions;
    });
  }

  selectUser(user: Utilisateur): void {
    this.selectedUser = user;
  }

  hasPermission(permissionName: PermissionName): boolean {
    return this.selectedUser?.permissions?.some(p => p === permissionName) || false;
  }

  togglePermission(permission: PermissionName): void {
    if (!this.selectedUser) return;

    const alreadyHas = this.hasPermission(permission);

    if (alreadyHas) {
      this.selectedUser.permissions = this.selectedUser.permissions.filter(p => p !== permission);
    } else {
      this.selectedUser.permissions.push(permission);
    }
  }

  savePermissions(): void {
    if (!this.selectedUser) return;

    this.userService.updateUserPermissions(this.selectedUser.id, this.selectedUser.permissions).subscribe(() => {
      alert(`Permissions mises à jour pour ${this.selectedUser!.email}`);
    });
  }

  filterBySearch(): void {
    console.log(this.searchQuery);

    if (!this.searchQuery) {
      this.filteredUsers = this.users;
      return;
    }

    if (typeof this.searchQuery === 'string') {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(query)
      );
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.username === (this.searchQuery as Utilisateur)?.username ? (this.searchQuery as Utilisateur).username : ''
      );
    }
  }

  displayFn(user: Utilisateur): string {
    return user ? user.username : '';
  }
}
