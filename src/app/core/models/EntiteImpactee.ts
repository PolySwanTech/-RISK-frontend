export class EntiteImpactee {
    id : string
    name : string
    isLM : boolean // make cash
    children : EntiteImpactee[] = []
    childrenVisible = false
    parent : EntiteImpactee | null = null
    parentId : string | null = null

    constructor(
        id : string,
        name : string, 
        isLM : boolean,
        children : EntiteImpactee[] = [],
        parent : EntiteImpactee | null = null
    ){
        this.id = id;
        this.name = name;
        this.isLM = isLM;
        this.children = children;
        this.parent = parent;
    }
}