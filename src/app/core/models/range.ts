import { RiskLevelEnum } from "../enum/riskLevel.enum";

export interface Range {
  id : number,
  libelle: string;
  riskLevel : RiskLevelEnum;
  min: number;
  max?: number;
}

export type RangeType = 'SEVERITY' | 'FREQUENCY';