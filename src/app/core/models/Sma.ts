export interface SmaInput {
  id: string;
  periodYear: number;
  createdAt: string;
  creatorUsername: string | null;
  revenusInterets: number;
  chargesInterets: number;
  actifsProductifsInterets: number;
  revenusDividendes: number;
  commissionsRecues: number;
  commissionsVersees: number;
  autresRevenusExpl: number;
  autresChargesExpl: number;
  resultatNego: number;
  resultatBanque: number;
  exemptionIlm: boolean;
  ratioCet1Pct: number;
}

export interface SmaInputCreateDto {
  periodYear: number;
  revenusInterets: number;
  chargesInterets: number;
  actifsProductifsInterets: number;
  revenusDividendes: number;
  commissionsRecues: number;
  commissionsVersees: number;
  autresRevenusExpl: number;
  autresChargesExpl: number;
  resultatNego: number;
  resultatBanque: number;
  exemptionIlm: boolean;
  ratioCet1Pct: number;
}

export interface SmaLossUpsert {
  lossYear: number;
  amountMeur: number;
}

export interface SmaLoss {
  id: string;
  lossYear: number;
  amountMeur: number;
}

export interface SmaPayload {
  input: SmaInput;
  losses: SmaLoss[];
}