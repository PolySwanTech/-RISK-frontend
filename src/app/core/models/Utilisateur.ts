import { PermissionName } from "../enum/permission.enum";
import { EntiteResponsable } from "./EntiteResponsable"
import { TeamMember } from "./TeamMember";


export enum Right {
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
    equipe: EntiteResponsable;
    right: Right;
    permissions: PermissionName[] = [];
    memberships?: TeamMember[] = [];

    constructor(
        id: string,
        username: string,
        email: string,
        password: string,
        equipe: EntiteResponsable,
        right: Right
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.equipe = equipe;
        this.right = right;
    }
}