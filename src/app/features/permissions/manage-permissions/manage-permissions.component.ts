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
import { Permission } from '../../../core/models/permission';
import { Utilisateur } from '../../../core/models/Utilisateur';

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
  permissions: Permission[] = [];
  selectedUser: Utilisateur | null = null;

  permissionDescriptions: Map<string, string> = new Map([
    ['VIEW_INCIDENTS', 'Voir les incidents'],
    ['CREATE_INCIDENTS', 'Créer des incidents'],
    ['VIEW_DASHBOARD', 'Accéder au tableau de bord'],
    ['MANAGE_SETTINGS', 'Gérer les paramètres'],
    ['MANAGE_USERS', 'Gérer les utilisateurs']
  ]);

  searchQuery: string | Utilisateur | null = null;

  constructor(
    private userService: UtilisateurService,
    private permissionService: PermissionService
  ) { }

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
    this.permissionService.getPermissions().subscribe(permissionNames => {
      this.permissions = permissionNames.map(permName => {
        const name = typeof permName === 'string' ? permName : permName.name;
        return {
          id: name,
          name: name,
          description: this.permissionDescriptions.get(name) || name
        };
      });
    });
  }

  selectUser(user: Utilisateur): void {
    this.selectedUser = user;
    if (this.selectedUser && this.selectedUser.permissions) {
      this.selectedUser.permissions = this.selectedUser.permissions.map(perm => {
        if (typeof perm === 'string') {
          return {
            id: perm,
            name: perm,
            description: this.permissionDescriptions.get(perm) || perm
          };
        }
        return perm;
      });
    }
  }

  hasPermission(permissionName: string): boolean {
    if (!this.selectedUser || !this.selectedUser.permissions) return false;

    return this.selectedUser.permissions.some(p => {
      if (typeof p === 'string') {
        return p === permissionName;
      }
      return p.name === permissionName;
    });
  }

  togglePermission(permission: Permission): void {
    if (!this.selectedUser) return;

    if (!this.selectedUser.permissions) {
      this.selectedUser.permissions = [];
    }

    const alreadyHas = this.hasPermission(permission.name);

    if (alreadyHas) {
      this.selectedUser.permissions = this.selectedUser.permissions.filter(p => {
        if (typeof p === 'string') {
          return p !== permission.name;
        }
        return p.name !== permission.name;
      });
    } else {
      this.selectedUser.permissions.push({
        id: permission.id,
        name: permission.name,
        description: permission.description
      });
    }
  }

  savePermissions(): void {
    if (!this.selectedUser) return;

    const permissionIds: string[] = this.selectedUser.permissions.map(p =>
      typeof p === 'string' ? p : p.name
    );

    this.userService.updateUserPermissions(this.selectedUser.id, permissionIds).subscribe(() => {
      alert(`Permissions mises à jour pour ${this.selectedUser!.email}`);
    });
  }

  filterBySearch(): void {
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