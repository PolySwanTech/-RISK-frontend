import { Process } from "./Process"

export class EntiteResponsable {
    id : string
    name : string
    lm : boolean // make cash
    children : EntiteResponsable[] = []
    childrenVisible = false
    parent : EntiteResponsable | null = null
    parentId : string | null = null
    process: Process[] = []

    constructor(
        id : string,
        name : string, 
        lm : boolean,
        children : EntiteResponsable[] = [],
        parent : EntiteResponsable | null = null,
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