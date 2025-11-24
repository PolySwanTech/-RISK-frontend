import { Component, OnInit, OnDestroy, inject, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ControlEvaluation, ControlEvaluationView } from '../../../../core/models/ControlEvaluation';
import { ControlService } from '../../../../core/services/dmr/control/control.service';
import { EvaluationControl, EvaluationControlLabels } from '../../../../core/enum/evaluation-controle.enum';
import { ControlExecution } from '../../../../core/models/ControlExecution';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from '../../../../core/services/snack-bar/snack-bar.service';
import { ReviewStatus } from '../../../../core/enum/reviewStatus.enum';
import { MatIcon } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { TargetType } from '../../../../core/enum/targettype.enum';
import { FileService } from '../../../../core/services/file/file.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { BasePopupComponent, PopupAction } from '../../../../shared/components/base-popup/base-popup.component';
import { DraftService } from '../../../../core/services/draft.service';

type PopupMode = 'FORM' | 'BLOCKERS' | 'DETAILS';

export interface EvaluationDialogData {
  executionId: string;
  mode: PopupMode;
  controlId: string;
  evaluationView?: ControlEvaluationView;
  canValidate?: boolean;
  action?: 'valid' | 'reexam' | 'eval';
  draftId?: string;
}

@Component({
  selector: 'app-popup-evaluation-controle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIcon,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    BasePopupComponent
  ],
  templateUrl: './popup-evaluation-controle.component.html',
  styleUrls: ['./popup-evaluation-controle.component.scss']
})
export class PopupEvaluationControleComponent implements OnInit, OnDestroy {

  private readonly COMPONENT_NAME = 'PopupEvaluationControleComponent';

  private controlService = inject(ControlService);
  private confirmService = inject(ConfirmService);
  private snackBarService = inject(SnackBarService);
  private fileService = inject(FileService);
  private fb = inject(FormBuilder);
  private draftService = inject(DraftService);
  dialogRef = inject(MatDialogRef<PopupEvaluationControleComponent>);

  popupActions: PopupAction[] = [];
  private currentDraftId: string | null = null;

  // Form data
  evaluationForm: FormGroup;
  reviewForm: FormGroup;

  // State
  mode: PopupMode = 'FORM';
  executionId: string = '';
  controlId: string = '';
  blockers: ControlExecution[] = [];
  evalDetails?: ControlEvaluationView;
  evaluationView: ControlEvaluationView | null = null;
  canValidate: boolean = false;
  actionTaken: 'valid' | 'reexam' | 'eval' | null = null;

  // Options
  evaluationOptions = Object.values(EvaluationControl);
  labels = EvaluationControlLabels;

