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
import { MethodologyCardComponent } from './methodology-card/methodology-card.component';

@Component({
  selector: 'app-control-details-page',
  standalone: true,
  imports: [
    CommonModule,
    PlanifierExecutionPopupComponent,
    GoBackComponent,
    PopupEvaluationControleComponent,
    RouterModule,
    MethodologyCardComponent
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
  recurenceLabels = { ...RecurenceLabels };

  // Popups
  showPopup = false;
  showEvaluationPopup = false;
  selectedExecutionId: string | null = null;
  selectedExecutionToEdit: ControlExecution | null = null;
  forceDetails: boolean = false;

  // Sélection utilisateur
  currentUsername = '';
  selectedExecId: string | null = null;

  // Cache des vues d'évaluation
  evaluationCache: Record<string, ControlEvaluationView | null> = {};

  // Boutons GoBack (seulement Planifier + Historique)
  goBackButtons = [
    {
      label: 'Planifier exécution',
      icon: 'calendar',
      class: 'btn-primary',
      show: true,
      action: () => this.scheduleExecution()
    },
    {
      label: 'Voir tout l’historique',
      icon: 'history',
      class: 'btn-secondary',
      show: true,
      action: () => this.viewFullHistory()
    }
  ];

  // === Carrousel (4 dernières exécutions) ===
  slides: Array<{ exec: ControlExecution; view: ControlEvaluationView | null }> = [];
  currentSlide = 0;

  isDragging = false;
  private dragStartX = 0;
  private lastX = 0;
  dragOffsetPx = 0;
  private dragThreshold = 60; // px pour déclencher un slide
  private dragStartedInside = false;

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
        new Date(b.exec.plannedAt as any).getTime() - new Date(a.exec.plannedAt as any).getTime()
      )
      .slice(0, 4);
    this.currentSlide = 0;
  }

  // === Helpers affichage ===
  getStatusClass(status?: Status): string {
    if (!status) return 'status-default';
    switch (status) {
      case Status.ACHIEVED: return 'status-realise';
      case Status.IN_PROGRESS: return 'status-en-cours';
      case Status.NOT_ACHIEVED: return 'status-non-realise';
      default: return 'status-default';
    }
  }
  formatStatus(s?: Status) { return s ? statusLabels[s] : '—'; }

  getUsernameFromToken(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || null;
    } catch { return null; }
  }

  // === Actions ===
  scheduleExecution(): void { this.showPopup = true; }
  viewFullHistory(): void {
    if (this.control) this.router.navigate(['/controls', this.control.id, 'history']);
  }
  openEvaluationDetailsPopup(executionId: string): void {
    this.forceDetails = true;
    this.selectedExecutionId = executionId;
    this.showEvaluationPopup = true;
  }

  handlePlanification(payload: any): void {
    if (!this.control) return;
    const reload = () => this.loadControlExecutions(this.control!.id.id);
    if (payload.id) this.controlService.updateExecution(payload).subscribe(reload);
    else this.controlService.createExecution(payload).subscribe(reload);
  }
  handleEvaluationSubmitted(): void {
    if (this.control) this.loadControlExecutions(this.control.id.id);
  }

  hasPrev(): boolean {
    return this.currentSlide < Math.max(0, this.slides.length - 1);
  }
  hasNext(): boolean {
    return this.currentSlide > 0;
  }
  prevSlide(): void {
    if (this.hasPrev()) this.currentSlide++;
  }
  nextSlide(): void {
    if (this.hasNext()) this.currentSlide--;
  }
  goTo(i: number): void { if (i >= 0 && i < this.slides.length) this.currentSlide = i; }

  // === Calculations pour l’en-tête ===
  get currentOrLatestExecution(): ControlExecution | null {
    return this.controlExecutions?.[0] ?? null;
  }

  evaluateExec(execId: string): void {
    this.forceDetails = false;              // ouvre la modale en mode FORM (pas DETAILS)
    this.selectedExecutionId = execId;
    this.showEvaluationPopup = true;
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
      if (delta < 0) this.prevSlide();
      else this.nextSlide();
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

  getControlVersionIso(): string {
    return this.control ? new Date(this.control.id.version).toISOString() : '';
  }

}
