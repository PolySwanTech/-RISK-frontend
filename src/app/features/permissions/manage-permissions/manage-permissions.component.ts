import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur.service';
import { PermissionService } from '../../../core/services/permission/permission.service';
import { Permission } from '../../../core/models/permission';
import { Utilisateur } from '../../../core/models/Utilisateur';

@Component({
  selector: 'app-manage-permissions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.scss']
})
export class ManagePermissionsComponent implements OnInit {

  users: Utilisateur[] = [];
  permissions: Permission[] = [];
  selectedUser: Utilisateur | null = null;

  constructor(
    private userService: UtilisateurService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadPermissions();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  loadPermissions(): void {
    this.permissionService.getPermissions().subscribe(permissions => {
      this.permissions = permissions;
    });
  }

  selectUser(user: Utilisateur): void {
    this.selectedUser = user;
  }

  hasPermission(permissionName: string): boolean {
    return this.selectedUser?.permissions?.some(p => p.name === permissionName) || false;
  }

  togglePermission(permission: Permission): void {
    if (!this.selectedUser) return;

    const alreadyHas = this.hasPermission(permission.name);

    if (alreadyHas) {
      this.selectedUser.permissions = this.selectedUser.permissions.filter(p => p.name !== permission.name);
    } else {
      this.selectedUser.permissions.push(permission);
    }
  }

  savePermissions(): void {
    if (!this.selectedUser) return;

    const permissionIds: string[] = this.selectedUser.permissions.map(p => p.id.toString());

    this.userService.updateUserPermissions(this.selectedUser.id, permissionIds).subscribe(() => {
      alert(`Permissions mises à jour pour ${this.selectedUser!.email}`);
    });
  }
}
