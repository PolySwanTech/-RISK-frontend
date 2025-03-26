export class Impact{
    id : string;
    montant : number;
    processName : string; 
    entityName : string;
    type : string;
    createdAt : Date;

    entityId : string = ''
    incidentId : string = ''

    constructor(
        id : string,
        montant : number,
        processName : string,
        entityName : string,
        type : string,
        createdAt : Date,
    ){
        this.id = id
        this.montant = montant
        this.processName = processName
        this.entityName = entityName
        this.type = type
        this.createdAt = createdAt
    }
}