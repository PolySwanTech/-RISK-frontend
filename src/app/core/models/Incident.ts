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

    titre : string

    declaredAt: Date
    survenueAt: Date
    detectedAt: Date
    closedAt: Date | null

    impacts: Impact[]

    state : State = State.OPEN

    constructor(
        id: string,
        titre: string,
        declaredAt: Date,
        survenueAt: Date,
        detectedAt: Date,
        closedAt: Date | null,
        impacts: Impact[]
    ) {
        this.id = id;
        this.titre = titre;
        this.declaredAt = declaredAt;
        this.survenueAt = survenueAt;
        this.detectedAt = detectedAt;
        this.closedAt = closedAt;
        this.impacts = impacts;

        if(this.closedAt){
            this.state = State.CLOSED
        }
    }

}