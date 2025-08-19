import { BusinessUnit } from "./BusinessUnit"
import { RiskTemplate } from "./RiskTemplate"

export class Process {
    
    id: string = ''
    name: string
    bu: BusinessUnit
    parentId?: string;
    enfants: Process[] = []
    risks: RiskTemplate[] = []

    buName : string = ''
    sum = 0;

    constructor(
        name: string,
        bu: BusinessUnit,
        parentId?: string) {
        this.name = name
        this.bu = bu
        this.parentId = parentId;
    }
}

export interface ProcessNode {
  id: string;
  name: string;
  niveau: number;
  type: 'bu' | 'parent' | 'child';
  buName?: string;
  parentName?: string;
  risks?: any[]; 
  children?: ProcessNode[];
}