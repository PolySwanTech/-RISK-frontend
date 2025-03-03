export class EntiteResponsable {
    id : number
    name : string
    isLM : boolean // make cash

    constructor(
        id : number,
        name : string, 
        isLM : boolean
    ){
        this.id = id;
        this.name = name;
        this.isLM = isLM;
    }
}