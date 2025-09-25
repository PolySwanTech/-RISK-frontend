import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { PermissionNameType } from '../enum/permission.enum';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input() set appHasPermission(config: PermissionNameType | PermissionNameType[] | { teamId?: string, permissions: PermissionNameType | PermissionNameType[] }) {
  let teamId: string | undefined;
  let permissions: PermissionNameType[];

  // Cas 1 : simple string ou array
  if (typeof config === 'string' || Array.isArray(config)) {
    permissions = Array.isArray(config) ? config : [config];
  } 
  // Cas 2 : objet avec teamId + permissions
  else {
    teamId = config.teamId;
    permissions = Array.isArray(config.permissions) ? config.permissions : [config.permissions];
  }

  // Vérifie si TOUS les droits sont présents
  const hasAll = permissions.every(p => 
    teamId 
      ? this.authService.getPermissionsByTeam(teamId).includes(p) 
      : this.authService.hasPermission(p)
  );

  this.viewContainer.clear();
  if (hasAll) {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
}
}