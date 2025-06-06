import { EntiteResponsable } from "./EntiteResponsable";
import { RiskLevel } from "../enum/riskLevel.enum";
import { RiskImpactType } from "../enum/riskImpactType.enum";
import { SubRisk } from "./SubRisk";

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
    taxonomie: string
    balois: string

    description: string = ""
    actionPlan: string = ""
    level: string = ""
    entiteResponsable: EntiteResponsable[] = []
    processId: string = ""
    subRisks: SubRisk[]
    probability: number | null = null
    impactType: RiskImpactType | null = null

    constructor(
        id: string,
        taxonomie: string,
        balois: string,
        subRisks: SubRisk[]
    ) {
        this.id = id;
        this.taxonomie = taxonomie;
        this.balois = balois;
        this.subRisks = subRisks;
    }
    
}