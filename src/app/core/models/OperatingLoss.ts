import { OperatingLossFamily } from "../enum/operatingLossFamily.enum";
import { OperatingLossState } from "../enum/operatingLossState.enum";


export class OperatingLoss {
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

  constructor(args: {
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
  }) {
    this.id = args.id;
    this.libelle = args.libelle;
    this.description = args.description;
    this.state = args.state;
    this.incidentId = args.incidentId;
    this.incidentRef = args.incidentRef;
    this.createdAt = args.createdAt;
    this.montantBrut = args.montantBrut;
    this.montantNet = args.montantNet;
    this.montantFinal = args.montantFinal;
    this.type = args.type;
    this.entityId = args.entityId;
    this.entityName = args.entityName;
    this.creatorName = args.creatorName;
    this.actif = args.actif;
  }

}

export interface CreateOperatingLossDto {
  type: OperatingLossTypeDto;
  incidentId: string;
  businessUnitId: string;
  libelle: string;
  description?: string | null;
}

export interface OperatingLossTypeDto {
  libelle: string;
  family: OperatingLossFamily;
  label: string;
}
