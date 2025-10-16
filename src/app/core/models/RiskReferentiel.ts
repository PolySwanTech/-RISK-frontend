
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

export function baloisFormatLabel(label: string | undefined): string {
  if (!label) return '';

  const words = label.toLowerCase().split('_');

  return words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word
    )
    .join(' ');
}
