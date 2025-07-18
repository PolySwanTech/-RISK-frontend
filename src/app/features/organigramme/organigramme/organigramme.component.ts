import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Optional, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTreeModule } from '@angular/material/tree';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { CategorySelectionComponent } from '../../../shared/components/category-selection/category-selection.component';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { AddEntityDialogComponent } from '../../reglages/add-entity-dialog/add-entity-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { RoleService } from '../../../core/services/role/role.service';
import { forkJoin } from 'rxjs';
import { Role, TeamMember } from '../../../core/models/TeamMember';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur.service';

@Component({
  selector: 'app-organigramme',
  imports: [CommonModule, MatDialogModule, MatIconModule,
    MatRippleModule, MatChipsModule, MatTreeModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, FormsModule, MatSelectModule],
  templateUrl: './organigramme.component.html',
  styleUrl: './organigramme.component.scss'
})
export class OrganigrammeComponent {

  @Input() userId: string | null = null;
  @Output() rolesEvent = new EventEmitter<any>();

  teamRoles: TeamMember[] = [];
  entities: EntiteResponsable[] = [];
  filteredEntities: EntiteResponsable[] = [];
  roles: Role[] = [];

  buRoles: { buId: string; roleName: string }[] = [];

  private userService = inject(UtilisateurService);
  private entityService = inject(EntitiesService);
  private roleService = inject(RoleService);
  private dialog = inject(MatDialog);

  constructor(
    @Optional() public dialogRef: MatDialogRef<CategorySelectionComponent>,
    @Optional() public dialogRefModif: MatDialogRef<CategorySelectionComponent>,
  ) { }

  ngOnInit(): void {
    forkJoin({
      entities: this.entityService.loadEntitiesTree(),
      roles: this.roleService.getAllRoles(),
      teamRoles: this.userService.getUserRoles(this.userId)
    }).subscribe(({ entities, roles, teamRoles }) => {
      this.entities = entities;
      this.filteredEntities = this.entities;
      this.roles = roles;
      this.teamRoles = teamRoles;
      this.applyTeamRoles(this.teamRoles);
    });
  }

  childrenAccessor = (node: EntiteResponsable) => node.children ?? [];

  hasChild = (_: number, node: EntiteResponsable) => !!node.children && node.children.length > 0;

  applyTeamRoles(teamRoles: any[]) {
    const markEntity = (nodes: any[]) => {
      for (let node of nodes) {
        const match = teamRoles.find(tr => tr.buId == node.id);
        if (match) {
          node.checked = true;

          // Chercher le rôle dans la liste des rôles disponibles
          const matchingRole = this.roles.find(r => r.name == match.roleName);
          node.role = matchingRole || null;

          this.onParentCheckChange(node, { checked: true });
          this.propagateRoleToChildren(node, node.role);
        }

        if (node.children && node.children.length > 0) {
          markEntity(node.children);
        }
      }
    };

    markEntity(this.filteredEntities);

    // Rafraîchir les feuilles sélectionnées
    this.getLeafNodes(this.filteredEntities);
  }

  openEntityDialog(entite?: EntiteResponsable, event?: Event) {
    if (event) {
      event.stopPropagation(); // Empêche la propagation du clic
    }

    const dialogRef = this.dialog.open(AddEntityDialogComponent, {
      width: '500px',
      data: entite || null // Passe l'entité si c'est une modification, sinon null
    });

    dialogRef.afterClosed().subscribe(entiteResponsable => {
      if (entiteResponsable) {
        if (entiteResponsable.id == null) { // creation
          this.entityService.save(entiteResponsable).subscribe(() => {
            this.ngOnInit(); // Rafraîchir après ajout/modification
          });
        }
        else { // update
          this.entityService.update(entiteResponsable).subscribe(() => {
            this.ngOnInit(); // Rafraîchir après ajout/modification
          });
        }
      }
    });
  }

  applyFilter(event: any) {
    const filterValue = event.target.value.trim().toLowerCase();
    this.filteredEntities = this.filterNodes(this.entities, filterValue);
  }

  private filterNodes(nodes: EntiteResponsable[], filter: string): EntiteResponsable[] {
    return nodes
      .map(node => {
        const filteredChildren = node.children ? this.filterNodes(node.children, filter) : [];
        const isMatchingParent = node.name.toLowerCase().includes(filter);
        const hasMatchingChild = filteredChildren.length > 0;

        if (isMatchingParent) {
          return { ...node, children: node.children || [] };
        }
        if (hasMatchingChild) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter((node): node is EntiteResponsable => node !== null);
  }

  confirmSelection() {
    this.dialogRef?.close(this.filteredEntities); // Renvoie les entités filtrées
  }

  onParentCheckChange(node: any, event: any): void {
    node.checked = event.checked;
    this.checkAllDescendants(node, node.checked);
  }

  checkAllDescendants(node: any, checked: boolean): void {
    if (node.children && node.children.length > 0) {
      if (!node.checked) {
        node.role = null;
      }
      for (let child of node.children) {
        child.checked = checked;
        if (!child.checked) {
          child.role = null;
        }
        this.checkAllDescendants(child, checked);
      }
    }
  }

  resetRole(node: any) {
    if (!node.checked) {
      node.role = null;
    }
    this.getLeafNodes(this.filteredEntities);
  }

  onRoleChange(node: any): void {
    if (node.checked){
      // remove existing role if it exists
      this.buRoles = this.buRoles.filter(val => val.buId !== node.id);
      this.buRoles.push({ buId: node.id, roleName: node.role.name });
    }
    else{
      this.buRoles = this.buRoles.filter(val => val.buId !== node.id);
    }
  }

  propagateRoleToChildren(node: any, role: string | null): void {
    if (node.children && node.children.length > 0) {
      for (let child of node.children) {
        if (child.checked) {
          child.role = role;
          this.propagateRoleToChildren(child, role);
        }
      }
    }
    this.getLeafNodes(this.filteredEntities);
  }

  getLeafNodes(tree: any[]) {
    const leaves: any[] = [];

    const traverse = (nodes: any[]) => {
      for (let node of nodes) {
        if ((!node.children || node.children.length === 0) && node.checked && node.role) {
          leaves.push(node);
        } else {
          traverse(node.children);
        }
      }
    };

    traverse(tree);
  }

  getRoles(){
    return this.rolesEvent.emit(this.buRoles);
  }
}
