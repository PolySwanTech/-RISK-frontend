export class Impact{
    id : string;
    montant : number;
    processName : string; 
    entityName : string;
    type : string;
    createdAt : Date;
    comptabilisationDate : Date | null;

    entityId : string = ''
    incidentId : string = ''
    message: string = '';

    constructor(
        id : string,
        montant : number,
        processName : string,
        entityName : string,
        type : string,
        createdAt : Date,
        comptabilisationDate : Date | null
    ){
        this.id = id
        this.montant = montant
        this.processName = processName
        this.entityName = entityName
        this.type = type
        this.createdAt = createdAt
        this.comptabilisationDate = comptabilisationDate
    }
}

// -------------  DTO -------------
export interface ImpactCreateDto {
  montant:        number;
  comptabilisationDate: Date | null;
  entityId: string;
  incidentId:   string; 
  type:    string;
  message:  string;    
}