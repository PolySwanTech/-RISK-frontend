export interface SmaItemInput {
    name: string;      // ex: 'INTEREST_INCOME'
    label: string;     // ex: 'Interest Income'
    value: number | null; // La valeur saisie par l'utilisateur (peut être null initialement)
  }
  
  export interface SubCategoryInput {
    name: string;
    label: string;
    items: SmaItemInput[];
  }
  
  export interface CategoryInput {
    name: string;      // ex: 'ILDC', 'SC', 'FC'
    label: string;
    subCategories: SubCategoryInput[];
  }