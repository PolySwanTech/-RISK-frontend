import { Priority } from "../enum/Priority";
import { Status } from "../enum/status.enum";

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

    taxonomieId: string;
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
        taxonomieId: string,
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
        this.taxonomieId = taxonomieId;
        this.incidentId = incidentId;
        this.echeance = echeance;
    }

}