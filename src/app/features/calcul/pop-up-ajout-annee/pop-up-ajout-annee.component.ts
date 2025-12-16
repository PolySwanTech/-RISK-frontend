import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BasePopupComponent, PopupAction } from '../../../shared/components/base-popup/base-popup.component';
import { SmaItemData } from '../../../core/models/sma.model';

@Component({
  selector: 'pop-up-ajout-annee',
  standalone: true,
  templateUrl: './pop-up-ajout-annee.component.html',
  styleUrls: ['./pop-up-ajout-annee.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    BasePopupComponent
  ]
})
export class PopUpAjoutAnneeComponent implements OnInit {

  private dialogRef = inject(MatDialogRef<PopUpAjoutAnneeComponent>);
  private fb = inject(FormBuilder);

  yearForm: FormGroup;
  smaStructure: any[];
  popupActions: PopupAction[] = [];
  expandedPanels: Set<string> = new Set();

  constructor() {
    this.yearForm = this.fb.group({
      newYear: [null, [Validators.required, Validators.min(2026), Validators.max(3000)]]
    });
    this.smaStructure = [];
  }

  ngOnInit(): void {
    // 1. Construire la structure hiérarchique
    this.smaStructure = this.buildSmaStructure();

    // 2. Ajouter les contrôles de formulaire pour chaque item
    this.smaStructure.forEach(category => {
      category.subCategories.forEach((subCategory: { items: any[]; }) => {
        subCategory.items.forEach(item => {
          this.yearForm.addControl(
            item.name,
            new FormControl(null, [Validators.required, Validators.min(0)])
          );
        });
      });
    });

    this.initActions();
  }

  initActions(): void {
    this.popupActions = [
      {
        label: 'Annuler',
        icon: 'close',
        color: 'red',
        onClick: () => this.onCancel()
      },
      {
        label: 'Enregistrer',
        icon: 'check',
        primary: true,
        disabled: () => this.yearForm.invalid,
        onClick: async () => await this.onSave(),
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  private buildSmaStructure(): any[] {
    const enumValues = Object.values(SmaItemData) as any[];
    const structure: { [key: string]: any } = {};

    enumValues.forEach(item => {
      const categoryName = item.subCategory.category.name;
      const subCategoryName = item.subCategory.name;

      if (!structure[categoryName]) {
        structure[categoryName] = {
          name: categoryName,
          label: item.subCategory.category.label,
          subCategories: {}
        };
      }

      if (!structure[categoryName].subCategories[subCategoryName]) {
        structure[categoryName].subCategories[subCategoryName] = {
          name: subCategoryName,
          label: item.subCategory.label,
          items: []
        };
      }

      structure[categoryName].subCategories[subCategoryName].items.push({
        name: item.name,
        label: item.label,
        value: null
      });
    });

    return Object.values(structure).map((cat: any) => ({
      ...cat,
      subCategories: Object.values(cat.subCategories)
    }));
  }

  togglePanel(categoryName: string): void {
    if (this.expandedPanels.has(categoryName)) {
      this.expandedPanels.delete(categoryName);
    } else {
      this.expandedPanels.add(categoryName);
    }
  }

  async onSave(): Promise<void> {
    if (this.yearForm.valid) {
      const rawValues = this.yearForm.value;
      const newYear = rawValues.newYear;

      const payload: { year: number, data: { itemKey: string, value: number }[] } = {
        year: newYear,
        data: []
      };

      Object.keys(rawValues).forEach(key => {
        if (key !== 'newYear') {
          payload.data.push({ itemKey: key, value: rawValues[key] });
        }
      });

      // Simuler un petit délai pour le loading
      await new Promise(resolve => setTimeout(resolve, 500));
      this.dialogRef.close(payload);
    } else {
      this.yearForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getFieldError(fieldName: string): string {
    const control = this.yearForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('min')) {
      return 'La valeur doit être supérieure ou égale à ' + control.errors?.['min'].min;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.yearForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  getTotalItems(): number {
    return this.smaStructure.reduce((total, category) => {
      return total + category.subCategories.reduce((subTotal: number, subCategory: { items: string | any[]; }) => {
        return subTotal + subCategory.items.length;
      }, 0);
    }, 0);
  }

  getFilledItemsCount(): number {
    let count = 0;
    const values = this.yearForm.value;
    
    Object.keys(values).forEach(key => {
      if (key !== 'newYear' && values[key] != null && values[key] !== '') {
        count++;
      }
    });
    
    return count;
  }

  trackByName(_: number, item: any): string {
    return item.name;
  }
}