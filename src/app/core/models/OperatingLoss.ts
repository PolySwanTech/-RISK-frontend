import { OperatingLossFamily } from "../enum/operatingLossFamily.enum";
import { OperatingLossState } from "../enum/operatingLossState.enum";


export class OperatingLoss {
  id: string;
  libelle: string;
  comptabilityRef: string | null;
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

  constructor(args: {
    id: string;
    libelle: string;
    comptabilityRef: string | null;
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
  }) {
    this.id = args.id;
    this.libelle = args.libelle;
    this.comptabilityRef = args.comptabilityRef;
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
  }

}

export interface CreateOperatingLossDto {
  type: OperatingLossTypeDto;
  incidentId: string;
  businessUnitId: string;
  libelle: string;
  description?: string | null;
  comptabilityRef?: string | null;
}

export interface OperatingLossTypeDto {
  libelle: string;
  family: OperatingLossFamily;
}
