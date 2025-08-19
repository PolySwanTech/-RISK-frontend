import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Status, statusLabels } from '../../core/enum/status.enum';
import { ControlService } from '../../core/services/control/control.service';
import { ControlTemplate } from '../../core/models/ControlTemplate';
import { ControlExecution } from '../../core/models/ControlExecution';
import { ControlEvaluationView } from '../../core/models/ControlEvaluation';

import { PlanifierExecutionPopupComponent } from './popup-planifier-execution/planifier-execution-popup/planifier-execution-popup.component';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { PopupEvaluationControleComponent } from './popup-evaluation-controle/popup-evaluation-controle/popup-evaluation-controle.component';

import { catchError, forkJoin, of } from 'rxjs';
import { RecurenceLabels } from '../../core/enum/recurence.enum';

@Component({
  selector: 'app-control-details-page',
  standalone: true,
  imports: [
    CommonModule,
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
  

  control: ControlTemplate | null = null;
  controlExecutions: ControlExecution[] | null = null;
  ControlStatus = Status;
  showPopup = false;
  currentUsername = '';
  showEvaluationPopup = false;
  selectedExecutionId: string | null = null;
  recurenceLabels = { ...RecurenceLabels };
  selectedExecutionToEdit: ControlExecution | null = null;
  selectedExecId: string | null = null;
  forceDetails: boolean = false;
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
    const target = this.selectedExec;
    if (!target) return;
    this.forceDetails = false;
    this.selectedExecutionId = target.id;
    this.showEvaluationPopup = true;
  }

  openEvaluationDetailsPopup(executionId: string): void {
    this.forceDetails = true;
    this.selectedExecutionId = executionId;
    this.showEvaluationPopup = true;
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

  canMarkAsRealized(): boolean {
    const ex = this.selectedExec;
    if (!ex || !this.currentUsername) return false;

    if (ex.performedBy !== this.currentUsername) return false;

    if (ex.status === Status.ACHIEVED) return false;

    const view = this.evaluationCache[ex.id];
    if (view?.reviewStatus === 'PENDING') return false;

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

  getCycleNo(executionId: string): number {
    return this.evaluationCache[executionId]?.cycleNo ?? 1;
  }

  getReexamIndex(executionId: string): number {
    const n = this.getCycleNo(executionId);
    return n > 1 ? n - 1 : 0;
  }

  get selectedExec(): ControlExecution | null {
    if (!this.controlExecutions) return null;
    return this.controlExecutions.find(e => e.id === this.selectedExecId) ?? null;
  }

  toggleSelection(id: string) {
    if (this.selectedExecId === id) {
      this.selectedExecId = null;
    } else {
      this.selectedExecId = id;
    }
  }

  get currentOrLatestExecution(): ControlExecution | null {
    return this.selectedExec ?? (this.controlExecutions?.[0] ?? null);
  }

}
