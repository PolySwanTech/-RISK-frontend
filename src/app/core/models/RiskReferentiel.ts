
export class RiskReferentiel {

    id!: string;
    reference!: string;
    libelle: string = '';
    description: string = '';
    active: boolean = true;
    category!: BaloiseCategoryDto;
    creatorId!: string;
    creatorName!: string;
    declaredAt!: Date;

}

// -------------  DTO -------------
export type RiskReferentielCreateDto = Required<Pick<RiskReferentiel, 'libelle'>> & Partial<Pick<RiskReferentiel, 'description'>> & {
    category: string;
};

export interface BaloiseCategoryDto {
  libelle: string;
  definition: string | null;
  parent: string | null;
  label: string;
}