  constructor(@Inject(MAT_DIALOG_DATA) public data: EvaluationDialogData | null) {
    // Initialiser les formulaires
    this.evaluationForm = this.fb.group({
      evaluation: ['', Validators.required],
      resume: ['', Validators.required],
      comments: ['']
    });

    this.reviewForm = this.fb.group({
      reviewComment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.executionId = this.data.executionId;
      this.mode = this.data.mode;
      this.controlId = this.data.controlId;
      this.evaluationView = this.data.evaluationView || null;
      this.canValidate = this.data.canValidate || false;
      this.actionTaken = this.data.action || null;

      // Charger le brouillon si un draftId est fourni
      if (this.data.draftId) {
        this.loadDraft(this.data.draftId);
        this.currentDraftId = this.data.draftId;
        this.draftService.hideDraft(this.data.draftId);
      } else {
        // Initialiser selon le mode
        if (this.mode === 'FORM') this.startEvaluationFor(this.executionId);
        if (this.mode === 'DETAILS') this.openDetails(this.executionId);
      }
    }

    this.dialogRef.backdropClick().subscribe(() => {
      if (this.hasFormData()) {
        this.saveDraft();
      } else if (this.currentDraftId) {
        this.draftService.showDraft(this.currentDraftId);
      }
    });

    this.initActions();
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  loadDraft(draftId: string): void {
    const draft = this.draftService.getDraftById(draftId);
    this.executionId = draft?.data.executionId || this.executionId;
    if (draft) {
      if (draft.data.evaluationForm) {
        this.evaluationForm.patchValue(draft.data.evaluationForm);
      }
      if (draft.data.reviewForm) {
        this.reviewForm.patchValue(draft.data.reviewForm);
      }
      if (draft.data.mode) {
        this.mode = draft.data.mode;
      }
    }
  }

  initActions(): void {
    this.popupActions = [
      {
        label: 'Fermer',
        icon: 'close',
        color: 'red',
        onClick: () => this.cancel()
      },
      {
        label: this.getActionLabel(),
        icon: 'check',
        primary: true,
        disabled: () => this.isActionDisabled(),
        onClick: () => this.handleAction()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  getTitlePage(): string {
    if (this.mode === 'DETAILS') {
      return this.actionTaken === 'valid' ? 'Détail de l\'évaluation' : 'Détail du réexamen';
    }
    if (this.mode === 'BLOCKERS') {
      return 'Évaluations en attente';
    }
    return 'Évaluer le contrôle';
  }

  getActionLabel(): string {
    if (this.actionTaken === 'valid') return 'Valider';
    if (this.actionTaken === 'reexam') return 'Demander un réexamen';
    if (this.mode === 'FORM') return 'Soumettre l\'évaluation';
    return 'OK';
  }

  isActionDisabled(): boolean {
    if (this.mode === 'FORM') {
      return this.evaluationForm.invalid;
    }
    if (this.mode === 'DETAILS' && (this.actionTaken === 'valid' || this.actionTaken === 'reexam')) {
      return this.reviewForm.invalid;
    }
    return false;
  }

  hasFormData(): boolean {
    const evalData = this.evaluationForm.value;
    const reviewData = this.reviewForm.value;
    return !!(
      (evalData.resume && evalData.resume.trim() !== '') ||
      (evalData.comments && evalData.comments.trim() !== '') ||
      (evalData.evaluation && evalData.evaluation !== null) ||
      (reviewData.reviewComment && reviewData.reviewComment.trim() !== '')
    );
  }

  saveDraft(): void {
    if (!this.hasFormData() || this.mode === 'DETAILS') {
      return; // Ne pas sauvegarder en mode détails
    }

    const draftData = {
      evaluationForm: this.evaluationForm.value,
      reviewForm: this.reviewForm.value,
      mode: this.mode,
      executionId: this.executionId,
      controlId: this.controlId
    };

    const title = `Évaluation: ${this.evaluationForm.get('resume')?.value || 'En cours'}`;

    if (this.currentDraftId) {
      this.draftService.updateDraft(
        this.currentDraftId,
        title,
        draftData,
        true
      );
    } else {
      this.currentDraftId = this.draftService.createDraft(
        this.COMPONENT_NAME,
        title,
        draftData,
        true
      );
    }
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.cancel();
  };

  private loadBlockersThenDecide(executionId: string): void {
    this.controlService.getBlockers(executionId).subscribe({
      next: (res) => {
        this.blockers = res || [];
        this.mode = this.blockers.length > 0 ? 'BLOCKERS' : 'FORM';
        this.initActions();
      },
      error: () => {
        this.blockers = [];
        this.mode = 'FORM';
        this.initActions();
      }
    });
  }

  openDetails(executionId: string): void {
    this.mode = 'DETAILS';
    this.evalDetails = undefined;
    this.reviewForm.reset();
    
    this.controlService.getEvaluationByExecution(executionId).subscribe({
      next: (res: any) => {
        this.evalDetails = res as ControlEvaluationView;
      },
      error: () => {
        this.confirmService.openConfirmDialog(
          "Cette execution n'a pas encore d'évalutation soumise.", 
          "", 
          false
        ).subscribe();
        this.loadBlockersThenDecide(executionId);
      }
    });
  }

  startEvaluationFor(executionId: string): void {
    this.executionId = executionId;
    this.evaluationForm.reset({
      evaluation: '',
      resume: '',
      comments: ''
    });
    this.mode = 'FORM';
    this.initActions();
  }

  handleAction() {
    if (this.actionTaken === 'valid') {
      this.approve();
    } else if (this.actionTaken === 'reexam') {
      this.requestReexam();
    } else if (this.actionTaken === 'eval' || this.mode === 'FORM') {
      this.submit();
    } else {
      this.cancel();
    }
  }

  submit(): void {
    if (this.evaluationForm.invalid) {
      this.evaluationForm.markAllAsTouched();
      return;
    }

    const evaluationData: ControlEvaluation = {
      executionId: this.executionId,
      ...this.evaluationForm.value
    };

    this.controlService.createEvaluation(evaluationData).subscribe({
      next: () => {
        // Supprimer le brouillon après sauvegarde réussie
        if (this.currentDraftId) {
          this.draftService.deleteDraft(this.currentDraftId);
        }
        this.snackBarService.success('Évaluation soumise avec succès ✅');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBarService.error(err.error?.message || 'Erreur lors de la soumission de l\'évaluation');
      }
    });
  }

  approve(): void {
    if (!this.evalDetails?.id) return;
    
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      this.snackBarService.info('Commentaire obligatoire');
      return;
    }

    const comment = this.reviewForm.get('reviewComment')?.value;
    this.controlService.reviewEvaluationApprove(this.evalDetails.id, comment).subscribe({
      next: () => {
        this.snackBarService.success('Évaluation validée ✅');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBarService.error(err.error?.message || 'Erreur lors de la validation');
      }
    });
  }

  requestReexam(): void {
    if (!this.evalDetails?.id) return;
    
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      this.snackBarService.info('Commentaire obligatoire');
      return;
    }

    const comment = this.reviewForm.get('reviewComment')?.value;
    this.controlService.reviewEvaluationReexam(this.evalDetails.id, comment).subscribe({
      next: () => {
        this.snackBarService.success('Demande de réexamen envoyée ✅');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBarService.error(err.error?.message || 'Erreur lors de la demande de réexamen');
      }
    });
  }

  async viewFiles() {
    const target = TargetType.CONTROL;
    const files = await firstValueFrom(this.fileService.getFiles(target, this.executionId));
    this.fileService.openFiles(files, target, this.executionId).afterClosed().subscribe();
  }

  cancel(): void {
    if (this.hasFormData() && this.mode === 'FORM') {
      this.saveDraft();
    } else if (this.currentDraftId) {
      this.draftService.showDraft(this.currentDraftId);
    }
    this.dialogRef.close();
  }

  @HostListener('window:beforeunload')
  beforeUnload(): void {
    if (this.hasFormData() && this.mode === 'FORM') {
      this.saveDraft();
    }
  }

  // Getters pour l'affichage
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
    return (
      v.reviewStatus === 'APPROVED' ||
      v.reviewStatus === 'REEXAM_REQUESTED' ||
      !!v.reviewedAt ||
      !!v.reviewedBy ||
      !!v.reviewComment
    );
  }

  get reviewBadgeClass(): string {
    const s = this.evaluationView?.reviewStatus;
    if (s === ReviewStatus.APPROVED) return 'pill-success';
    if (s === ReviewStatus.REEXAM_REQUESTED) return 'pill-warning';
    if (s === ReviewStatus.PENDING) return 'pill-default';
    if (s === ReviewStatus.REJECTED) return 'pill-danger';
    return 'pill-default';
  }
}