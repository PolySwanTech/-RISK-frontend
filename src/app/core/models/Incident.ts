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

    title : string

    declaredAt: Date
    survenueAt: Date
    detectedAt: Date
    closedAt: Date | null

    impacts: Impact[]

    state : State = State.OPEN

    comments : string 

    constructor(
        id: string,
        title: string,
        declaredAt: Date,
        survenueAt: Date,
        detectedAt: Date,
        closedAt: Date | null,
        impacts: Impact[], 
        comments : string
    ) {
        this.id = id;
        this.title = title;
        this.declaredAt = declaredAt;
        this.survenueAt = survenueAt;
        this.detectedAt = detectedAt;
        this.closedAt = closedAt;
        this.impacts = impacts;
        this.comments = comments;

        if(this.closedAt){
            this.state = State.CLOSED
        }
    }

}