import { Component, inject, Input, LOCALE_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionPlanService } from '../../core/services/action-plan/action-plan.service';
import { ImpactCardComponent } from '../../features/incident/impact-card/impact-card.component';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { FichiersComponent } from '../../shared/components/fichiers/fichiers.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Action } from '../../core/models/ActionPlan';
import { AuthService } from '../../core/services/auth/auth.service';
import { Statut } from '../../core/models/Statut';

@Component({
  selector: 'app-plan-action-page-detail',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, DatePipe,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, GoBackComponent, MatTooltipModule, CommonModule, MatProgressBarModule],
  templateUrl: './plan-action-page-detail.component.html',
  styleUrl: './plan-action-page-detail.component.scss'
})
export class PlanActionPageDetailComponent {

  private actionPlanService = inject(ActionPlanService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  actionPlan: any;
  idPlanAction: string = this.route.snapshot.params['id'];

  progressionPercent: number = 0;
  completedActions: number = 0;
  totalActions: number = 0;

  validator: string = '';

  ngOnInit() {
    this.getActionPlan(this.idPlanAction);
  }

  getActionPlan(id: string) {
    this.actionPlan = this.actionPlanService.getActionPlan(id);

    if (this.actionPlan?.actions?.length) {
      this.totalActions = this.actionPlan.actions.length;
      this.completedActions = this.getCompletedCount(this.actionPlan.actions);
      this.progressionPercent = this.getCompletionRate(this.actionPlan.actions);
      this.updateStatus();
    }

    console.log(this.actionPlan);
  }

  validateAction(action: Action, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      action.completed = true;
      action.fileName = file.name;
      action.completedBy = this.authService.decryptToken()?.sub;
      action.completedAt = new Date().toISOString();

      // 🔁 Recalculer les valeurs après validation
      if (this.actionPlan?.actions) {
        this.completedActions = this.getCompletedCount(this.actionPlan.actions);
        this.progressionPercent = this.getCompletionRate(this.actionPlan.actions);
        this.updateStatus();
      }
    }
  }

  getCompletedCount(actions: Action[]): number {
    return actions.filter(a => a.completed).length;
  }

  getCompletionRate(actions: Action[]): number {
    return actions.length ? Math.round((this.getCompletedCount(actions) / actions.length) * 100) : 0;
  }

  updateStatus() {
    const completed = this.completedActions;
    const total = this.totalActions;

    if (total === 0) {
      this.actionPlan.status = Statut.NOT_ACHIEVED;
    } else if (completed === 0) {
      this.actionPlan.status = Statut.NOT_ACHIEVED;
    } else if (completed === total) {
      this.actionPlan.status = Statut.ACHIEVED;
    } else {
      this.actionPlan.status = Statut.IN_PROGRESS;
    }
  }

  getReadableStatut(status: Statut): string {
  switch (status) {
    case Statut.IN_PROGRESS:
      return 'En cours';
    case Statut.ACHIEVED:
      return 'Clôturé';
    case Statut.NOT_ACHIEVED:
      return 'Non réalisé';
    default:
      return 'Inconnu';
  }
}

    openFileUpload(): void {
    // Déclencher le clic sur l'input file caché
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  getPriorityBarHtml(priority: 'elevee' | 'moyen' | 'faible'): string {
    const priorityConfig = {
      elevee: { 
        label: 'Élevée', 
        class: 'elevee',
        ariaLabel: 'Priorité élevée - Niveau 3 sur 3'
      },
      moyen: { 
        label: 'Moyen', 
        class: 'moyen',
        ariaLabel: 'Priorité moyenne - Niveau 2 sur 3'
      },
      faible: { 
        label: 'Faible', 
        class: 'faible',
        ariaLabel: 'Priorité faible - Niveau 1 sur 3'
      }
    };

    const config = priorityConfig[priority] || priorityConfig.moyen;

    return `
      <div class="priority-container">
        <div class="priority-bar ${config.class}" 
             role="progressbar" 
             aria-label="${config.ariaLabel}"
             title="${config.label}">
        </div>
        <span class="priority-label ${config.class}">${config.label}</span>
      </div>
    `;
  }

}