import { EntiteResponsable } from "./EntiteResponsable"
import { TeamMember } from "./TeamMember";


export enum Right {
    VIEWER = 'VIEWER',
    EDITOR = 'EDITOR',
    ADMIN = 'ADMIN',
    CENTRAL = 'CENTRAL'
}

export enum PermissionName {
    VIEW_INCIDENTS = 'VIEW_INCIDENTS',
    CREATE_INCIDENTS = 'CREATE_INCIDENTS',
    VIEW_DASHBOARD = 'VIEW_DASHBOARD',
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
    MANAGE_USERS = 'MANAGE_USERS',
}

type PermissionLabelsType = Record<PermissionName, string>;

export const permissionLabels: PermissionLabelsType = {
    [PermissionName.VIEW_INCIDENTS]: 'Voir les incidents',
    [PermissionName.CREATE_INCIDENTS]: 'Créer un incident',
    [PermissionName.VIEW_DASHBOARD]: 'Voir le tableau de bord',
    [PermissionName.MANAGE_SETTINGS]: 'Gérer les paramètres',
    [PermissionName.MANAGE_USERS]: 'Gérer les utilisateurs',
} as const;

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