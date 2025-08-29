import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlEvaluation, ControlEvaluationView } from '../../../../core/models/ControlEvaluation';
import { Evaluation } from '../../../../core/enum/evaluation.enum';
import { ControlService } from '../../../../core/services/control/control.service';
import { EvaluationControl, EvaluationControlLabels } from '../../../../core/enum/evaluation-controle.enum';
import { ControlExecution } from '../../../../core/models/ControlExecution';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';

type PopupMode = 'FORM' | 'BLOCKERS' | 'DETAILS';

@Component({
  selector: 'app-popup-evaluation-controle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './popup-evaluation-controle.component.html',
  styleUrls: ['./popup-evaluation-controle.component.scss']
})
export class PopupEvaluationControleComponent implements OnInit, OnDestroy {

  @Input() showAsCard: boolean = false;
  @Input() evaluationView: ControlEvaluationView | null = null;

  @Input() initialMode?: PopupMode;

  @Input() executionId!: string;

  @Input() canValidate: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
  @Output() reviewed = new EventEmitter<void>();

  @Output() evaluateRequested = new EventEmitter<void>();
  @Output() openDetailsRequested = new EventEmitter<void>();

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
  evaluationOptions = Object.values(EvaluationControl);
  labels = EvaluationControlLabels;

  private controlService = inject(ControlService);
  private confirmService = inject(ConfirmService);

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


  submit(): void {
    this.controlService.createEvaluation(this.evaluationData).subscribe(() => {
      this.submitted.emit();
      this.close.emit();
    });
  }

  approve(): void {
    if (!this.evalDetails?.id) return;
    if (!this.reviewComment.trim()) { alert('Commentaire obligatoire'); return; }
    this.controlService.reviewEvaluationApprove(this.evalDetails.id, this.reviewComment).subscribe(() => {
      this.reviewComment = '';
      this.reviewed.emit();
      this.close.emit();
    });
  }

  requestReexam(): void {
    if (!this.evalDetails?.id) return;
    if (!this.reviewComment.trim()) { alert('Commentaire obligatoire'); return; }
    this.controlService.reviewEvaluationReexam(this.evalDetails.id, this.reviewComment).subscribe(() => {
      this.reviewComment = '';
      this.reviewed.emit();
      this.close.emit();
    });
  }

  cancel(): void { this.close.emit(); }

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
