import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActionPlanService } from '../../core/services/action-plan/action-plan.service';
import { GoBackButton, GoBackComponent } from '../../shared/components/go-back/go-back.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Action, ActionPlan } from '../../core/models/ActionPlan';
import { Priority } from '../../core/enum/Priority';
import { Status } from '../../core/enum/status.enum';
import { firstValueFrom } from 'rxjs';
import { TargetType } from '../../core/enum/targettype.enum';
import { FileService } from '../../core/services/file/file.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmService } from '../../core/services/confirm/confirm.service';
import { SnackBarService } from '../../core/services/snack-bar/snack-bar.service';
import { AddActionDialogComponent } from '../../features/action-plan/add-action-dialog/add-action-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuditService } from '../../core/services/audit/audit.service';
import { MatDrawer } from '@angular/material/sidenav';
import { AuditButtonComponent } from '../../shared/components/audit/audit-button/audit-button.component';
import { HasPermissionDirective } from "../../core/directives/has-permission.directive";
import { TimelineActionPlanComponent } from '../../shared/components/timeline-action-plan/timeline-action-plan.component';

@Component({
  selector: 'app-plan-action-page-detail',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, DatePipe, TimelineActionPlanComponent,
    MatGridListModule, MatButtonModule, MatFormFieldModule, MatTabsModule, AuditButtonComponent,
    MatInputModule, GoBackComponent, MatTooltipModule, CommonModule, MatProgressBarModule, HasPermissionDirective],
  templateUrl: './plan-action-page-detail.component.html',
  styleUrl: './plan-action-page-detail.component.scss'
})
export class PlanActionPageDetailComponent implements OnInit {

  @ViewChild('auditDrawer') auditDrawer!: MatDrawer;

  today: Date = new Date();
  intervalId?: any;

