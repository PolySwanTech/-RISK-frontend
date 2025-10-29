import { Component, Inject, inject, OnInit } from '@angular/core';
import { Action, ActionPlan, ActionPlanCreateDto } from '../../../core/models/ActionPlan';
import { MatFormFieldModule, MatSuffix } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { Priority } from '../../../core/enum/Priority';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Status } from '../../../core/enum/status.enum';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { RiskService } from '../../../core/services/risk/risk.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { EnumLabelPipe } from '../../../shared/pipes/enum-label.pipe';
import { BasePopupComponent, PopupAction } from '../../../shared/components/base-popup/base-popup.component';

@Component({
  selector: 'app-create-action-plan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSuffix,
    MatTooltipModule,
    EnumLabelPipe,
    BasePopupComponent
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
  popupActions: PopupAction[] = [];
  listTeams: BusinessUnit[] = [];
  risks: RiskTemplate[] = [];
  actions: Action[] = [];

  actionPlan: ActionPlan = new ActionPlan(
    '', '', '', '', Status.NOT_STARTED, Priority.MAXIMUM,
    '', '', '', null, '', new Date(), true
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: { incidentId: string, reference: string }) { }

  ngOnInit(): void {
    this.fetchTeams();
    this.getRisk();
    this.initActions();
  }

  initActions(): void {
    this.popupActions = [
      {
        label: 'Annuler',
        icon: 'close',
        color: 'red',
        onClick: () => this.closePopup()
      },
      {
        label: 'Créer le Plan d\'Action',
        icon: 'check',
        primary: true,
        disabled: () => this.isFormInvalid(),
        onClick: () => this.submitActionPlan()
      }
    ];
  }

  getDialogRef() {
    return this.dialogRef;
  }

  closePopup() {
    this.dialogRef.close();
  }

  getRisk() {
    if (this.data && this.data.incidentId) {
      this.riskService.getRiskOfIncident(this.data.incidentId).subscribe(risk => {
        this.actionPlan.taxonomie = risk;
        this.risks = [risk];
      });
    } else {
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

  addAction() {
    this.actions.push(new Action('', '', new Date(), '', '', ''));
  }

  removeAction(index: number) {
    this.actions.splice(index, 1);
  }

  submitActionPlan() {
    if (this.isFormInvalid()) return;

    const incidentId = this.data?.incidentId ?? undefined;

    const dto: ActionPlanCreateDto = {
      libelle: this.actionPlan.libelle,
      description: this.actionPlan.description,
      status: this.actionPlan.status,
      priority: this.actionPlan.priority,
      echeance: this.actionPlan.echeance,
      userInCharge: this.actionPlan.userInCharge,
      taxonomieId: this.actionPlan.taxonomie?.id ?? null,
      incidentId
    };

    this.actionPlanService.createActionPlan(dto)
      .subscribe(id => {
        this.actionPlanService.addActions(this.actions, id).subscribe(() => {});
        this.dialogRef.close();
        this.confirmService.openConfirmDialog(
          "Création avec succès", "Aller à la consultation ?"
        ).subscribe((value) => {
          value ? this.router.navigate(['/action-plan', id]) : this.ngOnInit();
        });
      });
  }

  isFormInvalid(): boolean {
    return (
      !this.actionPlan.libelle ||
      !this.actionPlan.description ||
      !this.actionPlan.echeance ||
      !this.actionPlan.priority ||
      !this.actionPlan.userInCharge ||
      !this.actionPlan.taxonomie ||
      this.actions.length === 0 ||
      this.actions.some(a => !a.name || a.name.trim() === '')
    );
  }
}