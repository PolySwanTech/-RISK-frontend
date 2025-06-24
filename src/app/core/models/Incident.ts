import { State } from "../enum/state.enum";
import { Impact } from "./Impact";
import { Process } from "./Process";
import { RiskTemplate } from "./RiskTemplate";

export class Incident {
    id: string;

    titre: string;
    location: string;

    declaredAt: Date;
    survenueAt: Date;
    detectedAt: Date;
    closedAt: Date | null;

    impacts: Impact[];

    risk: RiskTemplate;
    process: Process;

    state: State;
    comments: string;
    equipeName?: string;

    reference : string = ""

    constructor(
        id: string,
        titre: string,
        location: string,
        declaredAt: Date,
        survenueAt: Date,
        detectedAt: Date,
        closedAt: Date | null,
        risk: RiskTemplate,
        process: Process,
        impacts: Impact[],
        comments: string,
        state: State = State.DRAFT,
        equipeName?: string,
        reference : string = "" 
    ) {
        this.id = id;
        this.titre = titre;
        this.location = location;
        this.declaredAt = declaredAt;
        this.survenueAt = survenueAt;
        this.detectedAt = detectedAt;
        this.closedAt = closedAt;
        this.risk = risk;
        this.process = process;
        this.impacts = impacts;
        this.comments = comments;
        this.equipeName = equipeName;
        this.reference = reference;
        this.state = closedAt ? State.CLOSED : state;        
    }

    
}