import { EntiteResponsable } from "./EntiteResponsable"
import { RiskTemplate } from "./RiskTemplate"

export class Process {
    id: string = ''
    name: string
    bu: EntiteResponsable
    risks : RiskTemplate[] = []

    constructor(
        name: string,
        bu: EntiteResponsable) {
        this.name = name
        this.bu = bu
    }
}