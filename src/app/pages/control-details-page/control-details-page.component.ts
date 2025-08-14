import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Status, statusLabels } from '../../core/enum/status.enum';
import { Priority, priorityLabels } from '../../core/enum/Priority';
import { Degree, degreeLabels } from '../../core/enum/degree.enum';

import { ControlService } from '../../core/services/control/control.service';
import { ControlTemplate } from '../../core/models/ControlTemplate';
import { ControlExecution } from '../../core/models/ControlExecution';
import { ControlEvaluationView } from '../../core/models/ControlEvaluation';

import { PlanifierExecutionPopupComponent } from './popup-planifier-execution/planifier-execution-popup/planifier-execution-popup.component';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { PopupEvaluationControleComponent } from './popup-evaluation-controle/popup-evaluation-controle/popup-evaluation-controle.component';

import { differenceInCalendarDays, parseISO } from 'date-fns';
import { catchError, forkJoin, of } from 'rxjs';
import { RecurenceLabels } from '../../core/enum/recurence.enum';

@Component({
  selector: 'app-control-details-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    PlanifierExecutionPopupComponent,
    GoBackComponent,
    PopupEvaluationControleComponent
  ],
  templateUrl: './control-details-page.component.html',
  styleUrls: ['./control-details-page.component.scss']
})
export class ControlDetailsPageComponent implements OnInit {

  private controlService = inject(ControlService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = 'details';

  control: ControlTemplate | null = null;
  controlExecutions: ControlExecution[] = [];

  // Enums pour le template
  ControlStatus = Status;
  Priority = Priority;
  ControlLevel = Degree;

  showPopup = false;
  currentUsername = '';

  showEvaluationPopup = false;
  selectedExecutionId: string | null = null;

  recurenceLabels = { ...RecurenceLabels };
  selectedExecutionToEdit: ControlExecution | null = null;

  blockers: ControlExecution[] = [];
  showBlockersPopup = false;

  showEvalDetailsPopup = false;
  evalDetails?: ControlEvaluationView;

  reviewComment = '';

  // Cache: executionId -> evaluation
  evaluationCache: Record<string, ControlEvaluationView | null> = {};

  goBackButtons = [
    {
      label: 'Exporter',
      icon: 'download',
      class: 'btn-secondary',
      show: true,
      action: () => this.exportControl()
    },
    {
      label: 'Modifier',
      icon: 'edit',
      class: 'btn-primary',
      show: true,
      action: () => this.editControl()
    }
  ];

  ngOnInit(): void {
    this.currentUsername = this.getUsernameFromToken() || '';
    const controlId = this.route.snapshot.paramMap.get('id');
    if (controlId) {
      this.loadControl(controlId);
      this.loadControlExecutions(controlId);
    }
  }

  loadControl(id: string): void {
    this.controlService.getControl(id).subscribe(control => this.control = control);
  }

  loadControlExecutions(id: string): void {
    this.controlService.getAllExecutions(id).subscribe(executions => {
      this.controlExecutions = executions;
      this.controlExecutions.sort((a, b) => {
        const da = new Date(a.plannedAt as any).getTime();
        const db = new Date(b.plannedAt as any).getTime();
        return db - da;
      });

      const calls = executions.map(e =>
        this.controlService.getEvaluationByExecution(e.id).pipe(catchError(() => of(null)))
      );

      forkJoin(calls).subscribe(views => {
        this.evaluationCache = {};
        executions.forEach((e, i) => {
          this.evaluationCache[e.id] = views[i] as ControlEvaluationView | null;
        });
      });
    });
  }

  getStatusClass(status?: Status): string {
    if (!status) return 'status-default';

    switch (status) {
      case Status.ACHIEVED: return 'status-realise';
      case Status.IN_PROGRESS: return 'status-en-cours';
      case Status.NOT_ACHIEVED: return 'status-non-realise';
      default: return 'status-default';
    }
  }

  editControl(): void {
    if (this.control) this.router.navigate(['/controls', this.control.id, 'edit']);
  }

  exportControl(): void {
    // TODO
  }

  markAsRealized(): void {
    const latest = this.getLatestExecution();
    if (!latest) return;

    this.controlService.getBlockers(latest.id).subscribe({
      next: (res) => {
        this.blockers = res || [];
        if (this.blockers.length > 0) {
          this.showBlockersPopup = true;
          this.showEvaluationPopup = false;
        } else {
          this.selectedExecutionId = latest.id;
          this.showEvaluationPopup = true;
        }
      },
      error: () => {
        this.blockers = [];
        this.showBlockersPopup = false;
      }
    });
  }

  scheduleExecution(): void { this.showPopup = true; }
  addNote(): void { /* TODO */ }

  viewFullHistory(): void {
    if (this.control) this.router.navigate(['/controls', this.control.id, 'history']);
  }

  formatStatus(status: Status): string { return statusLabels[status]; }

  handlePlanification(payload: any): void {
    if (!this.control) return;
    const reload = () => this.loadControlExecutions(this.control!.id.id);
    if (payload.id) this.controlService.updateExecution(payload).subscribe(reload);
    else this.controlService.createExecution(payload).subscribe(reload);
  }

  getUsernameFromToken(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || null;
    } catch { return null; }
  }

  private getLatestExecution(): ControlExecution | null {
    return this.controlExecutions?.[0] ?? null;
  }

  canMarkAsRealized(): boolean {
    const latest = this.getLatestExecution();
    if (!latest || !this.currentUsername) return false;

    if (latest.performedBy !== this.currentUsername) return false;
    
    if (latest.status === Status.ACHIEVED) return false;

    const latestEval = this.evaluationCache[latest.id];
    if (latestEval?.reviewStatus === 'PENDING') return false;

    return true;
  }

