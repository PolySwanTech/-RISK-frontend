import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EvaluationControl, EvaluationControlLabels } from '../../../core/enum/evaluation-controle.enum';
import { Evaluation, EvaluationLabels } from '../../../core/enum/evaluation.enum';
import { ControlEvaluationView, ControlEvaluation } from '../../../core/models/ControlEvaluation';
import { ControlExecution } from '../../../core/models/ControlExecution';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { ControlService } from '../../../core/services/control/control.service';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { TargetType } from '../../../core/enum/targettype.enum';
import { FichiersComponent } from '../../../shared/components/fichiers/fichiers.component';
import { MatDialog } from '@angular/material/dialog';
import { FileService } from '../../../core/services/file/file.service';
import { ReviewStatus, ReviewStatusLabels } from '../../../core/enum/reviewStatus.enum';
import { HasPermissionDirective } from "../../../core/directives/has-permission.directive";
import { AuthService } from '../../../core/services/auth/auth.service';

type PopupMode = 'FORM' | 'BLOCKERS' | 'DETAILS';

@Component({
  selector: 'app-evaluation-card',
  imports: [CommonModule, FormsModule, MatIconModule, HasPermissionDirective],
  templateUrl: './evaluation-card.component.html',
  styleUrl: './evaluation-card.component.scss'
})
export class EvaluationCardComponent {

  @Input() showAsCard: boolean = false;
  @Input() evaluationView: ControlEvaluationView | null = null;

  @Input() initialMode?: PopupMode;

  @Input() executionId!: string;

  @Input() canValidate: boolean = false;

  @Output() close = new EventEmitter<void>();

  @Output() openDetailsRequested = new EventEmitter<string>();

  @Input() showNoEvalText = false;
  @Input() showEvaluateButton = true;

  mode: PopupMode = 'FORM';
  blockers: ControlExecution[] = [];
  evalDetails?: ControlEvaluationView;
  reviewComment = '';

  evaluationData: ControlEvaluation = {
    executionId: '',
    evaluation: Evaluation.MEDIUM,
    resume: '',
    comments: ''
  };

  private controlService = inject(ControlService);
  private fileService = inject(FileService);
  private confirmService = inject(ConfirmService);
  private authService = inject(AuthService);

  actionTaken: 'valid' | 'reexam' | null = null;

  ngOnInit(): void {

    if (this.showAsCard) return;

    window.addEventListener('keydown', this.onKeyDown);

    if (this.initialMode === 'DETAILS') {
      this.openDetails(this.executionId);
      return;
    }

    this.evaluationData.executionId = this.executionId;
    this.loadBlockersThenDecide(this.executionId);
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

  sameCreator() {
    return this.authService.sameUserName(this.evaluationView?.performedBy || '');
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

  handleAction(action: string) {
    this.openDetailsRequested.emit(action);
  }

  cancel(): void { this.close.emit(); }

  async viewFiles(closed: boolean = false) {

    let target = TargetType.CONTROL
    let files = await firstValueFrom(this.fileService.getFiles(target, this.executionId))

    this.fileService.openFiles(files, target, this.executionId)
      .afterClosed().subscribe();
  }

  get evalLabel(): string {
    if (this.evaluationView) {
      return EvaluationControlLabels[this.evaluationView.evaluation]
    }
    else {
      return '—';
    }
  }

  get evalClass(): string {
    if (this.evaluationView) {
      switch (this.evaluationView.evaluation) {
        case EvaluationControl.CONFORME: return 'conforme';
        case EvaluationControl.NON_CONFORME: return 'non_conforme';
        case EvaluationControl.PARTIELLEMENT_CONFORME: return 'partiel';
        default: return 'pill_default';
      }
    }
    return 'pill_default';
  }
  
  get reviewBadgeClass(): string {
    const s = this.evaluationView?.reviewStatus;
    if (s) {
      switch (s) {
        case ReviewStatus.APPROVED: return 'validé';
        case ReviewStatus.REEXAM_REQUESTED: return 'pending';
        case ReviewStatus.PENDING: return 'in_progress';
        case ReviewStatus.REJECTED: return 'annulé';
        default: return '';
      }
    }
    return '';
  }
  
  get reviewBadgeLabel(): string {
    const s = this.evaluationView?.reviewStatus;
    return s ? ReviewStatusLabels[s] : '—';
  }
}
