import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidebarService } from '../../../core/services/sidebar/sidebar.service';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';
import { PermissionNameType } from '../../../core/enum/permission.enum';

@Component({
  selector: 'app-go-back',
  imports: [HasPermissionDirective, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() buttons: GoBackButton[] = [];

  @Input() onBack?: () => void;

  goBack() {
    if (this.onBack) this.onBack();
    else history.back(); // fallback
  }
  isStickyClosed = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.sidebarService.isClosed$.subscribe(state => {
      this.isStickyClosed = state;
    });
}
}

export interface GoBackButton {
  label: string;
  icon?: string;
  class?: string;
  show?: boolean; // condition d’affichage
  permission?: PermissionNameType | PermissionNameType[];
  action: () => void;
}