  handleEvaluationSubmitted(): void {
    if (this.control) this.loadControlExecutions(this.control.id.id);
  }

  editExecution(execution: ControlExecution): void {
    if (execution.status === this.ControlStatus.ACHIEVED) return;
    this.selectedExecutionToEdit = execution;
    this.showPopup = true;
  }

  openEvaluationFor(executionId: string): void {
    this.selectedExecutionId = executionId;
    this.showBlockersPopup = false;
    this.showEvaluationPopup = true;
  }

  // isLate(e: ControlExecution): boolean {
  //   if (!e.achievedAt || !e.plannedAt) return false;
  //   const a = typeof e.achievedAt === 'string' ? parseISO(e.achievedAt) : new Date(e.achievedAt);
  //   const p = typeof e.plannedAt === 'string' ? parseISO(e.plannedAt) : new Date(e.plannedAt);
  //   return differenceInCalendarDays(a, p) > 0;
  // }

  // delayDays(e: ControlExecution): number {
  //   if (!e.achievedAt || !e.plannedAt) return 0;
  //   const a = typeof e.achievedAt === 'string' ? parseISO(e.achievedAt) : new Date(e.achievedAt);
  //   const p = typeof e.plannedAt === 'string' ? parseISO(e.plannedAt) : new Date(e.plannedAt);
  //   return Math.max(0, differenceInCalendarDays(a, p));
  // }

  openEvalDetails(execution: ControlExecution): void {
    const cached = this.evaluationCache[execution.id];
    if (cached) { this.evalDetails = cached; this.showEvalDetailsPopup = true; return; }
    this.controlService.getEvaluationByExecution(execution.id).subscribe({
      next: (res: any) => { this.evalDetails = res as ControlEvaluationView; this.showEvalDetailsPopup = true; },
      error: () => { alert('Cette exécution n’a pas encore d’évaluation soumise.'); }
    });
  }

  hasEvaluation(exeId: string): boolean { return !!this.evaluationCache[exeId]; }
  getReviewStatus(exeId: string): 'PENDING' | 'APPROVED' | 'REEXAM_REQUESTED' | null {
    return (this.evaluationCache[exeId]?.reviewStatus ?? null) as any;
  }
  getEvaluatedAt(exeId: string): string | null { return this.evaluationCache[exeId]?.evaluatedAt ?? null; }
  getReviewedAt(exeId: string): string | null { return this.evaluationCache[exeId]?.reviewedAt ?? null; }
  getReviewedBy(exeId: string): string | null { return this.evaluationCache[exeId]?.reviewedBy ?? null; }

  private hasRole(role: string): boolean {
    const token = sessionStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.roles || [];
      const r = roles?.[0]?.role_name ?? roles?.[0] ?? '';
      return String(r).toUpperCase() === role.toUpperCase();
    } catch { return false; }
  }

  isValidator(): boolean { return this.hasRole('VALIDATEUR'); }
  pendingReview(): boolean { return !!this.evalDetails && this.evalDetails.reviewStatus === 'PENDING'; }

  approveEvaluation(): void {
    if (!this.evalDetails?.id) return;
    if (!this.reviewComment.trim()) { alert('Commentaire obligatoire'); return; }
    this.controlService.reviewEvaluationApprove(this.evalDetails.id, this.reviewComment).subscribe(() => {
      this.showEvalDetailsPopup = false;
      this.reviewComment = '';
      if (this.control) this.loadControlExecutions(this.control.id.id);
    });
  }

  requestReexam(): void {
    if (!this.evalDetails?.id) return;
    if (!this.reviewComment.trim()) { alert('Commentaire obligatoire'); return; }
    this.controlService.reviewEvaluationReexam(this.evalDetails.id, this.reviewComment).subscribe(() => {
      this.showEvalDetailsPopup = false;
      this.reviewComment = '';
      if (this.control) this.loadControlExecutions(this.control.id.id);
    });
  }

  get lastEvaluation(): ControlEvaluationView | null {
    if (!this.controlExecutions?.length) return null;

    const withEval = this.controlExecutions
      .map(e => ({ e, view: this.evaluationCache[e.id] }))
      .filter(x => !!x.view) as Array<{ e: ControlExecution; view: ControlEvaluationView }>;

    if (!withEval.length) return null;

    withEval.sort((a, b) => {
      const da = new Date(a.view.evaluatedAt ?? a.e.achievedAt ?? a.e.plannedAt!).getTime();
      const db = new Date(b.view.evaluatedAt ?? b.e.achievedAt ?? b.e.plannedAt!).getTime();
      return db - da;
    });

    return withEval[0].view;
  }

  getReviewChipClass(s: 'PENDING' | 'APPROVED' | 'REEXAM_REQUESTED' | null | undefined): string {
    if (s === 'APPROVED') return 'pill-success';
    if (s === 'REEXAM_REQUESTED') return 'pill-warning';
    return 'pill-default';
  }

  getReviewChipLabel(s: 'PENDING' | 'APPROVED' | 'REEXAM_REQUESTED' | null | undefined): string {
    if (s === 'APPROVED') return 'Validée';
    if (s === 'REEXAM_REQUESTED') return 'Réexamen demandé';
    return 'En attente de validation';
  }

  getCycleNo(executionId: string): number {
    return this.evaluationCache[executionId]?.cycleNo ?? 1;
  }

  getReexamIndex(executionId: string): number {
    const n = this.getCycleNo(executionId);
    return n > 1 ? n - 1 : 0;
  }

}
