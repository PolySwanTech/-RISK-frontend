import { Type } from "../enum/controltype.enum";
import { Degree } from "../enum/degree.enum";
import { Priority } from "../enum/Priority";
import { Recurence } from "../enum/recurence.enum";
import { RiskTemplate } from "./RiskTemplate";

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