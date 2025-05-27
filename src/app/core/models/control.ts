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
    libelle: string;
    description: string;
    frequency: string;
    degree: string;
    riskId: string;
    

    constructor
    (
        id: string,
        libelle: string,
        description: string,
        frequency: string,
        degree: string,
        riskId: string
    ) {
        this.id = id;
        this.libelle = libelle;
        this.description = description;
        this.frequency = frequency;
        this.degree = degree;
        this.riskId = riskId;
    }

}