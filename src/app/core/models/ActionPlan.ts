import { EntiteResponsable } from "./EntiteResponsable";
import { Impact } from "./Impact";
import { Priority } from "./Priority";
import { Process } from "./Process";
import { Risk } from "./Risk";
import { Statut } from "./Statut";

export class ActionPlan {
    id : string;
    name : string;
    libelle : string;
    description : string;
    riskId : string;
    impact : Impact;

    responsable : string;
    userInCharge : string;
    echeance : Date;
    status : Statut;
    priority : Priority;

    creator = "f3c2a595-5d8f-4a5f-8c50-bad30930ab9c"

    constructor(
        id: string,
        name: string,
        libelle: string,
        description: string,
        riskId: string,
        impact: Impact,
        responsable: string,
        userInCharge: string,
        echeance: Date,
        status: Statut,
        priority: Priority,
        process: Process
    ) {
        this.id = id;
        this.name = name;
        this.libelle = libelle;
        this.description = description;
        this.riskId = riskId;
        this.impact = impact;
        this.responsable = responsable;
        this.userInCharge = userInCharge;
        this.echeance = echeance;
        this.status = status;
        this.priority = priority;
    }
    
}