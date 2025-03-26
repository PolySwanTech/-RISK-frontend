export class SubRisk{
    id : number
    taxonomie : string
    balois : string
    
    constructor(
        id : number,
        taxonomie : string,
        balois : string
    ){
        this.id = id;
        this.taxonomie = taxonomie;
        this.balois = balois;
    }
}