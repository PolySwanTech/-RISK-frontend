import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-selection.component.html',
  styleUrls: ['./category-selection.component.scss']
})
export class CategorySelectionComponent {
  breadcrumb: any[] = [];
  selectedItems: Set<string> = new Set();

  constructor(
    public dialogRef: MatDialogRef<CategorySelectionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categories: any[], selected: string[] }
  ) {
    this.selectedItems = new Set(data.selected);
  }

  handleCategoryAndNavigate(category: any, event: Event) {
    event.stopPropagation();
    this.selectedItems.add(category.name);
    this.goToSubcategories(category);
  }

  toggleSelection(category: any, event: Event | boolean) {
    let isChecked: boolean;

    if (typeof event === 'boolean') {
      isChecked = event;
    } else {
      isChecked = (event.target as HTMLInputElement).checked;
    }

    if (isChecked) {
      this.selectCategoryWithChildren(category);
    } else {
      this.deselectCategoryWithChildren(category);
    }
  }

  selectCategoryWithChildren(category: any) {
    this.selectedItems.add(category.name);
    if (category.subcategories) {
      category.subcategories.forEach((sub: any) => this.selectCategoryWithChildren(sub));
    }
  }

  deselectCategoryWithChildren(category: any) {
    this.selectedItems.delete(category.name);
    if (category.subcategories) {
      category.subcategories.forEach((sub: any) => this.deselectCategoryWithChildren(sub));
    }
  }

  isChecked(category: any): boolean {
    return this.selectedItems.has(category.name);
  }

  goToSubcategories(category: any) {
    if (category.subcategories) {
      this.breadcrumb.push(this.data.categories);
      this.data.categories = category.subcategories;
    }
  }

  goBack() {
    if (this.breadcrumb.length > 0) {
      this.data.categories = this.breadcrumb.pop();
    }
  }

  confirmSelection() {
    this.dialogRef.close(Array.from(this.selectedItems));
  }
}
