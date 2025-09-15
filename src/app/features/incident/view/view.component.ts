import { Component, inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { Incident } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GoBackButton, GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { CommonModule, DatePipe } from '@angular/common';
import { SuiviIncident } from '../../../core/models/SuiviIncident';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FichiersComponent } from "../../../shared/components/fichiers/fichiers.component";
import { State } from '../../../core/enum/state.enum';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { CreateActionPlanDialogComponent } from '../../action-plan/create-action-plan-dialog/create-action-plan-dialog.component';
import { ListSuiviComponent } from '../suivi/list-suivi/list-suivi.component';
import { firstValueFrom } from 'rxjs';
import { OperatingLossService } from '../../../core/services/operating-loss/operating-loss.service';
import { saveAs } from 'file-saver';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { OperatingLoss } from '../../../core/models/OperatingLoss';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';


type ImpactRow = {
  bl: string;
  brut: number;
  net: number; 
  final: number;
  nonFinancialLabels: string[];
};

@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, DatePipe,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, GoBackComponent, MatTooltipModule, CommonModule,
    FichiersComponent, ListSuiviComponent, MatTableModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})

export class ViewComponent implements OnInit {

  private incidentService = inject(IncidentService);
  private actionPlanService = inject(ActionPlanService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private entitiesService = inject(EntitiesService);
  private impactService = inject(OperatingLossService);


  incident: Incident | undefined
  userRole: string | undefined;
  userTeam: string | undefined;
  message: string = "";
  idIncident: string = "";
  suivi: SuiviIncident[] = []

  businessUnits: BusinessUnit[] = [];

  goBackButtons: GoBackButton[] = [];

  operatingLosses: OperatingLoss[] = [];

  impactRows: ImpactRow[] = [];
  impactDataSource = new MatTableDataSource<ImpactRow>([]);


  
  columns = [
  {
    columnDef: 'bl',
    header: 'Business Line',
    cell: (row: ImpactRow) => row.bl,
    filterType: 'text',
    icon: 'business'
  },
  {
    columnDef: 'brut',
    header: 'Montant brut',
    cell: (row: ImpactRow) => row.brut,
    type: 'currency',
    icon: 'euro'
  },
  {
    columnDef: 'net',
    header: 'Montant net',
    cell: (row: ImpactRow) => row.net,
    type: 'currency',
    icon: 'euro'
  },
  {
    columnDef: 'final',
    header: 'Montant final',
    cell: (row: ImpactRow) => row.final,
    type: 'currency',
    icon: 'euro'
  },
  {
    columnDef: 'nonFinancial',
    header: 'Impacts non financiers',
    cell: (row: ImpactRow) => row.nonFinancialLabels.join(', ') || '—',
    filterType: 'text',
    icon: 'tips_and_updates'
  }
];
displayedImpactColumns = this.columns.map(c => c.columnDef);


  ngOnInit(): void {
    this.entitiesService.loadEntities().subscribe(entities => {
      this.businessUnits = entities;
    });
    this.idIncident = this.route.snapshot.params['id'];
    this.loadIncident(this.idIncident)

  if (this.idIncident) {
    this.impactService.listByIncident(this.idIncident).subscribe(result => {
    this.operatingLosses = result;
    this.impactRows = this.buildImpactRows(this.operatingLosses);
    this.impactDataSource.data = this.impactRows;
  });
}

  }

  async loadIncident(id: string) {
    this.incident = await firstValueFrom(this.incidentService.getIncidentById(id));
    this.extractTokenInfo();
    this.goBackButtons = [
      {
        label: "Plan d'action",
        icon: 'playlist_add_check',
        class: 'btn-primary',
        show: this.canShowActions() && !this.isDraft(),
        action: () => this.addActionPlan()
      },
      {
        label: "Modifier",
        icon: 'edit',
        class: 'btn-green',
        show: this.canShowActions(),
        action: () => this.goToModification()
      },
      {
        label: "Supprimer",
        icon: 'delete',
        class: 'btn-red',
        show: this.isDraft(),
        action: () => this.delete()
      },
      {
        label: 'Fiche Incident (PDF)',
        icon: 'description',
        class: 'btn-green',
        show: !this.isDraft(),
        action: () => this.downloadPDF() 
      },
      {
        label: 'Clôturer',
        icon: 'lock',
        class: 'btn-red',
        show: this.canClose(),
        action: () => this.closeIncident()
      },

    ];
  }

  canShowActions(): boolean {
    return this.incident?.state !== State.VALIDATE && this.incident?.state !== State.CLOSED;
  }

  isDraft(): boolean {
    return this.incident?.state === State.DRAFT;
  }

  goToModification(): void {
    if (this.incident) {
      this.router.navigate(['incident', 'create'], { queryParams: { id: this.incident.id } });
    }
  }

  delete() {
    this.confirmService.openConfirmDialog("Confirmer la suppression", "Êtes-vous sûr de vouloir supprimer cet incident ? Cette action est irréversible.", true).subscribe(result => {
      if (result) {
        this.incidentService.deleteIncident(this.incident!.id).subscribe(() => {
          this.router.navigate(['incident']);
        });
      }
    });
  }

  extractTokenInfo(): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.warn("Aucun token trouvé");
      return;
    }

