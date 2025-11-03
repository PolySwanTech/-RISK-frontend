import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { PermissionName } from '../../../core/enum/permission.enum';
import { RoleService } from '../../../core/services/role/role.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateRoleDialogComponent } from '../role/create-role-dialog/create-role-dialog.component';
import { Role } from '../../../core/models/TeamMember';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';


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
    GoBackComponent,
    EnumLabelPipe
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
  searchQuery: string | Role | null = null;
  private snackBarService = inject(SnackBarService);

  goBackButtons: GoBackButton[] = [
    {
      label: "Ajouter un rôle",
      icon: "add",
      class: "btn-primary",
      show: true,
      permission : PermissionName.MANAGE_USERS,
      action: () => this.create()
    }
  ]


  constructor(
    private roleService: RoleService,
  ) { }

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

  selectRole(role: Role): void {
    this.selectedRole = role;
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

    this.roleService.updateRolePermissions(this.selectedRole.name, this.selectedRole.permissions).subscribe({
      next: () => {
        this.snackBarService.success(`Permissions mises à jour pour ${this.selectedRole!.name}`);
      },
      error: () => {
        this.snackBarService.error(`Erreur lors de la mise à jour des permissions pour ${this.selectedRole!.name}`);
      }
    }
    );
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
            this.selectedRole = role
            this.roles.push(role);
            this.searchQuery = role.name
            this.snackBarService.info('Rôle créé avec succès.')
          });
        }
      });

  }


  displayFn(role: Role): string {
    return role ? role.name : '';
  }
}