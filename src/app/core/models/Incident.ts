import { EntiteResponsable } from "./EntiteResponsable"
import { Impact } from "./Impact"
import { Process } from "./Process"
import { Risk } from "./Risk"

export enum State {
    OPEN = "Ouvert",
    CLOSED = "Fermé"
}

export class Incident {
    id: string

    declaredAt: Date
    survenueAt: Date
    detectedAt: Date
    closedAt: Date | null

    // riskPrincipal: Risk
    processName: string
    entiteResponsable: string

    impacts: Impact[]

    state : State = State.OPEN

    constructor(
        id: string,
        declaredAt: Date,
        survenueAt: Date,
        detectedAt: Date,
        closedAt: Date | null,
        // riskPrincipal: Risk,
        processName: string,
        entiteResponsable: string,
        impacts: Impact[]
    ) {
        this.id = id;
        this.declaredAt = declaredAt;
        this.survenueAt = survenueAt;
        this.detectedAt = detectedAt;
        this.closedAt = closedAt;
        // this.riskPrincipal = riskPrincipal;
        this.processName = processName;
        this.entiteResponsable = entiteResponsable;
        this.impacts = impacts;

        if(this.closedAt){
            this.state = State.CLOSED
        }
    }

}