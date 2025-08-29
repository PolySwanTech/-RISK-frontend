import { RiskLevel } from "../enum/riskLevel.enum"

export interface RPC {
    id : string; 
    riskReference : string; 
    riskName : string; 
    processName : string; 
    controlReference : string; 
    controlName : string; 
    date : Date; 
    brutLevel : RiskLevel;
    netLevel : RiskLevel;
    probability : number;
    performedBy : string;
}