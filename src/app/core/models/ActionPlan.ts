import { Priority } from "../enum/Priority";
import { ReviewStatus } from "../enum/reviewStatus.enum";
import { Status } from "../enum/status.enum";
import { RiskTemplate } from "./RiskTemplate";

export class Action {
    id: string;
    name: string;
    createdAt: Date;
    performedBy: string;
    performedAt: string;
    fileName: string;
    reviewStatus: ReviewStatus;
    actif: boolean;
    constructor(
        id: string,
        name: string,
        createdAt: Date,
        performedBy: string,
        performedAt: string,
        fileName: string,
        reviewStatus: ReviewStatus = ReviewStatus.PENDING,
        actif: boolean = true   
    ) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.performedBy = performedBy;
        this.performedAt = performedAt;
        this.fileName = fileName;
        this.reviewStatus = reviewStatus;
        this.actif = actif;
    }
}


export class ActionPlan {
    id: string;
    reference: string;
    libelle: string;
    description: string;
    status: Status;
    priority: Priority;
    creator: string;
    
    teamId : string;
    userInCharge: string;
    riskName : string = "";
    riskId : string = "";
    taxonomie: RiskTemplate | null;
    incidentId: string;
    echeance: Date = new Date();

    createdAt: Date = new Date();
    
    closedAt: Date | null = null;

    actions: Action[] = [];

    incidentRef : string = "";
    actif: boolean;

    constructor(
        id: string,
        reference: string,
        libelle: string,
        description: string,
        status: Status,
        priority: Priority,
        creator: string,
        teamId : string,
        userInCharge: string,
        taxonomie: RiskTemplate | null,
        incidentId: string,
        echeance: Date,
        actif: true
    ) {
        this.id = id;
        this.reference = reference;
        this.libelle = libelle;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.creator = creator;
        this.teamId = teamId;
        this.userInCharge = userInCharge;
        this.taxonomie = taxonomie;
        this.incidentId = incidentId;
        this.echeance = echeance;
        this.actif = actif;
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