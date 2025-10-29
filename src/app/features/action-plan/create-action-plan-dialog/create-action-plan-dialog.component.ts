import { Component, Inject, inject, OnInit } from '@angular/core';
import { ActionPlan, ActionPlanCreationDto } from '../../../core/models/action-plan/ActionPlan';
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { Priority, PriorityLabels } from '../../../core/enum/Priority';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { RiskService } from '../../../core/services/risk/risk.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { PopupHeaderComponent } from '../../../shared/components/popup-header/popup-header.component';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { ActionCreationDto } from '../../../core/models/action-plan/Action';
import { ReviewStatus } from '../../../core/enum/reviewStatus.enum';

@Component({
  selector: 'app-create-action-plan-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    PopupHeaderComponent,
    FormsModule, MatButtonModule, ReactiveFormsModule, MatIconModule, MatSuffix, MatTooltipModule
  ],
  templateUrl: './create-action-plan-dialog.component.html',
  styleUrl: './create-action-plan-dialog.component.scss'
})
export class CreateActionPlanDialogComponent implements OnInit {

  private actionPlanService = inject(ActionPlanService);
  dialogRef = inject(MatDialogRef<CreateActionPlanDialogComponent>);
  private confirmService = inject(ConfirmService);
  private entitiesService = inject(EntitiesService);
  private riskService = inject(RiskService);
  private router = inject(Router);
  priorities = Object.values(Priority);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { incidentId: string, reference: string }
  ) { }

  listTeams: BusinessUnit[] = [];

  risks: RiskTemplate[] = [];

  actionPlan: ActionPlan | null = null;

  actions: ActionCreationDto[] = []

  ngOnInit(): void {
    this.fetchTeams();
    this.getRisk();
  }

  closePopup() {
    this.dialogRef.close();
  }

  getRisk() {
    if (!this.actionPlan) return
    if (this.data && this.data.incidentId) {
      // Récupère le risque de l'incident
      this.riskService.getRiskOfIncident(this.data.incidentId).subscribe(risk => {
        this.actionPlan!.risk = risk;
        // Ici, on met à jour la liste des risques pour afficher l'élément de l'incident
        this.risks = [risk]; // Si tu veux que la liste contienne uniquement ce risque
      });
    } else {
      // Si pas d'incident, récupère tous les risques
      this.riskService.getAll().subscribe(data => {
        this.risks = data;
      });
    }
  }


  fetchTeams(): void {
    this.entitiesService.loadEntities().subscribe({
      next: teams => {
        this.listTeams = teams;
      },
      error: err => {
        console.error("Erreur lors du chargement des équipes", err);
      }
    });
  }


  formatPriority(p: Priority): string {
    return PriorityLabels[p] || p;
  }

  // Ajouter une action à la liste
  addAction() {
    let action : ActionCreationDto = {
      actionPlanId : "",
      name : "",
      performedAt : undefined,
      performedBy : undefined,
      actif : true,
      reviewStatus : ReviewStatus.PENDING
    }
    this.actions.push(action);
  }

  updateAction(index: number, action: ActionCreationDto) {
    // Mettre à jour l'action à l'index spécifié
    this.actions[index] = action;
  }

  // Supprimer une action de la liste
  removeAction(index: number) {
    this.actions.splice(index, 1);
  }

  // Soumettre le plan d'action
  submitActionPlan() {
    if (!this.actionPlan) return;
    const incidentId = this.data?.incidentId ?? undefined;

    const dto: ActionPlanCreationDto = {
      libelle: this.actionPlan.libelle,
      description: this.actionPlan.description,
      status: this.actionPlan.status,
      priority: this.actionPlan.priority,
      echeance: this.actionPlan.echeance,
      teamInCharge: this.actionPlan.teamInCharge,
      taxonomieId: this.actionPlan.risk.id ?? null,
      incidentId               // undefined si pas d’incident
    };

    this.actionPlanService.createActionPlan(dto)
      .subscribe(id => {
        this.actionPlanService.addActions(this.actions, id).subscribe(() => {
        });
        this.dialogRef.close();
        this.confirmService.openConfirmDialog(
          "Création avec succès", "Aller à la consultation ?").subscribe((value) => {
            value ? this.router.navigate(['/action-plan', id]) : this.ngOnInit();
          })
      });
  }
}
