import { EntiteResponsable } from "./EntiteResponsable";

export class Impact{
    id : number;
    montant : number;
    type : string;
    date : Date;
    entiteResponsable : EntiteResponsable

    constructor(
        id : number,
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