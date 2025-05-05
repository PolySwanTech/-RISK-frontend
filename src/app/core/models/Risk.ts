import { EntiteResponsable } from "./EntiteResponsable";

export class Risk{
    id : string = ''
    title : string = ""

    description : string = ""
    actionPlan : string = ""
    level : string = ""
    entiteResponsable : EntiteResponsable[] = []
    
    constructor(
        title : string, 
        description : string,
    ){
        this.title = title;
        this.description= description;
    }
}