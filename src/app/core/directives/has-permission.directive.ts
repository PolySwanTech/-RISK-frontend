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

  @Input() set appHasPermission(permissions: PermissionNameType | PermissionNameType[]) {
    if (typeof permissions === 'string') {
      permissions = [permissions];
    }

    const hasAny = permissions.every(p => this.authService.hasPermission(p));
    this.viewContainer.clear();
    if (hasAny) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}