import { Component, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuditPanelComponent } from '../audit-panel/audit-panel.component';

@Component({
  selector: 'app-audit-button',
  imports: [MatIconModule, AuditPanelComponent],
  templateUrl: './audit-button.component.html',
  styleUrl: './audit-button.component.scss'
})
export class AuditButtonComponent {

  @Input() contextId: string = ''
  @Input() contextTarget: string = ''

  drawerOpened: boolean = false

  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  onDrawerClosed() {
    this.drawerOpened = false;
  }
}
