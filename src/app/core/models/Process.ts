import { EntiteResponsable } from "./EntiteResponsable"
import { RiskTemplate } from "./RiskTemplate"

export class Process {
    id: string = ''
    name: string
    bu: EntiteResponsable
    niveau: number
    parentId?: string;
    risks: RiskTemplate[] = []

    constructor(
        name: string,
        bu: EntiteResponsable, niveau: number, parentId?: string) {
        this.name = name
        this.bu = bu
        this.niveau = niveau
        this.parentId = parentId;
    }
}