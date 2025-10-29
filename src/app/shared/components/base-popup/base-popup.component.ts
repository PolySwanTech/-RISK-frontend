import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PopupHeaderComponent } from "../popup-header/popup-header.component";

export interface PopupAction {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean | (() => boolean);
  primary?: boolean;
  color?: 'primary' | 'accent' | 'warn' | 'red';
}

@Component({
  selector: 'app-base-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    PopupHeaderComponent
],
  template: `
    <div class="base-popup-container">
      <app-popup-header 
        [title]="title" 
        [showClose]="showClose" 
        (close)="onClose()">
      </app-popup-header>

      <div class="dialog-content">
        <div class="content-wrapper">
          <ng-content></ng-content>
        </div>
      </div>

      <div class="dialog-footer" *ngIf="actions && actions.length > 0">
        <button 
  *ngFor="let action of actions"
  mat-raised-button 
  [class]="getButtonClass(action)"
  [disabled]="isActionDisabled(action)"
  (click)="action.onClick()">
  <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
  {{ action.label }}
</button>
      </div>
    </div>
  `,
  styleUrls: ['./base-popup.component.scss']
})
export class BasePopupComponent {
  @Input() title: string = '';
  @Input() showClose: boolean = true;
  @Input() actions: PopupAction[] = [];
  @Input() dialogRef?: MatDialogRef<any> | null = null;
  
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  isActionDisabled(action: PopupAction): boolean {
  if (typeof action.disabled === 'function') {
    return action.disabled();
  }
  return action.disabled || false;
}

  getButtonClass(action: PopupAction): string {
    if (action.color === 'red') {
      return 'btn-red';
    }
    if (action.primary || action.color === 'primary') {
      return 'btn-primary';
    }
    if (action.color === 'accent') {
      return 'btn-accent';
    }
    if (action.color === 'warn') {
      return 'btn-warn';
    }
    return '';
  }
}