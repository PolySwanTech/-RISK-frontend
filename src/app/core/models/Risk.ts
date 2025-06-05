import { EntiteResponsable } from "./EntiteResponsable";

export enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    VERY_HIGH = "VERY_HIGH",
}

export const RiskLevelLabels: Record<RiskLevel, string> = {
    [RiskLevel.LOW]: "Low",
    [RiskLevel.MEDIUM]: "Medium",
    [RiskLevel.HIGH]: "High",
    [RiskLevel.VERY_HIGH]: "Very High"
};

export class Risk{
    id : string
    name : string = ""
    taxonomie : string = ""
    balois : string = ""

    description : string = ""
    actionPlan : string = ""
    level : string = ""
    entiteResponsable : EntiteResponsable[] = []
    processId : string = ""
    // subRisks : SubRisk[] = []
    
    constructor(
        id : string, 
        name : string, 
        description : string,
        level : string, 
        processId : string, 
    ){
        this.id = id;
        this.name = name;
        this.level = level;
        this.description= description;
        this.processId = processId;
    }
}