  private actionPlanService = inject(ActionPlanService);
  private route = inject(ActivatedRoute);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private fileService = inject(FileService);
  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService)
  private auditService = inject(AuditService);
  private dataChangedListener: any;

  actionPlan: ActionPlan | null = null;
  idPlanAction: string = this.route.snapshot.params['id'];

  progressionPercent: number = 0;
  completedActions: number = 0;
  totalActions: number = 0;

  validator: string = '';

  goBackButtons: GoBackButton[] = []

  statusEnum = Status;
  targetTypeEnum = TargetType;

  abandonedActions: Action[] = []
  actions: Action[] = []


  ngOnInit() {
    this.getActionPlan(this.idPlanAction);
    this.dataChangedListener = () => {
      this.ngOnInit();
    };
    window.addEventListener('dataChanged', this.dataChangedListener);
  }

  isNotStarted() {
    return this.actionPlan && this.actionPlan.status == Status.NOT_STARTED || false;
  }

  getActionPlan(id: string) {
    this.actionPlanService.getActionPlan(id).subscribe(resp => {
      this.actionPlan = resp;

      // Todo: métriques doivent être calculées côté backend
      if (this.actionPlan?.actions?.length) {
        this.totalActions = this.actionPlan.actions.filter(a => a.actif == true).length;
        this.completedActions = this.getCompletedCount(this.actionPlan.actions);
        this.progressionPercent = this.getCompletionRate(this.actionPlan.actions);
      }

      this.actions = this.actionPlan.actions.filter(a => a.actif == true);

      // TODO : récupérer les actions abandonnées
      this.abandonedActions = this.actionPlan.actions.filter(a => a.actif == false);

      // règles d’affichage
      const st = this.actionPlan?.status;

      const canStart = st === Status.NOT_STARTED;

      const canEnd =
        st !== Status.ACHIEVED &&
        st !== Status.NOT_STARTED &&
        st !== (Status as any).CANCELLED

      this.goBackButtons = [
        {
          label: 'Exporter',
          icon: 'file_download',
          class: 'btn-green',
          show: true,
          action: () => this.export()
        },
        {
          label: 'Démarrer',
          icon: 'play_arrow',
          class: 'btn-purple',
          show: !!canStart,
          permission: { teamId: this.actionPlan?.teamId, permissions: ['UPDATE_ACTION_PLAN'] },
          action: () => this.startActionPlan()
        },
        {
          label: 'Terminer',
          icon: 'check',
          class: 'btn-primary',
          show: !!canEnd,
          permission: { teamId: this.actionPlan?.teamId, permissions: ['UPDATE_ACTION_PLAN'] },
          action: () => this.endActionPlan()
        }
      ];
    });
  }

  openAddActionDialog() {
    this.dialog.open(AddActionDialogComponent,
      {
        width: '800px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        panelClass: 'custom-dialog-container',
        data: {
          actionPlanId: this.actionPlan?.id
        }
      }
    ).afterClosed().subscribe(result => {
      if (result) {
        this.ngOnInit();
      }
    });
  }

  canAbandonAction(action: Action) {
    return action.performedAt == null && this.actionPlan?.status == Status.NOT_STARTED;
  }

  validateAction(actionId: string) {
    if (this.actionPlan) {
      this.auditService.openAuditDialog(this.actionPlan.id, TargetType.ACTION_PLAN)
        .afterClosed()
        .subscribe(result => {
          if (result) {
            this.actionPlanService.finishAction(actionId).subscribe(
              _ => this.ngOnInit()
            )
          }
          else {
            this.snackBarService.info("Action non-abandonnée.")
          }
        })
    }
  }

  abandon(action: Action) {
    if (this.actionPlan) {
      this.auditService.openAuditDialog(this.actionPlan.id, TargetType.ACTION_PLAN)
        .afterClosed()
        .subscribe(result => {
          if (result) {
            this.actionPlanService.abandonAction(action.id).subscribe(
              _ => {
                this.snackBarService.info("Action abandonnée avec succès.")
                this.ngOnInit();
              }
            )
          }
          else {
            this.snackBarService.info("Action non-abandonnée.")
          }
        })
    }
  }

  getCompletedCount(actions: Action[]): number {
    return actions.filter(a => a.actif && a.performedAt).length;
  }

  getCompletionRate(actions: Action[]): number {
    return actions.length ? Math.round((this.getCompletedCount(actions) / actions.filter(a => a.actif == true).length) * 100) : 0;
  }

  getReadableStatut(status: Status): string {
    switch (status) {
      case Status.NOT_STARTED:
        return 'Non commencé';
      case Status.IN_PROGRESS:
        return 'En cours';
      case Status.ACHIEVED:
        return 'Clôturé';
      default:
        return 'Inconnu';
    }
  }

  async viewFiles(actionId: string, closed: boolean = false) {
    var targetType = this.actionPlan?.incidentId ? TargetType.ACTION_PLAN_FROM_INCIDENT : TargetType.ACTION_PLAN;
    let files = await firstValueFrom(this.fileService.getFiles(targetType, actionId))

    this.fileService.openFiles(files, targetType, actionId).afterClosed().subscribe(result => {
      if (!closed && result) {
        this.confirmService.openConfirmDialog("Fichier uploadé avec succès", "Voulez-vous cloturer l'action ?", true).subscribe(
          result => {
            if (result) {
              this.validateAction(actionId);
            }
          }
        )
      }
    });
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

  export() {
  }

  startActionPlan() {
    if (this.actionPlan && this.actionPlan.status === Status.NOT_STARTED) {
      this.actionPlanService.startActionPlan(this.actionPlan.id!).subscribe(
        _ => {
          this.snackBarService.success("Le plan d'action a bien été démarré, vous pouvez commencer à réaliser les actions.");
          this.ngOnInit()
        }
      )
    }
  }

  endActionPlan() {
    if (this.actionPlan == null) {
      return;
    }
    if (this.actionPlan.actions.filter(a => a.actif).filter(a => a.performedAt == null).length > 0) {
      this.snackBarService.error("Vous ne pouvez pas cloturer un plan d'action tant qu'il reste des actions non terminées.");
      return;
    }
    if (this.actionPlan && this.actionPlan.status !== Status.ACHIEVED && this.actionPlan.status !== Status.NOT_STARTED) {
      this.actionPlanService.endActionPlan(this.actionPlan.id!).subscribe(
        _ => {
          this.snackBarService.success("Le plan d'action a bien été cloturé.");
          this.ngOnInit()
        }
      )
    }
  }

  goToIncident() {
    this.router.navigate([`/incident/${this.actionPlan?.incidentId}`]);
  }

  goToRisk() {
    this.router.navigate(['reglages', 'risks', this.actionPlan?.riskId]);
  }

  openAuditPanel() {
    if (this.auditDrawer.opened) {
      this.auditDrawer.close();
    }
    else {
      this.auditDrawer.open();
    }
  }

}