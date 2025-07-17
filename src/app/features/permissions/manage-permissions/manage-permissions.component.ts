import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { permissionLabels, PermissionName } from '../../../core/enum/permission.enum';
import { RoleService } from '../../../core/services/role/role.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateRoleDialogComponent } from '../role/create-role-dialog/create-role-dialog.component';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { Role } from '../../../core/models/TeamMember';

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
    MatAutocompleteModule,
  ],
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.scss']
})
export class ManagePermissionsComponent implements OnInit {

  roles: Role[] = [];
  filteredRoles: Role[] = [];
  permissions: PermissionName[] = [];
  selectedRole: Role | null = null;
  dialog = inject(MatDialog);
  confirmService = inject(ConfirmService);
  searchQuery: string | Role | null = null;

  constructor(
    private roleService: RoleService,
  ) { }

  formatPermission(p: PermissionName) {
    return permissionLabels[p] || p;
  }

  ngOnInit(): void {
    this.loadRoles();
    this.getPermissions()
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe(roles => {
      this.roles = roles;
      this.filteredRoles = roles;
    });
  }

  getPermissions() {
    const permissions = Object.values(PermissionName)
    this.permissions = permissions as PermissionName[];
  }

  selectUser(user: Role): void {
    this.selectedRole = user;
  }

  hasPermission(permissionName: PermissionName): boolean {
    return this.selectedRole?.permissions?.some(p => p === permissionName) || false;
  }

  togglePermission(permission: PermissionName): void {
    if (!this.selectedRole) return;

    const alreadyHas = this.hasPermission(permission);

    if (alreadyHas) {
      this.selectedRole.permissions = this.selectedRole.permissions.filter(p => p !== permission);
    } else {
      this.selectedRole.permissions.push(permission);
    }
  }

  savePermissions(): void {
    if (!this.selectedRole) return;

    this.roleService.updateRolePermissions(this.selectedRole.name, this.selectedRole.permissions).subscribe(() => {
      alert(`Permissions mises à jour pour ${this.selectedRole!.name}`);
    });
  }

  filterBySearch(): void {
    if (!this.searchQuery) {
      this.filteredRoles = this.roles;
      return;
    }

    if (typeof this.searchQuery === 'string') {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredRoles = this.roles.filter(user =>
        user.name.toLowerCase().includes(query)
      );
    } else {
      this.filteredRoles = this.roles.filter(user =>
        user.name === (this.searchQuery as Role)?.name ? (this.searchQuery as Role).name : ''
      );
    }
  }

  create() {
    this.dialog.open(CreateRoleDialogComponent)
      .afterClosed()
      .subscribe(name => {
        if (name) {
          this.roleService.create({ name: name, permissions: [] }).subscribe(role => {
            this.roles.push(role);
            this.filteredRoles.push(role);
            this.selectedRole = role;
            this.confirmService.openConfirmDialog('Création réussie', `Rôle ${role.name} créé avec succès.`)
          });
        }
      });

  }


  displayFn(role: Role): string {
    return role ? role.name : '';
  }
}