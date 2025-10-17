import { Type } from "../enum/controltype.enum";
import { Degree } from "../enum/degree.enum";
import { Priority } from "../enum/Priority";
import { Recurrence } from "../enum/recurrence.enum";
import { RiskLevel } from "../enum/riskLevel.enum";
import { ControlExecution } from "./ControlExecution";
import { RiskTemplate } from "./RiskTemplate";

export class ControlTemplate {

    id: string;
    reference: string;
    libelle: string;
    description: string;
    frequency: Recurrence;
    controlLevel: Degree;
    controlType: Type;
    processName: string;
    responsable: string;
    planDate: Date;
    realizeDate: Date;
    execution: ControlExecution | null = null;
    nextExecution : string;
    actif : boolean = false;
    riskLevel : RiskLevel;
    creator: string;
    riskName: string;

    constructor
        (
            id: string,
            reference: string,
            libelle: string,
            description: string,
            frequency: Recurrence,
            controlLevel: Degree,
            controlType: Type,
            taxonomie: RiskTemplate,
            responsable: string,
            planDate: Date,
            realizeDate: Date,
            processName: string,
            nextExecution: string,
            actif: boolean,
            riskLevel: RiskLevel,
            creator: string,
            riskName: string
        ) {
        this.id = id;
        this.reference = reference;
        this.libelle = libelle;
        this.description = description;
        this.frequency = frequency;
        this.controlLevel = controlLevel;
        this.controlType = controlType;
        this.processName = processName;
        this.responsable = responsable;
        this.planDate = planDate;
        this.realizeDate = realizeDate;
        this.nextExecution = nextExecution;
        this.actif = actif;
        this.riskLevel = riskLevel;
        this.creator = creator;
        this.riskName = riskName;
    }

}

// control-template.create.dto.ts
export interface ControlTemplateCreateDto {
    libelle: string,
    description: string,
    frequency: Recurrence,
    level: Degree,
    controlType: Type,
    priority: Priority,
    processId: string,
    riskId: string,
}