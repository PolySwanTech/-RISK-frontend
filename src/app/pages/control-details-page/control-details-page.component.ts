import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Imports Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

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
import { AuthService } from '../../core/services/auth/auth.service';
import { ControlExecutionDetails } from '../../core/models/ControlExecution';
import { EnumLabelPipe } from '../../shared/pipes/enum-label.pipe';
import { ExecutionDetailDialogComponent } from '../../features/execution-detail-dialog/execution-detail-dialog.component';

@Component({
  selector: 'app-control-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    GoBackComponent,
    MethodologyCardComponent,
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
  evaluationCache: Record<string, ControlEvaluationView | null> = {};
  goBackButtons: GoBackButton[] = [];

  // Liste simple pour l'affichage (remplace le carrousel)
  allSlides: Array<{ exec: ControlExecutionDetails; view: ControlEvaluationView | null }> = [];
  slides: Array<{ exec: ControlExecutionDetails; view: ControlEvaluationView | null }> = [];

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
      // Tri du plus récent au plus ancien
      this.controlExecutions = [...executions].sort((a, b) =>
        new Date(b.plannedAt as any).getTime() - new Date(a.plannedAt as any).getTime()
      );

      const calls = executions.map(e =>
        this.controlService.getEvaluationByExecution(e.id).pipe(catchError(() => of(null)))
      );

      forkJoin(calls).subscribe(views => {
        this.evaluationCache = {};
        executions.forEach((e, i) => this.evaluationCache[e.id] = views[i] as ControlEvaluationView | null);
        this.buildList();
      });
    });
  }

  private buildList(): void {
    if (!this.controlExecutions) {
      this.allSlides = [];
      this.slides = [];
      return;
    }

    // 1. On construit la liste complète triée
    this.allSlides = this.controlExecutions
      .map(e => ({ exec: e, view: this.evaluationCache[e.id] ?? null }))
      .sort((a, b) =>
        new Date(b.exec.plannedAt as any).getTime() - new Date(a.exec.plannedAt as any).getTime()
      );

    // 2. On ne garde que les 3 premiers pour l'affichage principal
    this.slides = this.allSlides.slice(0, 3);
    console.log(this.slides);
  }

  getStatusClass(status?: Status): string {
    if (!status) return '';
    // Ces classes doivent correspondre à ce qui existe dans styles.scss (ex: .achieved, .in_progress)
    return status.toLowerCase(); 
  }

  openEvaluationDetailsPopup(executionId: string, action: string): void {
    console.log(action)
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
      if(this.control) this.loadControlExecutions(this.control.id);
    });
  }

  openProcessDialog(row?: any) {
      this.dialog.open(ExecutionDetailDialogComponent, {
        minWidth: '700px',
        data: row
      }).afterClosed().subscribe(_ => {
        this.ngOnInit();
      });
    }

  getActionLabel(s: any): string {
    // Cas 1 : Réexamen demandé -> Prioritaire
    if (s.view?.reviewStatus === 'REEXAM_REQUESTED') {
      return 'Réévaluer';
    }
    // Cas 2 : Pas encore de vue (donc pas évalué) -> À faire
    if (!s.view) {
      return 'Évaluer';
    }
    // Cas 3 : Déjà évalué -> Consultation
    return 'Voir le détail';
  }

  getActionIcon(s: any): string {
    if (!s.view || s.view?.reviewStatus === 'REEXAM_REQUESTED') {
      return 'edit'; // Crayon pour l'action
    }
    return 'visibility'; // Oeil pour la consultation
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
      if(this.control) this.loadControlExecutions(this.control.id);
    });
  }

  handlePlanification(payload: any): void {
    if (!this.control || !payload) return;
    const reload = () => this.loadControlExecutions(this.control!.id);
    if (payload.id) {
      this.controlService.updateExecution(payload).subscribe(reload);
    } else {
      this.controlService.createExecution(payload).subscribe(reload);
    }
  }

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

  get currentOrLatestExecution(): ControlExecutionDetails | null {
    return this.controlExecutions?.[0] ?? null;
  }
}