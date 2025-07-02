import { Priority } from "../enum/Priority";
import { Status } from "../enum/status.enum";
import { RiskTemplate } from "./RiskTemplate";

export class Action {
    id: string;
    name: string;
    createdAt: Date;
    performedBy: string;
    performedAt: string;
    fileName: string;

    constructor(
        id: string,
        name: string,
        createdAt: Date,
        performedBy: string,
        performedAt: string,
        fileName: string
    ) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.performedBy = performedBy;
        this.performedAt = performedAt;
        this.fileName = fileName;
    }
}

export interface ActionPlanId{
    id: string;
    version: Date;
}

export class ActionPlan {
    actionPlanId: ActionPlanId;
    libelle: string;
    description: string;
    status: Status;
    priority: Priority;
    creator: string;
    userInCharge: string;

    taxonomie: RiskTemplate | null;
    incidentId: string;
    echeance: Date;

    actions: Action[] = [];

    reference : string = "";

    constructor(
        id: string,
        version: Date,
        libelle: string,
        description: string,
        status: Status,
        priority: Priority,
        creator: string,
        userInCharge: string,
        taxonomie: RiskTemplate | null,
        incidentId: string,
        echeance: Date
    ) {
        this.actionPlanId = { id, version };
        this.libelle = libelle;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.creator = creator;
        this.userInCharge = userInCharge;
        this.taxonomie = taxonomie;
        this.incidentId = incidentId;
        this.echeance = echeance;
    }

}

export interface ActionPlanCreateDto {
  libelle:     string;
  description: string;
  status:      Status;
  priority:    Priority;
  echeance:    Date | string;
  userInCharge: string;
  taxonomieId:  string | null;
  incidentId:   string | null;
}