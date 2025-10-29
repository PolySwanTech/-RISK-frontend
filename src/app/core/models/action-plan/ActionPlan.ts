import { Priority } from "../../enum/Priority";
import { Status } from "../../enum/status.enum";
import { BusinessUnit } from "../BusinessUnit";
import { Incident } from "../Incident";
import { RiskTemplate } from "../RiskTemplate";
import { Utilisateur } from "../Utilisateur";
import { Action, ActionDto } from "./Action";

export interface ActionPlan {
    id: string;
    reference: string;
    libelle: string;
    description: string;
    status: Status;
    priority: Priority;
    user: Utilisateur;
    teamInCharge: BusinessUnit;
    risk: RiskTemplate;
    incident?: Incident;
    createdAt: Date;
    closedAt: Date;
    echeance: Date;
    actif: boolean;
    actions: Action[]
}

export type ActionPlanCreationDto = Omit<
    ActionPlan,
    | 'id'
    | 'reference'
    | 'user'
    | 'risk'
    | 'incident'
    | 'createdAt'
    | 'closedAt'
    | 'actions'
    | 'actif'
> & {
    taxonomieId: string;    // UUID côté back
    incidentId?: string;    // UUID côté back, optionnel
};

export type ActionPlanListDto = Pick<
    ActionPlan,
    'id' | 'reference' | 'libelle' | 'status' | 'priority' | 'echeance' | 'createdAt' | 'closedAt'
> & {
    userInCharge: string; // nom ou identifiant d'utilisateur
    incidentRef: string;
};

export type ActionPlanDto = Omit<
    ActionPlan,
    'user' | 'teamInCharge' | 'risk' | 'incident' | 'actions'
> & {
    userInCharge: string;
    teamId: string;
    riskName: string;
    incidentId: string;
    incidentRef: string;
    actions : ActionDto[]
};

