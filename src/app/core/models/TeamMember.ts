import { PermissionName } from "../enum/permission.enum";

export interface Role {
  name: string;
  permissions: PermissionName[];
}

export interface TeamMember {
  role: Role; // TODO remplacer role par rolename
  buId: string;
}  