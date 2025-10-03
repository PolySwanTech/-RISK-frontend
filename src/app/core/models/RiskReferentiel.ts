
export class RiskReferentiel {

    id!: string;
    reference!: string;
    libelle: string = '';
    description: string = '';
    category!: BaloiseCategoryDto;


}

// -------------  DTO -------------
export interface RiskReferentielCreateDto {
  libelle:        string;
  category: BaloiseCategoryDto;
  description: string;
}

export interface BaloiseCategoryDto {
  libelle: string;
  definition: string | null;
  parent: string | null;
  label: string;
}