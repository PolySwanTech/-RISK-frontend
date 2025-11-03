import { PermissionName } from "../enum/permission.enum";
import { BusinessUnit } from "./BusinessUnit"

export class Utilisateur {
    id: string;
    username: string;
    email: string;
    password: string;
    equipe: BusinessUnit;
    permissions: PermissionName[] = [];

    constructor(
        id: string,
        username: string,
        email: string,
        password: string,
        equipe: BusinessUnit,
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.equipe = equipe;
    }
}