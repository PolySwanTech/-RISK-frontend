import { State } from "./Incident";

export enum Priority {
    MINIMAL = 'MINIMAL',
    MEDIUM = 'MEDIUM',
    MAXIMUM = 'MAXIMUM',
}

export enum Status {
    ACHIEVED = 'ACHIEVED',
    IN_PROGRESS = 'IN_PROGRESS',
    NOT_ACHIEVED = 'NOT_ACHIEVED',
    NOT_STARTED = 'NOT_STARTED',
    CANCELLED = 'CANCELLED',
}

type StatusLabelsType = Record<Status, string>;

export const statusLabels: StatusLabelsType = {
    [Status.ACHIEVED]: 'Clôturé',
    [Status.IN_PROGRESS]: 'En cours',
    [Status.NOT_ACHIEVED]: 'Non Clôturé',
    [Status.NOT_STARTED]: 'Non Démarré',
    [Status.CANCELLED]: 'Annulé',
}

export enum Evaluation {
    VERY_LOW = 'VERY_LOW',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    VERY_HIGH = 'VERY_HIGH' 
}

export class ControlExecution {

    id: string;
    templateId: string;
    priority: Priority;
    status: Status
    achievedAt: Date | null;
    performedBy: string;
    comments: string;
    createdAt: Date;
    evaluation: Evaluation;
    evaluator : string;
    evaluatedAt: Date | null;

    constructor (
        id: string,
        templateId: string,
        priority: Priority, 
        status: Status,
        achievedAt: Date | null,
        performedBy: string,
        comments: string,
        createdAt: Date,
        evaluation: Evaluation,
        evaluator: string,
        evaluatedAt: Date | null    
    ){
        this.id = id;
        this.templateId = templateId;
        this.priority = priority;
        this.status = status;
        this.achievedAt = achievedAt;
        this.performedBy = performedBy;
        this.comments = comments;
        this.createdAt = createdAt;
        this.evaluation = evaluation;
        this.evaluator = evaluator;
        this.evaluatedAt = evaluatedAt;
    }
}