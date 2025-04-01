import { EntiteResponsable } from "./EntiteResponsable";
import { Process } from "./Process";
import { SubRisk } from "./SubRisk";

export class Risk{
    id : string
    titre : string = ""
    taxonomie : string
    balois : string
    description : string = ""
    actionPlan : string = ""
    level : string = ""
    entiteResponsable : EntiteResponsable[] = []
    processes : Process[] = []
    subRisks : SubRisk[]
    
    constructor(
        id : string,
        taxonomie : string,
        balois : string,
        subRisks : SubRisk[]
    ){
        this.id = id;
        this.taxonomie = taxonomie;
        this.balois = balois;
        this.subRisks = subRisks;
    }
}