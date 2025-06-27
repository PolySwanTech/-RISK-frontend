import { State } from "../enum/state.enum";
import { Cause } from "./Cause";
import { Impact } from "./Impact";
import { Process } from "./Process";
import { RiskTemplate } from "./RiskTemplate";

export class Incident {
    id: string;
    reference: string = ""

    title: string;
    location: string;
    commentaire : string

    declaredAt: Date;
    survenueAt: Date ;
    detectedAt: Date ;
    closedAt: Date | null ;

    risk: string;
    cause : Cause;
    process: Process ;
    equipeId?: string;

    impacts: Impact[];

    state: State;
    consequenceId?: string;

    constructor(
        id: string,
        title: string,
        location: string,
        commentaire: string,
        declaredAt: Date,
        survenueAt: Date,
        detectedAt: Date,
        closedAt: Date | null,
        risk: string,
        cause: Cause,
        process: Process,
        equipeId?: string,
        impacts: Impact[] = [],
        state: State = State.DRAFT,
        consequenceId?: string
    ){
        this.id = id;
        this.title = title;
        this.location = location;
        this.commentaire = commentaire;
        this.declaredAt = declaredAt;
        this.survenueAt = survenueAt;
        this.detectedAt = detectedAt;
        this.closedAt = closedAt;
        this.risk = risk;
        this.cause = cause;
        this.process = process;
        this.equipeId = equipeId;
        this.impacts = impacts;
        this.state = state;
        this.consequenceId = consequenceId;
    }


}