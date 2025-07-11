import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionPlanService } from '../../core/services/action-plan/action-plan.service';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Action, ActionPlan } from '../../core/models/ActionPlan';
import { AuthService } from '../../core/services/auth/auth.service';
import { EquipeService } from '../../core/services/equipe/equipe.service';
import { Priority } from '../../core/enum/Priority';
import { Status } from '../../core/enum/status.enum';

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
  private equipeService = inject(EquipeService);

  actionPlan: ActionPlan | null = null;
  idPlanAction: string = this.route.snapshot.params['id'];

  progressionPercent: number = 0;
  completedActions: number = 0;
  totalActions: number = 0;

  validator: string = '';

  ngOnInit() {
    this.getActionPlan(this.idPlanAction);
  }

  getActionPlan(id: string) {
    this.actionPlanService.getActionPlan(id).subscribe(
      resp => {
        this.equipeService.getById(resp.userInCharge).subscribe(
          team => {
            this.actionPlan = resp;
            this.actionPlan.userInCharge = team.name;
            if (this.actionPlan?.actions?.length) {
              this.totalActions = this.actionPlan.actions.length;
              this.completedActions = this.getCompletedCount(this.actionPlan.actions);
              this.progressionPercent = this.getCompletionRate(this.actionPlan.actions);
              this.updateStatus();
            }
          }
        );

      }
    )
  }

  validateAction(action: Action, event: Event) {
    // TODO : envoyer le file au back + valide action
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      action.fileName = file.name;
      action.performedBy = this.authService.decryptToken()?.sub || "";
      action.performedAt = new Date().toISOString();

      // 🔁 Recalculer les valeurs après validation
      if (this.actionPlan?.actions) {
        this.completedActions = this.getCompletedCount(this.actionPlan.actions);
        this.progressionPercent = this.getCompletionRate(this.actionPlan.actions);
        this.updateStatus();
      }
    }
  }

  getCompletedCount(actions: Action[]): number {
    return actions.filter(a => a.performedAt).length;
  }

  getCompletionRate(actions: Action[]): number {
    return actions.length ? Math.round((this.getCompletedCount(actions) / actions.length) * 100) : 0;
  }

  updateStatus() {
    const completed = this.completedActions;
    const total = this.totalActions;

    if (total === 0) {
      this.actionPlan!.status = Status.NOT_ACHIEVED;
    } else if (completed === 0) {
      this.actionPlan!.status = Status.NOT_ACHIEVED;
    } else if (completed === total) {
      this.actionPlan!.status = Status.ACHIEVED;
    } else {
      this.actionPlan!.status = Status.IN_PROGRESS;
    }
  }

  getReadableStatut(status: Status): string {
    switch (status) {
      case Status.NOT_STARTED:
        return 'Non commencé';
      case Status.NOT_ACHIEVED:
        return 'Non réalisé';
      case Status.IN_PROGRESS:
        return 'En cours';
      case Status.ACHIEVED:
        return 'Clôturé';
      case Status.NOT_ACHIEVED:
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

  getPriorityBarHtml(priority: Priority): string {
    const priorityConfig = {
      [Priority.MAXIMUM]: {
        label: 'Élevée',
        class: 'elevee',
        ariaLabel: 'Priorité élevée - Niveau 3 sur 3'
      },
      [Priority.MEDIUM]: {
        label: 'Moyen',
        class: 'moyen',
        ariaLabel: 'Priorité moyenne - Niveau 2 sur 3'
      },
      [Priority.MINIMAL]: {
        label: 'Faible',
        class: 'faible',
        ariaLabel: 'Priorité faible - Niveau 1 sur 3'
      }
    };

    const config = priorityConfig[priority] || priorityConfig[Priority.MEDIUM];

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