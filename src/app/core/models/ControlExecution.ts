import { EvaluationControl } from "../enum/evaluation-controle.enum";
import { Evaluation } from "../enum/evaluation.enum";
import { ExecutionMode } from "../enum/exceutionmode.enum";
import { Priority } from "../enum/Priority";
import { Status } from "../enum/status.enum";

export class ControlExecution {

    id: string;
    priority: Priority;
    executionMode : ExecutionMode;
    usedData : string;
    controlData : string;
    achievedAt: Date | null;
    plannedAt: Date | null;
    performedBy: string;
    status: Status
    evaluation: EvaluationControl;
    evaluator : string;
    resume : string;
    comments: string;

    constructor(
        id: string,
        priority: Priority,
        executionMode: ExecutionMode,
        usedData: string,
        controlData: string,
        achievedAt: Date | null,
        plannedAt: Date | null,
        performedBy: string,
        status: Status,
        evaluation: EvaluationControl,
        evaluator: string,
        resume: string,
        comments: string
    ) {
        this.id = id;
        this.priority = priority;
        this.executionMode = executionMode;
        this.usedData = usedData;
        this.controlData = controlData;
        this.achievedAt = achievedAt;
        this.plannedAt = plannedAt;
        this.performedBy = performedBy;
        this.status = status;
        this.evaluation = evaluation;
        this.evaluator = evaluator;
        this.resume = resume;
        this.comments = comments;
    }
}