import { Type } from "../enum/controltype.enum";
import { Degree } from "../enum/degree.enum";
import { Priority } from "../enum/Priority";
import { Recurence } from "../enum/recurence.enum";
import { ControlExecution } from "./ControlExecution";
import { RiskTemplate } from "./RiskTemplate";

export interface ControlId {
    /** UUID généré côté back */
    id: string;
    /** Instant ISO 8601 retourné par le back */
    version: Date;
}
export class ControlTemplate {

    id: ControlId;
    reference: string;
    libelle: string;
    description: string;
    frequency: Recurence;
    level: Degree;
    controlType: Type;
    processName: string;
    responsable: string;
    planDate: Date;
    realizeDate: Date;
    execution: ControlExecution | null = null;

    constructor
        (
            id: string,
            version: Date,
            reference: string,
            libelle: string,
            description: string,
            frequency: Recurence,
            level: Degree,
            controlType: Type,
            taxonomie: RiskTemplate,
            responsable: string,
            planDate: Date,
            realizeDate: Date, 
            processName : string
        ) {
        this.id = { id, version };
        this.reference = reference;
        this.libelle = libelle;
        this.description = description;
        this.frequency = frequency;
        this.level = level;
        this.controlType = controlType;
        this.processName = processName;
        this.responsable = responsable;
        this.planDate = planDate;
        this.realizeDate = realizeDate;
    }

}

// control-template.create.dto.ts
export interface ControlTemplateCreateDto {
    libelle: string,
    description: string,
    frequency: Recurence,
    level: Degree,
    controlType: Type,
    priority: Priority,
    taxonomieId: string
    taxonomieVersion: String
}