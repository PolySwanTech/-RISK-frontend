import { BusinessUnit } from "./BusinessUnit"
import { RiskTemplate } from "./RiskTemplate";

export class Process {
    
    id: string = ''
    name: string
    bu: BusinessUnit
    parentId?: string;
    enfants: Process[] = []
    risks: RiskTemplate[] = []

    buName : string = '';
    buId : string = '';
    niveau?: number;
    sum = 0;

    expanded : boolean = false

    constructor(
        name: string,
        bu: BusinessUnit,
        parentId?: string) {
        this.name = name
        this.bu = bu
        this.parentId = parentId;
    }
}