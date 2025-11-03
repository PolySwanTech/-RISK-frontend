import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuditService } from '../../../core/services/audit/audit.service';
import { BasePopupComponent, PopupAction } from '../../../shared/components/base-popup/base-popup.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    BasePopupComponent
  ],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent implements OnInit {
 
  comments: string = '';
  popupActions: PopupAction[] = [];

  private dialogRef = inject(MatDialogRef<AuditComponent>);
  public data = inject(MAT_DIALOG_DATA);
  private auditService = inject(AuditService);

  ngOnInit(): void {
    this.initActions();
  }

  initActions(): void {
    this.popupActions = [
      {
        label: 'Fermer',
        icon: 'close',
        color: 'red',
        onClick: () => this.closePopUp()
      },
      {
        label: 'OK',
        icon: 'check',
        primary: true,
        disabled: () => !this.comments || this.comments.trim() === '',
        onClick: () => this.confirm()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  closePopUp() {
    this.dialogRef.close(false);
  }

  confirm() {
    if (!this.comments || this.comments.trim() === '') {
      return;
    }

    this.auditService.trace(this.data.targetId, this.data.targetType, this.comments).subscribe({
      next: (_) => {
        this.dialogRef.close(this.comments);
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement de l\'audit:', err);
        // Optionnel: ajouter un snackbar d'erreur
      }
    });
  }
}