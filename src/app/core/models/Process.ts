import { EntiteResponsable } from "./EntiteResponsable"
import { Risk } from "./Risk"

export class Process {
    id: string = ''
    name: string
    buId: string

    risks : Risk[] = []

    constructor(
        name: string,
        bu_id: string) {
        this.name = name
        this.buId = bu_id
    }
}