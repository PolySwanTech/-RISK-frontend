import { State } from "../enum/state.enum";
import { Cause } from "./Cause";
import { OperatingLoss } from "./OperatingLoss";
import { BaloiseCategoryDto } from "./RiskReferentiel";


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
    categoryBaloise : BaloiseCategoryDto;
    cause : Cause;
    process: string ;
    processName?: string ;
    teamId?: string;
    teamName?: string;

    impacts: OperatingLoss[];

    state: State;
    consequences: string[];
    intervenantId?: string | null;
    intervenantName?: string | null;
    creatorId?: string | null;
    creatorName?: string | null;



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
        categoryBaloise: BaloiseCategoryDto,
        cause: Cause,
        process: string,
        teamId?: string,
        impacts: OperatingLoss[] = [],
        state: State = State.DRAFT,
        consequences: string[] = [],
        intervenantId?: string | null,
        intervenantName?: string,
        creatorId?: string | null,
        creatorName?: string,
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
        this.categoryBaloise = categoryBaloise;
        this.cause = cause;
        this.process = process;
        this.teamId = teamId;
        this.impacts = impacts;
        this.state = state;
        this.consequences = consequences;
        this.intervenantId = intervenantId || null;
        this.intervenantName = intervenantName || null;
        this.creatorId = creatorId || null;
        this.creatorName = creatorName || null;
    }


}
