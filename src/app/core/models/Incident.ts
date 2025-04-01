import { EntiteImpactee } from "./EntiteImpactee";
import { Impact } from "./Impact";
import { Process } from "./Process";
import { Risk } from "./Risk";
import { SubRisk } from "./SubRisk";
import { Cause } from "./Cause";

export enum State {
    NEW = "Nouveau",
    OPEN = "Ouvert",
    CLOSED = "Fermé",
    DRAFT = "Brouillon"
}

export class Incident {
    id: string;

    titre: string;
    location: string;

    declaredAt: Date;
    survenueAt: Date;
    detectedAt: Date;
    closedAt: Date | null;

    impacts: Impact[];

    risk: Risk;
    subRisk: SubRisk;
    process: Process;
    cause: Cause;

    state: string;

    comments: string;

    constructor(
        id: string,
        titre: string,
        location: string,
        declaredAt: Date,
        survenueAt: Date,
        detectedAt: Date,
        closedAt: Date | null,
        risk: Risk,
        subRisk: SubRisk,
        process: Process,
        cause: Cause,
        impacts: Impact[],
        comments: string,
        state : State
    ) {
        this.id = id;
        this.titre = titre;
        this.location = location;
        this.declaredAt = declaredAt;
        this.survenueAt = survenueAt;
        this.detectedAt = detectedAt;
        this.closedAt = closedAt;
        this.risk = risk;
        this.subRisk = subRisk;
        this.process = process;
        this.cause = cause;
        this.impacts = impacts;
        this.comments = comments;
        this.state = state        
    }

    
}