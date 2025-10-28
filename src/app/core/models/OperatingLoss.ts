import { OperatingLossFamily } from "../enum/operatingLossFamily.enum";
import { OperatingLossState } from "../enum/operatingLossState.enum";

export interface OperatingLoss {
  id: string;
  libelle: string;
  description: string | null;
  state: OperatingLossState;

  incidentId: string;
  incidentRef: string;

  createdAt: Date;

  montantBrut: number;
  montantNet: number;
  montantFinal: number;

  type: OperatingLossTypeDto;

  entityId: string | null;
  entityName: string | null;

  creatorName: string;
  actif: boolean;
}

export type CreateOperatingLossDto = Pick<OperatingLoss, 'incidentId' | 'libelle'> & {
  businessUnitId: string;
  type: Required<OperatingLossTypeDto>; // toutes les propriétés du type sont obligatoires
  description?: string | null;          // facultatif
};

export interface OperatingLossTypeDto {
  libelle: string;
  family: OperatingLossFamily;
  label: string;
}
