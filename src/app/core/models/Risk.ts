import { EntiteResponsable } from "./EntiteResponsable";
import { RiskLevel } from "../enum/riskLevel.enum";
import { RiskImpactType } from "../enum/riskImpactType.enum";

export const RiskLevelLabels: Record<RiskLevel, string> = {
    [RiskLevel.LOW]: "Low",
    [RiskLevel.MEDIUM]: "Medium",
    [RiskLevel.HIGH]: "High",
    [RiskLevel.VERY_HIGH]: "Very High"
};

export const RiskImpactTypeLabels: Record<RiskImpactType, string> = {
    [RiskImpactType.FINANCIER]: "Financier",
    [RiskImpactType.REPUTATIONEL]: "Réputationel"
};
export class Risk {
    id: string
    name: string = ""
    taxonomie: string = ""
    balois: string = ""

    description: string = ""
    actionPlan: string = ""
    level: string = ""
    entiteResponsable: EntiteResponsable[] = []
    processId: string = ""
    probability: number | null = null
    impactType: RiskImpactType | null = null

    constructor(
        id: string,
        name : string, 
        description : string,
        level : string, 
        processId : string, 
    ) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.description= description;
        this.processId = processId;
    }
    
}