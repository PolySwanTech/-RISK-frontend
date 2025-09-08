import { OperatingLossFamily } from "../enum/operatingLossFamily.enum";

export class Amount {
  id: string;
  amountType: AmountTypeDto;
  comptabilisationDate: Date | null;
  montant: number;
  operatingLossId: string;

  constructor(args: {
    id: string;
    amountType: AmountTypeDto;
    comptabilisationDate: Date | null;
    montant: number;
    operatingLossId: string;
  }) {
    this.id = args.id;
    this.amountType = args.amountType;
    this.comptabilisationDate = args.comptabilisationDate;
    this.montant = args.montant;
    this.operatingLossId = args.operatingLossId;
  }

  static fromDto(a: AmountDto): Amount {
    return new Amount({
      id: a.id,
      amountType: a.amountType,
      comptabilisationDate: a.comptabilisationDate
        ? parseLocalDate(a.comptabilisationDate)
        : null,
      montant: a.montant,
      operatingLossId: a.operatingLossId,
    });
  }
}

export interface CreateAmountDto {
  amountType: AmountTypeDto;
  montant: number;
  comptabilisationDate?: string | null; // "YYYY-MM-DD" ou null
}

export interface AmountDto {
  id: string;
  amountType: AmountTypeDto;
  comptabilisationDate?: string | null; // "YYYY-MM-DD" ou null
  montant: number;
  operatingLossId: string;
}


/** Util: parse "YYYY-MM-DD" → Date local (00:00) */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export interface AmountTypeDto {
  libelle: string;
  family: OperatingLossFamily;
}
