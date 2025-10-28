import { ReviewStatus } from "../../enum/reviewStatus.enum";
import { Utilisateur } from "../Utilisateur";

export interface Action {
    id: string;
    name: string;
    createdAt: Date;
    performedBy: Utilisateur;
    performedAt: Date;
    reviewStatus: ReviewStatus
    actif: boolean;
}

export type ActionCreationDto = Omit<Action, 'id' | 'createdAt'> & {
  actionPlanId: string; // pour rattacher à un plan
};

export type ActionDto = Required<Action>