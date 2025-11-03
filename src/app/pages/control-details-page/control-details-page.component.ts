import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Status } from '../../core/enum/status.enum';
import { ControlService } from '../../core/services/dmr/control/control.service';
import { ControlDetailsView } from '../../core/models/ControlTemplate';
import { ControlEvaluationView } from '../../core/models/ControlEvaluation';

import { PlanifierExecutionPopupComponent } from './popup-planifier-execution/planifier-execution-popup/planifier-execution-popup.component';
import { GoBackButton, GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { PopupEvaluationControleComponent } from './popup-evaluation-controle/popup-evaluation-controle/popup-evaluation-controle.component';

import { catchError, forkJoin, of } from 'rxjs';
import { RecurrenceLabels } from '../../core/enum/recurrence.enum';
import { MethodologyCardComponent } from './methodology-card/methodology-card.component';
import { EvaluationCardComponent } from './evaluation-card/evaluation-card.component';
import { MatDialog } from '@angular/material/dialog';
import { HasPermissionDirective } from "../../core/directives/has-permission.directive";
import { AuthService } from '../../core/services/auth/auth.service';
import { ControlExecutionDetails } from '../../core/models/ControlExecution';
import { EnumLabelPipe } from '../../shared/pipes/enum-label.pipe';

@Component({
  selector: 'app-control-details-page',
  standalone: true,
  imports: [
    CommonModule,
    GoBackComponent,
    EvaluationCardComponent,
    RouterModule,
    MethodologyCardComponent,
    HasPermissionDirective,
    EnumLabelPipe
  ],
  templateUrl: './control-details-page.component.html',
  styleUrls: ['./control-details-page.component.scss']
})
export class ControlDetailsPageComponent implements OnInit {

  private controlService = inject(ControlService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  control: ControlDetailsView | null = null;
  controlExecutions: ControlExecutionDetails[] | null = null;

  recurrenceLabels = { ...RecurrenceLabels };

  // Cache des vues d'évaluation
  evaluationCache: Record<string, ControlEvaluationView | null> = {};

  // Boutons GoBack (seulement Planifier + Historique)
  goBackButtons: GoBackButton[] = [];

  // === Carrousel (4 dernières exécutions) ===
  slides: Array<{ exec: ControlExecutionDetails; view: ControlEvaluationView | null }> = [];
  currentSlide = 0;

  isDragging = false;
  private dragStartX = 0;
  private lastX = 0;
  dragOffsetPx = 0;
  private dragThreshold = 60; // px pour déclencher un slide
  private dragStartedInside = false;

  ngOnInit(): void {
    const controlId = this.route.snapshot.paramMap.get('id');
    if (controlId) {
      this.loadControl(controlId);
      this.loadControlExecutions(controlId);
    }
  }

  loadControl(id: string): void {
    this.controlService.getControl(id).subscribe(control => {
      this.control = control;
      this.goBackButtons = [{
        label: 'Planifier exécution',
        icon: 'calendar_today',
        class: 'btn-purple',
        show: this.sameCreator(),
        permission: 'CREATE_CONTROLE',
        action: () => this.scheduleExecution()
      },
      {
        label: "Voir tout l'historique",
        icon: 'history',
        class: 'btn-primary',
        show: true,
        action: () => this.viewFullHistory()
      }];
    });
  }

  sameCreator() {
    return this.authService.sameUserName(this.control?.creator || '');
  }

  sameEvaluator(s: string) {
    return this.authService.sameUserName(s);
  }

  loadControlExecutions(id: string): void {
    this.controlService.getAllExecutions(id).subscribe(executions => {
      this.controlExecutions = [...executions].sort((a, b) =>
        new Date(b.plannedAt as any).getTime() - new Date(a.plannedAt as any).getTime()
      );

      const calls = executions.map(e =>
        this.controlService.getEvaluationByExecution(e.id).pipe(catchError(() => of(null)))
      );

      forkJoin(calls).subscribe(views => {
        this.evaluationCache = {};
        executions.forEach((e, i) => this.evaluationCache[e.id] = views[i] as ControlEvaluationView | null);
        this.buildSlides();
      });
    });
  }

  private buildSlides(): void {
    if (!this.controlExecutions) { this.slides = []; return; }
    this.slides = this.controlExecutions
      .map(e => ({ exec: e, view: this.evaluationCache[e.id] ?? null }))
      .sort((a, b) =>
        new Date(a.exec.plannedAt as any).getTime() - new Date(b.exec.plannedAt as any).getTime()
      );
    this.currentSlide = Math.max(0, this.slides.length - 1);
  }

  // === Helpers affichage ===
  getStatusClass(status?: Status): string {
    if (!status) return '';
    switch (status) {
      case Status.ACHIEVED: return 'achieved';
      case Status.IN_PROGRESS: return 'in_progress';
      default: return '';
    }
  }

  openEvaluationDetailsPopup(executionId: string, action: string): void {
    this.dialog.open(PopupEvaluationControleComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: {
        action: action,
        executionId: executionId,
        evaluationView: this.evaluationCache[executionId] || null,
        mode: action == 'eval' ? 'FORM' : 'DETAILS',
        canValidate: true
      }
    }).afterClosed().subscribe(() => {
      this.loadControlExecutions(this.control!.id);
    });
  }

  evaluateExec(executionId: string, action: string): void {
    this.dialog.open(PopupEvaluationControleComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: {
        action: action,
        controlId: this.control?.id,
        evaluationView: this.evaluationCache[executionId] || null,
        executionId: executionId,
        mode: 'FORM',
        canValidate: true
      }
    }).afterClosed().subscribe(() => {
      this.loadControlExecutions(this.control!.id);
    });
  }

  handlePlanification(payload: any): void {
    if (!this.control || !payload) return;

    const reload = () => this.loadControlExecutions(this.control!.id);

    if (payload.id) {
      // Mode édition
      this.controlService.updateExecution(payload).subscribe(reload);
    } else {
      // Mode création
      this.controlService.createExecution(payload).subscribe(reload);
    }
  }

  handleEvaluationSubmitted(): void {
    if (this.control) this.loadControlExecutions(this.control.id);
  }

  /** === ACTIONS === */

  scheduleExecution(): void {
    if (!this.control) return;

    const dialogRef = this.dialog.open(PlanifierExecutionPopupComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: {
        controlId: this.control.id,
        frequence: this.control.frequency,
        isEditing: false,
        lastPlannedAt: this.controlExecutions?.[0]?.plannedAt
      }
    });

    dialogRef.afterClosed().subscribe(payload => {
      if (payload) {
        this.handlePlanification(payload);
      }
    });
  }

  viewFullHistory(): void {
    if (this.control) this.router.navigate(['control', 'details', this.control.id, 'executions']);
  }

  /** === Carrousel === */

  hasPrev(): boolean {
    return this.currentSlide > 0;
  }

  hasNext(): boolean {
    return this.currentSlide < Math.max(0, this.slides.length - 1);
  }

  prevSlide(): void {
    if (this.hasPrev()) this.currentSlide -= 1;
  }

  nextSlide(): void {
    if (this.hasNext()) this.currentSlide += 1;
  }

  goTo(i: number): void {
    if (i >= 0 && i < this.slides.length) this.currentSlide = i;
  }

  /** === FIN carrousel === */

  // === Calculations pour l'en-tête ===
  get currentOrLatestExecution(): ControlExecutionDetails | null {
    return this.controlExecutions?.[0] ?? null;
  }

  onDragStart(e: PointerEvent | TouchEvent) {
    const x = (e as TouchEvent).touches?.[0]?.clientX ?? (e as PointerEvent).clientX;
    this.isDragging = true;
    this.dragStartedInside = true;
    this.dragStartX = x;
    this.lastX = x;
    this.dragOffsetPx = 0;
  }

  onDragMove(e: PointerEvent | TouchEvent) {
    if (!this.isDragging || !this.dragStartedInside) return;
    const x = (e as TouchEvent).touches?.[0]?.clientX ?? (e as PointerEvent).clientX;
    this.lastX = x;
    this.dragOffsetPx = x - this.dragStartX;
  }

  onDragEnd(_e?: PointerEvent | TouchEvent) {
    if (!this.isDragging) return;
    const delta = this.lastX - this.dragStartX;

    if (Math.abs(delta) > this.dragThreshold) {
      if (delta < 0) this.nextSlide();
      else this.prevSlide();
    }
    this.isDragging = false;
    this.dragStartedInside = false;
    this.dragOffsetPx = 0;
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') { this.prevSlide(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { this.nextSlide(); e.preventDefault(); }
  }

  computeMetaStripe(s: any): string {
    if (s?.view?.reexamen === true || s?.view?.needsReexamination === true || s?.view?.status === 'REEXAMINATION') {
      return 'stripe--danger';
    }

    if (s?.exec?.status === 'IN_PROGRESS') {
      return 'stripe--danger';
    }

    if (s?.view && !s?.view?.reviewedAt) {
      return 'stripe--pending';
    }

    if (s?.exec?.status === 'ACHIEVED' || s?.exec?.status === 'CLOSED') {
      return 'stripe--success';
    }

    return 'stripe--neutral';
  }
}