import { Evaluation } from "../enum/evaluation.enum";
import { Priority } from "../enum/Priority";
import { Status } from "../enum/status.enum";

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