export interface BaloiseCategoryL2 {
  name: string;
  description: string;
  categoryL1: BaloiseCategoryL1 | null;

}

export interface BaloiseCategoryL1 {
  name: string;
  description: string;
  categoriesL2?: BaloiseCategoryL2[];
}