import { Component, OnInit } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SmaItemData } from '../../../core/models/sma.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';

interface SmaItemValueCreationDto {
  year: string; // Doit être une chaîne de caractères (String)
  values: { [key: string]: number }; // Map<SmaItemEnum, Double> devient un objet { [key: string]: number }
}

@Component({
  selector: 'pop-up-ajout-annee',
  templateUrl: './pop-up-ajout-annee.component.html',
  styleUrls: ['./pop-up-ajout-annee.component.scss'],
  imports: [MatFormFieldModule, MatAccordion, ReactiveFormsModule,
    MatExpansionModule, MatDialogModule, MatInputModule]
})
export class PopUpAjoutAnneeComponent implements OnInit {

  yearForm: FormGroup
  smaStructure: any; // Structure des données à afficher (Catégorie/Sous-catégorie/Items)

  constructor(
    public dialogRef: MatDialogRef<PopUpAjoutAnneeComponent>,
    private fb: FormBuilder
  ) {
    this.yearForm = this.fb.group({
      newYear: [null, [Validators.required, Validators.min(2026), Validators.max(3000)]], // Exemple: la nouvelle année doit être >= 2026
      // Le reste du formulaire sera créé dynamiquement pour chaque item
    });
  }



  ngOnInit(): void {
    // 1. Construire la structure hiérarchique à partir de l'énumération
    this.smaStructure = this.buildSmaStructure();

    // 2. Initialiser le Form Group


    // 3. Ajouter les contrôles de formulaire pour chaque item
    this.smaStructure.forEach((category: { subCategories: any[]; }) => {
      category.subCategories.forEach(subCategory => {
        subCategory.items.forEach((item: { name: any; }) => {
          // Utilise le nom de l'item comme clé (ex: INTEREST_INCOME)
          this.yearForm.addControl(
            item.name,
            new FormControl(null, [Validators.required, Validators.min(0)])
          );
        });
      });
    });
  }

  // Fonction pour transformer l'énumération en une structure de données utilisable par le formulaire
  private buildSmaStructure(): any[] {
    const enumValues = Object.values(SmaItemData) as any[];
    const structure: { [key: string]: any } = {};

    enumValues.forEach(item => {
      const categoryName = item.subCategory.category.name;
      const subCategoryName = item.subCategory.name;

      // Créer la catégorie si elle n'existe pas
      if (!structure[categoryName]) {
        structure[categoryName] = {
          name: categoryName,
          label: item.subCategory.category.label,
          subCategories: {}
        };
      }

      // Créer la sous-catégorie si elle n'existe pas
      if (!structure[categoryName].subCategories[subCategoryName]) {
        structure[categoryName].subCategories[subCategoryName] = {
          name: subCategoryName,
          label: item.subCategory.label,
          items: []
        };
      }

      // Ajouter l'item
      structure[categoryName].subCategories[subCategoryName].items.push({
        name: item.name,
        label: item.label,
        value: null // Valeur initiale
      });
    });

    // Convertir l'objet en tableau pour l'affichage dans le template
    return Object.values(structure).map((cat: any) => ({
      ...cat,
      subCategories: Object.values(cat.subCategories)
    }));
  }

  onSave(): void {
    if (this.yearForm.valid) {
      const rawValues = this.yearForm.value;

      // Convertir l'année en String pour correspondre au DTO Java
      const newYear: string = String(rawValues.newYear);

      // 1. Définir le payload dans le format Map<String, Double>
      const payload: SmaItemValueCreationDto = {
        year: newYear,
        values: {} // Initialisation en tant qu'objet vide
      };

      // 2. Parcourir toutes les clés du formulaire
      Object.keys(rawValues).forEach(key => {
        // Exclure la propriété 'newYear'
        if (key !== 'newYear') {
          // Pour chaque item, la clé est le nom de l'Enum (String) et la valeur est le Double (number)
          // C'est la structure exacte d'une Map Java sérialisée en JSON.
          payload.values[key] = rawValues[key];
        }
      });

      this.dialogRef.close(payload); // Retourne le payload prêt à être envoyé au backend
    } else {
      this.yearForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}