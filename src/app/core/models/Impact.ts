import { EntiteResponsable } from "./EntiteResponsable";
import { State } from "./Incident";

export class Impact{
    id : string;
    montant : number;
    type : string;
    date : Date;

    constructor(
        id : string,
        montant : number,
        type : string,
        date : Date,
    ){
        this.id = id
        this.montant = montant
        this.type = type
        this.date = date
    }
}