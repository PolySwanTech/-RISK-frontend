import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BasePopupComponent, PopupAction } from '../../shared/components/base-popup/base-popup.component';
import { EnumLabelPipe } from '../../shared/pipes/enum-label.pipe';
import { ControlService } from '../../core/services/dmr/control/control.service';
import { FileService } from '../../core/services/file/file.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { ReviewStatus } from '../../core/enum/reviewStatus.enum';
import { Status } from '../../core/enum/status.enum';
import { PopupEvaluationControleComponent } from '../../pages/control-details-page/popup-evaluation-controle/popup-evaluation-controle/popup-evaluation-controle.component';
import { firstValueFrom } from 'rxjs';
import { TargetType } from '../../core/enum/targettype.enum';
import { EvaluationControl } from '../../core/enum/evaluation-controle.enum';

export interface ExecutionDetailDialogData {
  id: string;
  status?: Status;
  plannedAt?: Date;
  performedBy?: string;
}

@Component({
  selector: 'app-execution-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    BasePopupComponent,
    EnumLabelPipe
  ],
  templateUrl: './execution-detail-dialog.component.html',
  styleUrl: './execution-detail-dialog.component.scss'
})
export class ExecutionDetailDialogComponent implements OnInit {

  private controlService = inject(ControlService);
  private fileService = inject(FileService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  dialogRef = inject(MatDialogRef<ExecutionDetailDialogComponent>);

  popupActions: PopupAction[] = [];
  s: any = { exec: null, view: null };

  constructor(@Inject(MAT_DIALOG_DATA) public data: ExecutionDetailDialogData) { }

  ngOnInit(): void {
    this.getExecution();
  }

  getExecution(): void {
    this.controlService.getEvaluationByExecution(this.data.id).subscribe({
      next: (data) => {
        this.s.exec = this.data;
        this.s.view = data;
        this.initActions();
      },
      error: () => {
        this.s.exec = this.data;
        this.s.view = null;
        this.initActions();
      }
    });
  }

  initActions(): void {
    const actions: PopupAction[] = [];

    actions.push({
      label: 'Fermer',
      icon: 'close',
      color: 'red',
      onClick: () => this.closePopup()
    });

    // Bouton Évaluer/Réévaluer
    if (!this.s.view || this.s.view?.reviewStatus === ReviewStatus.REEXAM_REQUESTED) {
      actions.push({
        label: this.s.view?.reviewStatus === ReviewStatus.REEXAM_REQUESTED ? 'Réévaluer' : 'Évaluer',
        icon: 'rate_review',
        primary: true,
        onClick: () => this.evaluateExec(this.data.id, 'eval')
      });
    }

    // Boutons de validation (si en attente et peut valider et même créateur)
    if (this.s.view?.reviewStatus === ReviewStatus.PENDING && this.canValidate() && this.sameCreator()) {
      actions.push({
        label: 'Demander un réexamen',
        icon: 'assignment_return',
        color: 'purple',
        onClick: () => this.openEvaluationDetailsPopup(this.data.id, 'reexam')
      });
      actions.push({
        label: 'Valider',
        icon: 'check_circle',
        primary: true,
        onClick: () => this.openEvaluationDetailsPopup(this.data.id, 'valid')
      });

    }

    // Bouton Fermer


    this.popupActions = actions;
  }

  getDialogRef() {
    return this.dialogRef;
  }

  closePopup() {
    this.dialogRef.close();
  }

  evaluateExec(executionId: string, action: string): void {
    this.dialog.open(PopupEvaluationControleComponent, {
      minWidth: '700px',
      data: {
        action: action,
        executionId: executionId,
        mode: 'FORM',
        canValidate: true
      }
    }).afterClosed().subscribe(() => {
      // Recharger les données après évaluation
      this.getExecution();
    });
  }

  openEvaluationDetailsPopup(executionId: string, action: string): void {
    this.dialog.open(PopupEvaluationControleComponent, {
      minWidth: '700px',
      data: {
        action: action,
        executionId: executionId,
        mode: action === 'eval' ? 'FORM' : 'DETAILS',
        canValidate: true
      }
    }).afterClosed().subscribe(() => {
      // Recharger les données après validation/réexamen
      this.getExecution();
    });
  }

  canValidate(): boolean {
    // Implémenter votre logique de permission
    return true;
  }

  sameCreator(): boolean {
    return this.authService.sameUserName(this.s.view?.performedBy || '');
  }

  async viewFiles(): Promise<void> {
    const target = TargetType.CONTROL;
    const files = await firstValueFrom(this.fileService.getFiles(target, this.data.id));
    this.fileService.openFiles(files, target, this.data.id).afterClosed().subscribe();
  }

  getStatusClass(status?: Status): string {
    if (!status) return 'type';
    switch (status) {
      case Status.ACHIEVED:
        return 'achieved';       // vert
      case Status.IN_PROGRESS:
        return 'en_cours';       // bleu
      case Status.CANCELLED:
        return 'annulé';         // rouge
      default:
        return 'type';           // gris/violet léger
    }
  }

  getEvalClass(evaluation: EvaluationControl): string {
    switch (evaluation) {
      case EvaluationControl.CONFORME:
        return 'conforme';          // vert
      case EvaluationControl.NON_CONFORME:
        return 'non_conforme';      // rouge
      case EvaluationControl.PARTIELLEMENT_CONFORME:
        return 'partiel';           // jaune
      default:
        return 'type';              // neutre
    }
  }

  getReviewBadgeClass(reviewStatus: ReviewStatus): string {
    switch (reviewStatus) {
      case ReviewStatus.APPROVED:
        return 'validé';            // vert
      case ReviewStatus.PENDING:
        return 'pending';           // violet
      case ReviewStatus.REEXAM_REQUESTED:
      case ReviewStatus.REJECTED:
        return 'fort';              // rouge
      default:
        return 'type';
    }
  }

  computeMetaStripe(s: any): string {
    if (s?.view?.reexamen === true || s?.view?.needsReexamination === true || s?.view?.status === 'REEXAMINATION') {
      return 'meta-reexam';
    }

    if (s?.exec?.status === Status.IN_PROGRESS) {
      return 'meta-progress';
    }

    if (s?.view && !s?.view?.reviewedAt) {
      return 'meta-pending';
    }

    if (s?.exec?.status === Status.ACHIEVED || s?.exec?.status === Status.CANCELLED) {
      return 'meta-approved';
    }

    return 'meta-default';
  }
}