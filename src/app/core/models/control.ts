export enum Recurence {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    SEMESTERLY = 'SEMESTERLY',
    YEARLY = 'YEARLY'
}

export enum Degree {
    LEVEL_1 = 'LEVEL_1',
    LEVEL_2 = 'LEVEL_2',
}

export enum Type {
    PREVENTIVE = 'PREVENTIVE',
    DETECTIVE = 'DETECTIVE', 
    CORRECTIVE = 'CORRECTIVE', 
    AUTOMATIC = 'AUTOMATIC', 
    MANUAL = 'MANUAL'
}


export class Control{

    id : string;
    reference: string;
    libelle: string;
    description: string;
    frequency: Recurence;
    degree: Degree;
    type: Type;
    riskId: string;
    
    buName : string = "";

    constructor
    (
        id: string,
        reference: string,
        libelle: string,
        description: string,
        frequency: Recurence,
        degree: Degree,
        type: Type,
        riskId: string
    ) {
        this.id = id;
        this.reference = reference;
        this.libelle = libelle;
        this.description = description;
        this.frequency = frequency;
        this.degree = degree;
        this.type = type;
        this.riskId = riskId;
    }

}