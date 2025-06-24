import { RiskTemplate } from "./RiskTemplate";

export enum Recurence {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    SEMESTERLY = 'SEMESTERLY',
    YEARLY = 'YEARLY'
}

export enum Priority {
    MINIMAL = 'MINIMAL',
    MEDIUM = 'MEDIUM',
    MAXIMUM = 'MAXIMUM',
}

export enum Degree {
    LEVEL_1 = 'LEVEL_1',
    LEVEL_2 = 'LEVEL_2',
}

export enum Type {
    PREVENTIVE = 'PREVENTIVE',
    DETECTIVE = 'DETECTIVE', 
    CORRECTIVE = 'CORRECTIVE', 
    AUTOMATIC = 'AUTOMATIC', 
    MANUAL = 'MANUAL'
}


export class ControlTemplate {

    id : string;
    reference: string;
    libelle: string;
    description: string;
    frequency: Recurence;
    level: Degree;
    controlType: Type;
    priority: Priority;
    taxonomie: RiskTemplate;
    
    buName : string = "";

    constructor
    (
        id: string,
        reference: string,
        libelle: string,
        description: string,
        frequency: Recurence,
        level: Degree,
        controlType: Type,
        priority: Priority,
        taxonomie: RiskTemplate
    ) {
        this.id = id;
        this.reference = reference;
        this.libelle = libelle;
        this.description = description;
        this.frequency = frequency;
        this.level = level;
        this.controlType = controlType;
        this.priority = priority;
        this.taxonomie = taxonomie;
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
        taxonomie: RiskTemplate
}