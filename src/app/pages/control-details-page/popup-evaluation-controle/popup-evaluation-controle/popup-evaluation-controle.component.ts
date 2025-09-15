import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlEvaluation, ControlEvaluationView } from '../../../../core/models/ControlEvaluation';
import { Evaluation } from '../../../../core/enum/evaluation.enum';
import { ControlService } from '../../../../core/services/control/control.service';
import { EvaluationControl, EvaluationControlLabels } from '../../../../core/enum/evaluation-controle.enum';
import { ControlExecution } from '../../../../core/models/ControlExecution';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';
import { MatIcon } from '@angular/material/icon';
import { FichiersComponent } from '../../../../shared/components/fichiers/fichiers.component';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { TargetType } from '../../../../core/enum/targettype.enum';
import { FileService } from '../../../../core/services/file/file.service';
import { ActivatedRoute } from '@angular/router';

type PopupMode = 'FORM' | 'BLOCKERS' | 'DETAILS';

@Component({
  selector: 'app-popup-evaluation-controle',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
  templateUrl: './popup-evaluation-controle.component.html',
  styleUrls: ['./popup-evaluation-controle.component.scss']
})
export class PopupEvaluationControleComponent implements OnInit, OnDestroy {

  showAsCard: boolean = false;
  evaluationView: ControlEvaluationView | null = null;
  executionId!: string;
  canValidate: boolean = false;

  private dialog = inject(MatDialog);
  private fileService = inject(FileService);

  @Output() close = new EventEmitter<void>();
  @Output() evaluateRequested = new EventEmitter<void>();
  @Output() openDetailsRequested = new EventEmitter<void>();

  showNoEvalText = false;
  showEvaluateButton = true;

  mode: PopupMode = 'FORM';
  controlId : string = '';
  blockers: ControlExecution[] = [];
  evalDetails?: ControlEvaluationView;
  reviewComment = '';

  evaluationData: ControlEvaluation = {
    executionId: '',
    evaluation: Evaluation.MEDIUM,
    resume: '',
    comments: ''
  };
  evaluationOptions = Object.values(EvaluationControl);
  labels = EvaluationControlLabels;

  private controlService = inject(ControlService);
  private confirmService = inject(ConfirmService);
  private snackBarService = inject(SnackBarService);

  actionTaken: 'valid' | 'reexam' | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<PopupEvaluationControleComponent>) {
  }

  ngOnInit(): void {
    if (this.data) {
      this.executionId = this.data.executionId;
      this.mode = this.data.mode;
      this.controlId = this.data.controlId;
      if (this.data.mode === 'FORM') this.startEvaluationFor(this.executionId);
      if (this.data.mode === 'DETAILS') this.openDetails(this.executionId);
      this.evaluationView = this.data.evaluationView;
      this.canValidate = this.data.canValidate;
      this.actionTaken = this.data.action;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !this.showAsCard) this.cancel();
  };


  private loadBlockersThenDecide(executionId: string): void {
    this.controlService.getBlockers(executionId).subscribe({
      next: (res) => {
        this.blockers = res || [];
        this.mode = this.blockers.length > 0 ? 'BLOCKERS' : 'FORM';
      },
      error: () => {
        this.blockers = [];
        this.mode = 'FORM';
      }
    });
  }

  openDetails(executionId: string): void {
    this.mode = 'DETAILS';
    this.evalDetails = undefined;
    this.reviewComment = '';
    this.controlService.getEvaluationByExecution(executionId).subscribe({
      next: (res: any) => { this.evalDetails = res as ControlEvaluationView; },
      error: () => {
        this.confirmService.openConfirmDialog("Cette execution n'a pas encore d'évalutation soumise.", "", false).subscribe();
        this.evaluationData.executionId = executionId;
        this.loadBlockersThenDecide(executionId);
      }
    });
  }

  startEvaluationFor(executionId: string): void {
    this.evaluationData = {
      executionId,
      evaluation: Evaluation.MEDIUM,
      resume: '',
      comments: ''
    };
    this.mode = 'FORM';
  }

  handleAction() {
    if (this.actionTaken === 'valid') {
      this.approve();  // Appel de la logique de validation
    } else if (this.actionTaken === 'reexam') {
      this.requestReexam();  // Appel de la logique de réexamen
    } else if (this.actionTaken == 'eval') {
      this.submit();
    }
  }

  submit(): void {
    this.controlService.createEvaluation(this.evaluationData).subscribe(() => {
      this.dialogRef.close();
    });
  }

  approve(): void {
    if (!this.evalDetails?.id) return;
    if (!this.reviewComment.trim()) { this.snackBarService.info('Commentaire obligatoire'); return; }
    this.controlService.reviewEvaluationApprove(this.evalDetails.id, this.reviewComment).subscribe(() => {
      this.dialogRef.close();
    });
  }

  requestReexam(): void {
    if (!this.evalDetails?.id) return;
    if (!this.reviewComment.trim()) { this.snackBarService.info('Commentaire obligatoire'); return; }
    this.controlService.reviewEvaluationReexam(this.evalDetails.id, this.reviewComment).subscribe(() => {
      this.dialogRef.close();
    });
  }

  async viewFiles(closed: boolean = false) {

    let target = TargetType.CONTROL
    let files = await firstValueFrom(this.fileService.getFiles(target, this.executionId))

    this.dialog.open(FichiersComponent,
      {
        width: '400px',
        data: {
          files: files,
          targetType: target,
          targetId: this.executionId,
          closed: closed
        }
      }
    )
      .afterClosed().subscribe(_ => {
        if (!closed) {
          // this.confirmService.openConfirmDialog("Fichier uploadé avec succès", "Voulez-vous cloturer l'action ?", true).subscribe(
          //   result => {
          //     if (result) {
          //       this.validateAction(actionId);
          //     }
          //   }
          // )
        }
      });
  }

  cancel(): void { this.dialogRef.close(); }

  get evalLabel(): string {
    const v = (this.evaluationView?.evaluation || '').toUpperCase();
    if (v.includes('PARTIEL')) return 'Partiellement conforme';
    if (v.includes('NON')) return 'Non conforme';
    if (v.includes('CONF')) return 'Conforme';
    return '—';
  }
  get evalClass(): string {
    const v = (this.evaluationView?.evaluation || '').toUpperCase();
    if (v.includes('PARTIEL')) return 'pill-warning';
    if (v.includes('NON')) return 'pill-danger';
    if (v.includes('CONF')) return 'pill-success';
    return 'pill-default';
  }
  get hasValidation(): boolean {
    const v = this.evaluationView;
    if (!v) return false;
    return (v.reviewStatus === 'APPROVED' || v.reviewStatus === 'REEXAM_REQUESTED'
      || !!v.reviewedAt || !!v.reviewedBy || !!v.reviewComment);
  }
  get reviewBadgeClass(): string {
    const s = this.evaluationView?.reviewStatus;
    if (s === 'APPROVED') return 'pill-success';
    if (s === 'REEXAM_REQUESTED') return 'pill-warning';
    if (s === 'PENDING') return 'pill-default';
    return 'pill-default';
  }
  get reviewBadgeLabel(): string {
    const s = this.evaluationView?.reviewStatus;
    if (s === 'APPROVED') return 'Validée';
    if (s === 'REEXAM_REQUESTED') return 'Réexamen demandé';
    if (s === 'PENDING') return 'En attente de validation';
    return '—';
  }
}
