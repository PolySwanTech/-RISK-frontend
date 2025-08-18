import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
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
import { ListImpactComponent } from '../impact/list-impact/list-impact.component';
import { ListSuiviComponent } from '../suivi/list-suivi/list-suivi.component';
import { firstValueFrom } from 'rxjs';
import { ImpactService } from '../../../core/services/impact/impact.service';


@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, DatePipe,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, GoBackComponent, MatTooltipModule, CommonModule,
    FichiersComponent, ListSuiviComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  // providers: [
  //   { provide: LOCALE_ID, useValue: 'fr' }
  // ]
})
export class ViewComponent implements OnInit {
  private incidentService = inject(IncidentService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private entitiesService = inject(EntitiesService);
  private impactService = inject(ImpactService);

  incident: Incident | undefined
  userRole: string | undefined;
  userTeam: string | undefined;
  message: string = "";
  idIncident: string = "";
  suivi: SuiviIncident[] = []

  businessUnits: BusinessUnit[] = [];

  goBackButtons: GoBackButton[] = [];

  totalAmount = 0;

  ngOnInit(): void {
    this.entitiesService.loadEntities().subscribe(entities => {
      this.businessUnits = entities;
    });
    this.idIncident = this.route.snapshot.params['id'];
    this.loadIncident(this.idIncident)

    if (this.idIncident) {
      this.impactService.sum(this.idIncident).subscribe(
        result => this.totalAmount = result
      )
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
        show: !this.isClosed(),
        action: () => this.addActionPlan()
      },
      {
        label: 'Exporter',
        icon: 'file_download',
        class: 'btn-green',
        show: true,
        action: () => this.downloadExport()
      },
      {
        label: 'Clôturer',
        icon: 'lock',
        class: 'btn-red',
        show: this.canClose(),
        action: () => this.closeIncident()
      }
    ];
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
    return this.userRole === 'VALIDATEUR' && this.incident?.closedAt == null;
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

    let choice = confirm("Créer un plan d'action ou consulter un plan d'action existant ?")
    if (choice) {
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
    else {
      this.router.navigate(['action-plan', 'create', this.incident.id]);
    }
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

}