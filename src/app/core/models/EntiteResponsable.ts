export class EntiteResponsable {
    id : string
    name : string
    isLM : boolean // make cash
    children : EntiteResponsable[] = []
    childrenVisible = false
    parent : EntiteResponsable | null = null
    parentId : string | null = null

    constructor(
        id : string,
        name : string, 
        isLM : boolean,
        children : EntiteResponsable[] = [],
        parent : EntiteResponsable | null = null
    ){
        this.id = id;
        this.name = name;
        this.isLM = isLM;
        this.children = children;
        this.parent = parent;
    }
}