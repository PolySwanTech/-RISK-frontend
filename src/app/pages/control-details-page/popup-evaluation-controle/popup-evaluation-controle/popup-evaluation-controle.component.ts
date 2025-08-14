import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlEvaluation } from '../../../../core/models/ControlEvaluation';
import { Evaluation } from '../../../../core/enum/evaluation.enum';
import { ControlService } from '../../../../core/services/control/control.service';
import { EvaluationControl, EvaluationControlLabels } from '../../../../core/enum/evaluation-controle.enum';
import { ControlEvaluationView } from '../../../../core/models/ControlEvaluation';


@Component({
  selector: 'app-popup-evaluation-controle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './popup-evaluation-controle.component.html',
  styleUrl: './popup-evaluation-controle.component.scss'
})
export class PopupEvaluationControleComponent {

  @Input() executionId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  @Input() showAsCard: boolean = false;
  @Input() evaluationView: ControlEvaluationView | null = null;

  evaluationData: ControlEvaluation = {
    executionId: '',
    evaluation: Evaluation.MEDIUM,
    resume: '',
    comments: ''
  };

  evaluationOptions = Object.values(EvaluationControl);
  labels = EvaluationControlLabels;

  constructor(private controlService: ControlService) { }

  ngOnInit(): void {
    if (!this.showAsCard) {
      this.evaluationData.executionId = this.executionId;
      window.addEventListener('keydown', this.onKeyDown);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }
  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !this.showAsCard) this.cancel();
  };

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

  submit(): void {
    this.controlService.createEvaluation(this.evaluationData).subscribe(() => {
      this.submitted.emit();
      this.close.emit();
    });
  }

  cancel(): void {
    this.close.emit();
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
