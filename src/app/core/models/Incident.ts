import { EntiteResponsable } from "./EntiteResponsable"
import { Impact } from "./Impact"
import { ProcessusInterface } from "./ProcessusInterface"
import { Risk } from "./Risk"

export class Incident {
    id: number

    dateDeclaration: Date
    dateSurvenance: Date
    dateDetection: Date
    dateCloture: Date

    riskPrincipal: Risk
    processusImpact: ProcessusInterface[]
    entiteImpacte: EntiteResponsable[]

    impacts: Impact[]

    constructor(
        id: number,
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