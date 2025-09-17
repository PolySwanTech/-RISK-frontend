import { Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuditPanelComponent } from '../audit-panel/audit-panel.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TargetType } from '../../../../core/enum/targettype.enum';

@Component({
  selector: 'app-audit-button',
  imports: [MatIconModule, AuditPanelComponent, MatTooltipModule],
  templateUrl: './audit-button.component.html',
  styleUrl: './audit-button.component.scss'
})
export class AuditButtonComponent {

  @Input() contextId: string = ''
  @Input() contextTarget: TargetType | null = null

  drawerOpened: boolean = false

  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  onDrawerClosed() {
    this.drawerOpened = false;
  }
}
