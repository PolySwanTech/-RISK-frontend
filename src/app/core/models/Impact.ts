import { EntiteResponsable } from "./EntiteResponsable";
import { State } from "./Incident";

export class Impact{
    id : string;
    montant : number;
    type : string;
    date : Date;
    entiteResponsable : EntiteResponsable

    state : State = State.OPEN

    constructor(
        id : string,
        montant : number,
        type : string,
        date : Date,
        entiteResponsable : EntiteResponsable
    ){
        this.id = id
        this.montant = montant
        this.type = type
        this.date = date
        this.entiteResponsable = entiteResponsable
    }
}