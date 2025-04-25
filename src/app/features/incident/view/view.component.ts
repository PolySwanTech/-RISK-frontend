import { Component, inject, LOCALE_ID } from '@angular/core';
import { Incident, State } from '../../../core/models/Incident';
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
import { Impact } from '../../../core/models/Impact';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SuiviIncidentService } from '../../../core/services/suivi-incident/suivi-incident.service';
import { SuiviIncident } from '../../../core/models/SuiviIncident';


@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, CurrencyPipe, DatePipe,
    MatGridListModule, MatButtonModule, ImpactCardComponent, MatFormFieldModule, MatInputModule, GoBackComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
})
export class ViewComponent {
  private incidentService = inject(IncidentService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private suiviIncidentService = inject(SuiviIncidentService);

  incident: Incident | undefined
  totalAmount = 0;
  userRole: string | undefined;
  userTeam: string | undefined;
  username: string | undefined;
  canClose: boolean = false;
  message : string = "";
  idIncident: string = "";
  suivi: SuiviIncident[]  = []

  ngOnInit(): void {
    this.idIncident = this.route.snapshot.params['id'];
    this.loadIncident(this.idIncident);
    this.loadSuiviIncident(this.idIncident);
  }

  loadIncident(id : string): void {
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incident = incident;
      this.extractTokenInfo();
      this.checkCloseAuthorization();
    });

    this.incidentService.sum(id).subscribe(
      result => this.totalAmount = result
    )
  }

  loadSuiviIncident(id: string): void {
    this.suiviIncidentService.getSuiviIncidentById(id).subscribe(
      {
        next: (suivi) => {
          this.suivi = suivi;
          console.log(this.suivi)
        },
        error: (error) => {
          console.error("Erreur lors de la récupération des suivis d'incidents :", error);
        }
      }
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
    this.userRole = payload.role;
    this.userTeam = payload.team;
    this.username = payload.username;
  }

  checkCloseAuthorization(): void {
    const normalizedUserTeam = this.normalize(this.userTeam);
    const normalizedIncidentTeam = this.normalize(this.incident?.equipeName);

    this.canClose = this.userRole === 'VALIDATEUR' && normalizedUserTeam === normalizedIncidentTeam;
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

  formatDate(dateString: any) {
    return dateString ? dateString.toLocaleDateString("fr-FR") : null;
  }


  changeStatus(): void {
    // Logic to change the state of the incident
    if (this.incident) {
      this.incident.state = this.incident.state === State.OPEN ? State.CLOSED : State.OPEN;
    }
  }

  addImpact() {
    // Open the Impact Add dialog
    const dialogRef = this.dialog.open(CreateImpactPopUpComponent, {
      width: '400px', // You can adjust the dialog size as needed
    });

    // Wait for the result when the dialog is closed
    dialogRef.afterClosed().subscribe((result: Impact) => {
      if (result) {
        if (this.incident) {
          result.incidentId = this.incident.id
          this.incidentService.addImpact(result).subscribe(
            _ => {
              this.confirmService.openConfirmDialog("Impact ajouté", "L'impact a bien été ajouté à l'incident", false);
              this.ngOnInit();
            }
          )
        }
      }
    });
  }

  isNotClosed() {
    if (this.incident) {
      return this.incident.closedAt == null
    }
    return false
  }

  accessSuivi(){
    this.router.navigate(['incident', this.incident?.id, 'suivi'])
  }

  sendMessage(){
    if(this.incident && this.username){
      this.suiviIncidentService.addSuiviIncident(this.message, this.incident.id, this.username).subscribe(
        () => {
          this.confirmService.openConfirmDialog("Message envoyé", "Le message a bien été envoyé", false);
          this.loadSuiviIncident(this.idIncident);
        });
    }
  }

}
