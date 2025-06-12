import { EntiteResponsable } from "./EntiteResponsable"
import { Risk } from "./RiskTemplate"

export class Process {
    id: string = ''
    name: string
    bu: EntiteResponsable
    risks : Risk[] = []

    constructor(
        name: string,
        bu: EntiteResponsable) {
        this.name = name
        this.bu = bu
    }
}