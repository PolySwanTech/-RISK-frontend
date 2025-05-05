import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

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

  @Input() set appHasPermission(permissions: string | string[]) {
    if (typeof permissions === 'string') {
      permissions = [permissions];
    }

    const hasAny = permissions.some(p => this.authService.hasPermission(p));
    this.viewContainer.clear();
    if (hasAny) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}