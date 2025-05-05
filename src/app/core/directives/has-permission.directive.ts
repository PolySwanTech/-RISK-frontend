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

    const hasAny = permissions.some(p => this.authService.hasPermission(p, 'd30634c8-5db0-49d9-9540-403ebb42f836'));
    this.viewContainer.clear();
    if (hasAny) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}