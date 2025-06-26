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
    causeName?: string;
    riskType?: string;
    riskLevel?: number;
    state: State;
    comments: string;
    lossAmount?: number;
    categoryLevel?: string;
    categoryName?: string;
    subCategoryName?: string;
    categoryId?: string;
    consequenceId?: string;
    microProcessId?: string;
    equipeName?: string;

    customId: string = ""

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
        customId: string = ""
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
        this.customId = customId;
        this.state = closedAt ? State.CLOSED : state;
    }


}