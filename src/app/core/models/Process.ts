import { EntiteResponsable } from "./EntiteResponsable"
import { RiskTemplate } from "./RiskTemplate"

export class Process {
    
    id: string = ''
    name: string
    bu: EntiteResponsable
    parentId?: string;
    enfants: Process[] = []
    risks: RiskTemplate[] = []

    buName : string = ''
    sum = 0;

    constructor(
        name: string,
        bu: EntiteResponsable,
        parentId?: string) {
        this.name = name
        this.bu = bu
        this.parentId = parentId;
    }
}