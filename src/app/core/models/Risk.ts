import { EntiteResponsable } from "./EntiteResponsable";

export class Risk{
    id : string
    title : string 
    description : string 
    level : string 
    processId : string    

    constructor(
        id : string, 
        title : string, 
        description : string,
        level : string, 
        processId : string, 
    ){
        this.id = id;
        this.title = title;
        this.level = level;
        this.description= description;
        this.processId = processId;
    }
}