import { Priority } from "./Priority";
import { Statut } from "./Statut";

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
    )
    {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.performedBy = performedBy;
        this.performedAt = performedAt;
        this.fileName = fileName;
    }
}

export class ActionPlan {
    id: string;
    version: Date;
    libelle: string;
    description: string;
    statut: Statut;
    priority: Priority;
    creator: string;
    userInCharge: string;

    riskTemplateId: string;
    incidentId: string;
    echeance: Date;

    actions: Action[] = [];

    constructor(
        id: string,
        version: Date,
        libelle: string,
        description: string,
        statut: Statut,
        priority: Priority,
        creator: string,
        userInCharge: string,
        riskTemplateId: string,
        incidentId: string,
        echeance: Date
    ) {
        this.id = id;
        this.version = version;
        this.libelle = libelle;
        this.description = description;
        this.statut = statut;
        this.priority = priority;
        this.creator = creator;
        this.userInCharge = userInCharge;
        this.riskTemplateId = riskTemplateId;
        this.incidentId = incidentId;
        this.echeance = echeance;
    }

}