import { EntiteResponsable } from "./EntiteResponsable"
import { RiskTemplate } from "./RiskTemplate"

export class Process {
    id: string = ''
    name: string
    bu: EntiteResponsable
    parentId?: string;
    enfants: Process[] = []
    risks: RiskTemplate[] = []

    constructor(
        name: string,
        bu: EntiteResponsable,
        parentId?: string) {
        this.name = name
        this.bu = bu
        this.parentId = parentId;
    }
}