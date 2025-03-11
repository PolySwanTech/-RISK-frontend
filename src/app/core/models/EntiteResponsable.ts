export class EntiteResponsable {
    id : string
    name : string
    isLM : boolean // make cash
    children : EntiteResponsable[] = []
    childrenVisible = false

    constructor(
        id : string,
        name : string, 
        isLM : boolean,
        children : EntiteResponsable[] = []
    ){
        this.id = id;
        this.name = name;
        this.isLM = isLM;
        this.children = children;
    }
}