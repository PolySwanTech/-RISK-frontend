import { Component, ElementRef, HostListener, inject, Input, ViewChild } from '@angular/core';
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

  @ViewChild('drawerRef', { static: false }) drawerRef!: ElementRef;

  private elRef = inject(ElementRef);

  drawerOpened: boolean = false

  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  onDrawerClosed() {
    this.drawerOpened = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Si clic dans le bouton ou dans le drawer → ne rien faire
    const clickedInside = this.elRef.nativeElement.contains(target)
      || target.closest('.custom-drawer');

    // Si clic dans un overlay de dialog → ne rien faire
    const clickedInDialog = target.closest('.cdk-overlay-container');

    if (!clickedInside && !clickedInDialog && this.drawerOpened) {
      this.drawerOpened = false;
    }
  }
}
