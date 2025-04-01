import { Component, Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { EntiteImpactee } from '../../../core/models/EntiteImpactee';
import { AddEntityDialogComponent } from '../../../features/reglages/add-entity-dialog/add-entity-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModifEntityDialogComponent } from '../../../features/reglages/modif-entity-dialog/modif-entity-dialog.component';
import { GoBackComponent } from "../go-back/go-back.component";

@Component({
  selector: 'app-category-selection',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule,
    MatRippleModule, MatChipsModule, MatTreeModule, MatButtonModule, MatFormFieldModule, MatInputModule, GoBackComponent],
  templateUrl: './category-selection.component.html',
  styleUrls: ['./category-selection.component.scss']
})
export class CategorySelectionComponent implements OnInit {

  @Input() settings: boolean = true;

  entities: EntiteImpactee[] = [];
  filteredEntities: EntiteImpactee[] = [];

  constructor(
    private entityService: EntitiesService,
    @Optional() public dialogRef: MatDialogRef<CategorySelectionComponent>,
    @Optional() public dialogRefModif: MatDialogRef<CategorySelectionComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getEntities();
  }

  childrenAccessor = (node: EntiteImpactee) => node.children ?? [];

  hasChild = (_: number, node: EntiteImpactee) => !!node.children && node.children.length > 0;

  getEntities() {
    this.entityService.loadEntitiesTree().subscribe((res: any) => {
      this.entities = res;
      this.filteredEntities = this.entities; // Initialiser avec toutes les entités
    });
  }

  openEntityDialog(entite?: EntiteImpactee, event?: Event) {
    if (event) {
      event.stopPropagation(); // Empêche la propagation du clic
    }
  
    const dialogRef = this.dialog.open(AddEntityDialogComponent, {
      width: '500px',
      data: entite || null // Passe l'entité si c'est une modification, sinon null
    });
  
    dialogRef.afterClosed().subscribe(entiteImpactee => {
      if (entiteImpactee) {
        this.entityService.save(entiteImpactee).subscribe(() => {
          this.ngOnInit(); // Rafraîchir après ajout/modification
        });
      }
    });
  }

  applyFilter(event: any) {
    const filterValue = event.target.value.trim().toLowerCase();
    this.filteredEntities = this.filterNodes(this.entities, filterValue);
  }

  private filterNodes(nodes: EntiteImpactee[], filter: string): EntiteImpactee[] {
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
      .filter((node): node is EntiteImpactee => node !== null);
  }

  confirmSelection() {
    this.dialogRef?.close(this.filteredEntities); // Renvoie les entités filtrées
  }
}