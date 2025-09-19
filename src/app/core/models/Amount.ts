import { OperatingLossFamily } from "../enum/operatingLossFamily.enum";
import { ReviewStatus } from "../enum/reviewStatus.enum";

export class Amount {
  id: string;
  amountType: AmountTypeDto;
  comptabilityRef: string | null;
  comptabilisationDate: Date | null;
  montant: number;
  operatingLossId: string;
  reviewStatus: ReviewStatus;
  actif: boolean;
  creatorName: string;
  createdAt: Date;
  closedAt: Date | null;
  closedByName: string | null;

  constructor(args: {
    id: string;
    amountType: AmountTypeDto;
    comptabilityRef: string | null;
    comptabilisationDate: Date | null;
    montant: number;
    operatingLossId: string;
    reviewStatus: ReviewStatus;
    actif: boolean;
    creatorName: string;
    createdAt: Date;
    closedAt: Date | null;
    closedByName: string | null;
  }) {
    this.id = args.id;
    this.amountType = args.amountType;
    this.comptabilityRef = args.comptabilityRef;
    this.comptabilisationDate = args.comptabilisationDate;
    this.montant = args.montant;
    this.operatingLossId = args.operatingLossId;
    this.reviewStatus = args.reviewStatus;
    this.actif = args.actif;  
    this.creatorName = args.creatorName;
    this.createdAt = args.createdAt;
    this.closedAt = args.closedAt;
    this.closedByName = args.closedByName;
  }

  static fromDto(a: AmountDto): Amount {
    return new Amount({
      id: a.id,
      amountType: a.amountType,
      comptabilityRef: a.comptabilityRef ?? null,
      comptabilisationDate: a.comptabilisationDate
        ? parseLocalDate(a.comptabilisationDate)
        : null,
      montant: a.montant,
      operatingLossId: a.operatingLossId,
      reviewStatus: a.reviewStatus,
      actif: a.actif,
      creatorName: a.creatorName,
      createdAt: new Date(a.createdAt),
      closedAt: a.closedAt ? new Date(a.closedAt) : null,
      closedByName: a.closedByName ?? null,
    });
  }
}

export interface CreateAmountDto {
  amountType: string;
  montant: number;
  comptabilityRef?: string | null;
  comptabilisationDate?: string | null; 
}

export interface AmountDto {
  id: string;
  amountType: AmountTypeDto;
  comptabilityRef?: string | null;
  comptabilisationDate?: string | null; 
  montant: number;
  operatingLossId: string;
  creatorName: string;
  createdAt: string; 
  closedAt?: string | null; 
  closedByName?: string | null;
  actif: boolean;
  reviewStatus: ReviewStatus;
}


/** Util: parse "YYYY-MM-DD" → Date local (00:00) */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export interface AmountTypeDto {
  libelle: string;
  family: OperatingLossFamily;
  label: string;
}
