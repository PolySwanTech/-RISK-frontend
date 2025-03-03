import { EntiteResponsable } from "./EntiteResponsable"

export interface ProcessusInterface {
    id: number
    name: string
    entiteResponsable: EntiteResponsable
    underProcess: ProcessusInterface[]
}

export class P1 implements ProcessusInterface {
    id: number
    name: string
    entiteResponsable: EntiteResponsable
    underProcess: ProcessusInterface[]

    constructor(
        id: number,
        name: string,
        entiteResponsable: EntiteResponsable,
        underProcess: ProcessusInterface[]
    ) {
        this.id = id
        this.name = name
        this.entiteResponsable = entiteResponsable
        this.underProcess = underProcess
    }
}

export class P2 implements ProcessusInterface {
    id: number
    name: string
    entiteResponsable: EntiteResponsable
    underProcess: ProcessusInterface[]

    constructor(
        id: number,
        name: string,
        entiteResponsable: EntiteResponsable,
        underProcess: ProcessusInterface[]
    ) {
        this.id = id
        this.name = name
        this.entiteResponsable = entiteResponsable
        this.underProcess = underProcess
    }

}

export class P3 implements ProcessusInterface {
    id: number
    name: string
    entiteResponsable: EntiteResponsable
    underProcess: ProcessusInterface[] = []

    constructor(
        id: number,
        name: string,
        entiteResponsable: EntiteResponsable,
    ) {
        this.id = id
        this.name = name
        this.entiteResponsable = entiteResponsable
    }
}