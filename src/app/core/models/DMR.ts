import { RiskLevel } from "../enum/riskLevel.enum";

export interface DMR {
  id: string;
  cartoName: string | null;
  cartoReference: string | null;
  controlNames: string[];
  controlReferences: string[];
  date: string; // format ISO
  processName: string;
  riskBrut: RiskLevel | null;
  riskName: string;
  riskNet: RiskLevel | null;
}