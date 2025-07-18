import { Component, inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { Incident } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateImpactPopUpComponent } from '../create-impact-pop-up/create-impact-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { ImpactCardComponent } from '../impact-card/impact-card.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { Impact, ImpactCreateDto } from '../../../core/models/Impact';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { SuiviIncidentService } from '../../../core/services/suivi-incident/suivi-incident.service';
import { SuiviIncident } from '../../../core/models/SuiviIncident';
import { HttpClient } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FichiersComponent } from "../../../shared/components/fichiers/fichiers.component";
import { State } from '../../../core/enum/state.enum';
import { RiskCategoryService } from '../../../core/services/risk/risk-category.service';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { CreateActionPlanDialogComponent } from '../../action-plan/create-action-plan-dialog/create-action-plan-dialog.component';
import { ImpactService } from '../../../core/services/impact/impact.service';

// Interface pour les fichiers attachés
interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
}

@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, CurrencyPipe, DatePipe,
    MatGridListModule, MatButtonModule, ImpactCardComponent, MatFormFieldModule,
    MatInputModule, GoBackComponent, MatTooltipModule, CommonModule, FichiersComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
})
export class ViewComponent implements OnInit {
  private incidentService = inject(IncidentService);
  private impactService = inject(ImpactService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private suiviIncidentService = inject(SuiviIncidentService);
  private entitiesService = inject(EntitiesService);

  incident: Incident | undefined
  totalAmount = 0;
  userRole: string | undefined;
  userTeam: string | undefined;
  username: string | undefined;
  canClose: boolean = false;
  message: string = "";
  idIncident: string = "";
  suivi: SuiviIncident[] = []

  // Propriétés pour la gestion des fichiers
  attachedFiles: AttachedFile[] = [];
  isDragOver = false;

  businessUnits: EntiteResponsable[] = [];

  ngOnInit(): void {
    this.entitiesService.loadEntities().subscribe(entities => {
      this.businessUnits = entities;
    });
    this.idIncident = this.route.snapshot.params['id'];
    this.loadIncident(this.idIncident);
    this.suiviIncidentService.getSuiviIncidentById(this.idIncident).subscribe(
      (res) => {
        this.suivi = res;
      },
      (err) => {
        console.error("Erreur lors du chargement du suivi de l'incident :", err);
      }
    );
    this.message = "";
  }

  loadIncident(id: string): void {
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incident = incident;
      this.extractTokenInfo();
      this.checkCloseAuthorization();
    });


    this.impactService.sum(id).subscribe(
      result => this.totalAmount = result
    )
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
    // this.userTeam = payload.roles?.[0]?.team_id;
    this.username = payload.username;

  }

  checkCloseAuthorization(): void {
    this.canClose = this.userRole === 'VALIDATEUR';
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

  addImpact() {
    const dialogRef = this.dialog.open(CreateImpactPopUpComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: Impact) => {
      if (result && this.incident) {
        /* ─── Construction explicite du DTO ─── */
        const dto: ImpactCreateDto = {
          montant: result.montant,
          comptabilisationDate: result.comptabilisationDate ? result.comptabilisationDate : null,
          entityId: result.entityId,      // ou result.entiteResponsableId
          incidentId: this.incident.id,     // ← lier à l’incident courant
          type: result.type,          // enum/chaine côté back
          message: result.message ?? ''  // commentaire optionnel
        };


        this.impactService.addImpact(dto).subscribe(() => {
          this.confirmService.openConfirmDialog(
            'Impact ajouté',
            "L'impact a bien été ajouté à l'incident",
            false
          );
          this.ngOnInit();     // rafraîchir la vue
        });
      }
    });
  }

  isNotClosed() {
    if (this.incident) {
      return this.incident.closedAt == null
    }
    return false
  }

  accessSuivi() {
    this.router.navigate(['incident', this.incident?.id, 'suivi'])
  }

  sendMessage() {
    if (this.incident && this.username) {
      this.suiviIncidentService.addSuiviIncident(this.message, this.incident.id, this.username).subscribe(
        () => {
          this.confirmService.openConfirmDialog("Message envoyé", "Le message a bien été envoyé", false);
          this.ngOnInit();
        });
    }
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
        width: '400px',
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

}