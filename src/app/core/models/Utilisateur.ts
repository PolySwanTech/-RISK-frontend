import { EntiteResponsable } from "./EntiteResponsable"

export class Utilisateur {
    id: number;
    name: string;
    firstname: string;
    mail: string;
    password: string;
    equipe: EntiteResponsable;

    constructor(
        id: number,
        name: string,
        firstname: string,
        mail: string,
        password: string,
        equipe: EntiteResponsable,
    ) {
        this.id = id;
        this.name = name;
        this.firstname = firstname;
        this.mail = mail;
        this.password = password;
        this.equipe = equipe;
    }
}