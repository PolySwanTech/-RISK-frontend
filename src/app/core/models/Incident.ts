import { State } from "../enum/state.enum";
import { Cause } from "./Cause";
import { OperatingLoss } from "./OperatingLoss";


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
    riskName : string = "";
    cause : Cause;
    process: string ;
    teamId?: string;
    teamName?: string;

    impacts: OperatingLoss[];

    state: State;
    consequences: string[];
    intervenant?: string | null;

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
        process: string,
        teamId?: string,
        impacts: OperatingLoss[] = [],
        state: State = State.DRAFT,
        consequences: string[] = [],
        intervenant?: string | null,
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
        this.teamId = teamId;
        this.impacts = impacts;
        this.state = state;
        this.consequences = consequences;
        this.intervenant = intervenant || null;
    }


}
