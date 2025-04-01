import { EntiteImpactee } from "./EntiteImpactee"

export class Process {
    id: number
    name: string
    entiteImpactee: EntiteImpactee

    constructor(
        id: number,
        name: string,
        entiteImpactee: EntiteImpactee) {
        this.id = id
        this.name = name
        this.entiteImpactee = entiteImpactee
    }
}