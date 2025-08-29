import { Process } from "./Process"

export class BusinessUnit {
    id : string
    name : string
    lm : boolean // make cash
    children : BusinessUnit[] = []
    childrenVisible = false
    parent : BusinessUnit | null = null
    parentId : string | null = null
    process: Process[] = []
    niveau?: number

    constructor(
        id : string,
        name : string, 
        lm : boolean,
        children : BusinessUnit[] = [],
        parent : BusinessUnit | null = null,
        process: Process[] = []
    ){
        this.id = id;
        this.name = name;
        this.lm = lm;
        this.children = children;
        this.parent = parent;
        this.process = process;
    }
}