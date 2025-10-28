import { OperatingLossFamily } from "../enum/operatingLossFamily.enum";
import { ReviewStatus } from "../enum/reviewStatus.enum";
import { OperatingLoss } from "./OperatingLoss";
import { Utilisateur } from "./Utilisateur";

export interface Amount {
  id: string;
  amountType: AmountTypeDto;
  montant: number;
  comptabilityRef?: string;
  comptabilisationDate: Date;
  reviewStatus: ReviewStatus;
  createdAt: Date;
  creator: Utilisateur;
  closedBy?: Utilisateur;
  closedAt?: Date;
  operatingLoss: OperatingLoss;
  actif: boolean;
}


export type CreateAmountDto = Pick<
  Amount,
  'montant' | 'comptabilityRef' | 'comptabilisationDate'
> & {
  amountType: string; // UUID ou enum string côté back
  operatingLossId: string;
};

export type UpdateAmountDto = Partial<Pick<
  Amount,
  'montant' | 'comptabilityRef' | 'comptabilisationDate'
>> & {
  amountType?: string;
};

export type AmountListDto = Pick<
  Amount,
  'id' | 'amountType' | 'montant' | 'reviewStatus' | 'createdAt' | 'actif'
> & {
  creatorName: string;
};


export interface AmountTypeDto {
  libelle: string;
  family: OperatingLossFamily;
  label: string;
}
