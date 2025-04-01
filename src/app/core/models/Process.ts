import { EntiteResponsable } from "./EntiteResponsable"

export class Process {
    id: number
    name: string
    entiteResponsable: EntiteResponsable

    constructor(
        id: number,
        name: string,
        entiteResponsable: EntiteResponsable) {
        this.id = id
        this.name = name
        this.entiteResponsable = entiteResponsable
    }
}