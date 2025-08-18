import { RiskLevel } from "../enum/riskLevel.enum";

export interface Cartography {
    id: string;
    name: string;
    reference: string;
    buId: string;
    buName: string;
    date: Date;
    evaluationAggregation: RiskLevel | null;
}

export interface CreateCarto {
    name: string;
    buId: string;
}
