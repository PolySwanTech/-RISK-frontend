import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { AddEntityDialogComponent } from '../../../features/reglages/add-entity-dialog/add-entity-dialog.component';

@Component({
  selector: 'app-category-selection',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './category-selection.component.html',
  styleUrls: ['./category-selection.component.scss']
})
export class CategorySelectionComponent implements OnInit {

  @Input() settings: boolean = false;

  entities: EntiteResponsable[] = [];
  viewEntities: EntiteResponsable[] = [];
  previous: EntiteResponsable[][] = [];

  parent : EntiteResponsable | null = null;

  breadcrumb: any[] = [];
  selectedItems: Set<string> = new Set();

  constructor(
    private entityService: EntitiesService,
    @Optional() public dialogRef: MatDialogRef<CategorySelectionComponent>,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.getEntities();
  }

  getEntities() {
    this.entityService.loadEntities().subscribe((res: any) => {
      this.entities = res;
      this.viewEntities = this.entities;
      this.previous.push(this.entities)
    });
  }

  handleCategoryAndNavigate(entite: EntiteResponsable, event: Event) {
    event.stopPropagation();
    this.parent = entite;
    this.selectedItems.add(entite.name);
    this.goToSubcategories(entite);
  }

  addEntity() {
    const dialogRef = this.dialog.open(AddEntityDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(entiteResponsable => {
      if (entiteResponsable) {
        // save entiteResponsable
        // add entiteResponsable to the children of this.parent
        console.log(entiteResponsable)
      }
    });
  }

  toggleSelection(entite: EntiteResponsable, event: Event | boolean) {
    let isChecked: boolean;

    if (typeof event === 'boolean') {
      isChecked = event;
    } else {
      isChecked = (event.target as HTMLInputElement).checked;
    }

    if (isChecked) {
      this.selectCategoryWithChildren(entite);
    } else {
      this.selectCategoryWithChildren(entite);
    }
  }

  selectCategoryWithChildren(entite: EntiteResponsable) {
    this.selectedItems.add(entite.name);
    if (entite.children.length > 0) {
      entite.children.forEach((sub: any) => this.selectCategoryWithChildren(sub));
    }
  }

  deselectCategoryWithChildren(entite: EntiteResponsable) {
    this.selectedItems.delete(entite.name);
    if (entite.children.length > 0) {
      entite.children.forEach((sub: any) => this.deselectCategoryWithChildren(sub));
    }
  }

  isChecked(entite: EntiteResponsable): boolean {
    return this.selectedItems.has(entite.name);
  }

  goToSubcategories(entite: EntiteResponsable) {
    if (entite.children.length > 0) {
      this.previous.push(this.viewEntities);
      // this.breadcrumb.push(this.data.categories);
      this.viewEntities = entite.children;
    }
  }

  goBack() {
    const prev = this.previous.pop();
    if (prev) {
      this.viewEntities = prev;
    }
  }

  confirmSelection() {
    this.dialogRef?.close(Array.from(this.selectedItems));
  }
}
