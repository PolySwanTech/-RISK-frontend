import { EvaluationFrequency } from "../enum/evaluation-frequency.enum"
import { Process } from "./Process"

export class BusinessUnit {
    id : string
    name : string
    lm : boolean // make cash
    parentId : string | null = null
    parentName : string | null = null
    process: Process[] = []
    niveau?: number
    children: BusinessUnit[] = []
    evaluationFrequency!: EvaluationFrequency
    expanded: boolean = false


    constructor(
        id : string,
        name : string, 
        lm : boolean,
        children : BusinessUnit[] = [],
        process: Process[] = []
    ){
        this.id = id;
        this.name = name;
        this.lm = lm;
        this.children = children;
        this.process = process;
    }
}