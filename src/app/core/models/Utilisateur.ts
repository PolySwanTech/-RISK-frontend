import { PermissionName } from "../enum/permission.enum";
import { BusinessUnit } from "./BusinessUnit"

export interface Utilisateur {
    id: string;
    username: string;
    email: string;
    password: string;
    equipe: BusinessUnit;
    permissions: PermissionName[];
    createdAt?: Date;
    updatedAt?: Date;
    active?: boolean;
}

export type UtilisateurProfil = Required<Pick<Utilisateur, 'id' | 'username' | 'email'>> & 
{
  equipeName?: string;
  role?: string;
};

export type UtilisateurUpdate = Partial<Pick<Utilisateur, 'username' | 'email'>>;

export type UtilisateurCreate = Partial<Pick<Utilisateur, 'username' | 'id'>> &
{
  teamRoleList: any[];
};