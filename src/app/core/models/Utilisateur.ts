import { EntiteImpactee } from "./EntiteImpactee"

export enum Right{
    VIEWER = 'VIEWER',
    EDITOR = 'EDITOR',
    ADMIN = 'ADMIN',
    CENTRAL = 'CENTRAL'
}

export class Utilisateur {
    id: string;
    username: string;
    email: string;
    password: string;
    equipe: EntiteImpactee;
    right : Right

    constructor(
        id: string,
        username: string,
        email: string,
        password: string,
        equipe: EntiteImpactee,
        right : Right
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.equipe = equipe;
        this.right = right;
    }
}