import { EntiteResponsable } from "./EntiteResponsable"
import { Impact } from "./Impact"
import { ProcessusInterface } from "./ProcessusInterface"
import { Risk } from "./Risk"

export enum State {
    OPEN = "Ouvert",
    CLOSED = "Fermé"
}

export class Incident {
    id: string

    dateDeclaration: Date
    dateSurvenance: Date
    dateDetection: Date
    dateCloture: Date

    riskPrincipal: Risk
    processusImpact: ProcessusInterface[]
    entiteImpacte: EntiteResponsable[]

    impacts: Impact[]

    state : State = State.OPEN

    constructor(
        id: string,
        dateDeclaration: Date,
        dateSurvenance: Date,
        dateDetection: Date,
        dateCloture: Date,
        riskPrincipal: Risk,
        processusImpact: ProcessusInterface[],
        entiteImpacte: EntiteResponsable[],
        impacts: Impact[]
    ) {
        this.id = id;
        this.dateDeclaration = dateDeclaration;
        this.dateSurvenance = dateSurvenance;
        this.dateDetection = dateDetection;
        this.dateCloture = dateCloture;
        this.riskPrincipal = riskPrincipal;
        this.processusImpact = processusImpact;
        this.entiteImpacte = entiteImpacte;
        this.impacts = impacts;
    }

}