import { Component, Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { AddEntityDialogComponent } from '../../../features/reglages/add-entity-dialog/add-entity-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModifEntityDialogComponent } from '../../../features/reglages/modif-entity-dialog/modif-entity-dialog.component';

@Component({
  selector: 'app-category-selection',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, 
    MatRippleModule, MatChipsModule, MatTreeModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './category-selection.component.html',
  styleUrls: ['./category-selection.component.scss']
})
export class CategorySelectionComponent implements OnInit {

  @Input() settings: boolean = false;

  entities: EntiteResponsable[] = [];
  filteredEntities: EntiteResponsable[] = [];

  constructor(
    private entityService: EntitiesService,
    @Optional() public dialogRef: MatDialogRef<CategorySelectionComponent>,
    @Optional() public dialogRefModif: MatDialogRef<CategorySelectionComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getEntities();
  }

  childrenAccessor = (node: EntiteResponsable) => node.children ?? [];

  hasChild = (_: number, node: EntiteResponsable) => !!node.children && node.children.length > 0;

  getEntities() {
    this.entityService.loadEntitiesTree().subscribe((res: any) => {
      this.entities = res;
      this.filteredEntities = this.entities; // Initialiser avec toutes les entités
    });
  }

  addEntity() {
    const dialogRef = this.dialog.open(AddEntityDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(entiteResponsable => {
      if (entiteResponsable) {
        this.entityService.save(entiteResponsable).subscribe(() => {
          this.ngOnInit(); // Rechargement des entités après ajout
        });
      }
    });
  }

  modifEntity(event : any, entite: EntiteResponsable) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ModifEntityDialogComponent, {
      width: '500px',
      data: entite
    });

    dialogRef.afterClosed().subscribe(entiteResponsable => {
      if (entiteResponsable) {
        this.entityService.update(entiteResponsable).subscribe((resp) => {
          console.log(resp)
        });
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
}