    const base64Payload = token.split('.')[1];
    const jsonPayload = new TextDecoder().decode(
      Uint8Array.from(atob(base64Payload), c => c.charCodeAt(0))
    );
    const payload = JSON.parse(jsonPayload);
    this.userRole = payload.roles?.[0]?.role_name;
  }

  canClose() {
    return this.incident?.state != State.DRAFT && this.incident?.closedAt == null;
  }

  normalize(str?: string): string {
    return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || '';
  }

  getState() {
    if (this.incident) {
      return State[this.incident.state.toString() as keyof typeof State]
    }
    return "Inconnu"
  }

  changeStatus(): void {
    if (this.incident) {
      switch (this.incident.state) {
        case State.DRAFT:
          this.incident.state = State.VALIDATE;
          break;
        case State.VALIDATE:
          this.incident.state = State.PROCESS;
          break;
        case State.PROCESS:
          this.incident.state = State.CLOSED;
          break;
        case State.CLOSED:
          this.confirmService.openConfirmDialog("Incident déjà clôturé", "L'incident est déjà clôturé, vous ne pouvez pas changer son état.", true);
      }
    }
  }


private toNumber(v: any): number {
  const n = typeof v === 'number' ? v : (v == null ? 0 : Number(v));
  return Number.isFinite(n) ? n : 0;
}

// “Financier” si au moins un montant est présent
private isFinancial(loss: OperatingLoss): boolean {
  return !!(this.toNumber((loss as any).montantBrut) ||
            this.toNumber((loss as any).montantNet)  ||
            this.toNumber((loss as any).montantFinal));
}

// Libellé d’un impact non financier
private impactLabel(loss: OperatingLoss): string {
  return (loss as any).label || (loss as any).libelle || (loss as any).description || 'Impact';
}

private buildImpactRows(losses: OperatingLoss[]): ImpactRow[] {
  const byBL = new Map<string, ImpactRow>();

  for (const loss of losses ?? []) {
    const bl = (loss as any).entityName || (loss as any).businessLine || 'Non assigné';
    if (!byBL.has(bl)) {
      byBL.set(bl, { bl, brut: 0, net: 0, final: 0, nonFinancialLabels: [] });
    }
    const row = byBL.get(bl)!;

    if (this.isFinancial(loss)) {
      row.brut += this.toNumber((loss as any).montantBrut);
      row.net   += this.toNumber((loss as any).montantNet);
      row.final += this.toNumber((loss as any).montantFinal);
    } else {
      row.nonFinancialLabels.push(this.impactLabel(loss));
    }
  }

  return Array.from(byBL.values()).sort((a, b) => a.bl.localeCompare(b.bl));
}



  isClosed() {
    return this.incident!.closedAt !== null || false;
  }

  downloadExport(): void {
    if (!this.incident?.id) return;
    this.incidentService.downloadExport(this.incident.id);
  }

  closeIncident(): void {
    if (!this.incident?.id) return;

    this.incidentService.close(this.incident.id).subscribe(() => {
      this.confirmService.openConfirmDialog("Clôturé", "L'incident a été clôturé.", false);
      this.ngOnInit();
    });
  }

  addActionPlan() {
    if (this.incident == null) {
      return;
    }

    this.actionPlanService.getActionPlanByIncident(this.incident.id).subscribe(
      {
        next: actionPlan => {
          if (actionPlan) {
            this.confirmService.openConfirmDialog("Plan d'action existant", "Un plan d'action existe déjà pour cet incident.", true).subscribe(
              value => {
                if (value) {
                  this.router.navigate(['action-plan', actionPlan.id]);
                }
              }
            );
          }
        },
        error: _ => {
          this.confirmService.openConfirmDialog("Créer un plan d'action", "Voulez-vous créer un plan d'action pour cet incident ?", true).subscribe(
            value => {
              if (value) {
                if (this.incident) {
                  this.dialog.open(CreateActionPlanDialogComponent, {
                    width: '800px !important',
                    height: '550px',
                    minWidth: '800px',
                    maxWidth: '800px',
                    data: {
                      incidentId: this.incident.id,
                      reference: this.incident.reference
                    }
                  })
                }
              }
            }
          );
        }
      });
  }

  getLineColor(from: Date | string, to: Date | string): string {
    const date1 = new Date(from);
    const date2 = new Date(to);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return 'green';
    } else if (diffDays < 60) {
      return 'orange';
    } else {
      return 'red';
    }
  }

  getDaysDiff(from: Date | string, to: Date | string): number {
    const date1 = new Date(from);
    const date2 = new Date(to);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  addImpact() {
    this.router.navigate(['incident', this.idIncident, 'impacts']);
  }

  downloadPDF(): void {
    if (!this.incident?.id) return;
    this.incidentService.downloadPDF(this.incident.id).subscribe({
      next: (blob) => {
        const ref = this.incident?.reference ?? this.incident?.id;
        const pdf = new Blob([blob], { type: 'application/pdf' });
        saveAs(pdf, `FICHE_INCIDENT_${ref}.pdf`);
      },
      error: (err) => console.error('Erreur export PDF :', err)
    });
  }

  totalAmount(): number {
    return this.operatingLosses.reduce((sum, loss) => sum + loss.montantFinal, 0);
  }

}