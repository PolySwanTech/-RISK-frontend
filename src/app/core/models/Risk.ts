import { EntiteResponsable } from "./EntiteResponsable";
import { Process } from "./Process";
import { SubRisk } from "./SubRisk";

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
    titre : string = ""
    taxonomie : string
    balois : string

    description : string = ""
    actionPlan : string = ""
    level : string = ""
    entiteResponsable : EntiteResponsable[] = []
    processes : Process[] = []
    subRisks : SubRisk[]
    
    constructor(
        id : string,
        taxonomie : string,
        balois : string,
        subRisks : SubRisk[]
    ){
        this.id = id;
        this.taxonomie = taxonomie;
        this.balois = balois;
        this.subRisks = subRisks;
    }
}