import { Component } from '@angular/core';
import { Incident, State } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { CreateImpactPopUpComponent } from '../create-impact-pop-up/create-impact-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { ImpactCardComponent } from '../impact-card/impact-card.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GoBackComponent } from "../../../shared/components/go-back/go-back.component";
import { Impact } from '../../../core/models/Impact';
import { TeamMemberService } from '../../../core/services/team/team-member.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule,
    MatGridListModule, MatButtonModule, ImpactCardComponent, MatFormFieldModule, MatInputModule, GoBackComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {

  incident: Incident | undefined
  prevCommentaire: string = ''
  userRole: string | undefined;
  userTeam: string | undefined;
  canClose: boolean = false;


  constructor(
    private incidentService: IncidentService,
    private dialog: MatDialog,
    private route: ActivatedRoute, private teamMemberService: TeamMemberService,
    private router: Router,) {
  }

  ngOnInit(): void {
    this.loadIncident();
  }

  loadIncident(): void {
    const id = this.route.snapshot.params['id'];
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incident = incident;
      this.prevCommentaire = incident.comments || '';
      this.extractTokenInfo();
      this.checkCloseAuthorization();
    });
  }

  extractTokenInfo(): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.warn("⛔ Aucun token trouvé");
      return;
    }

    const base64Payload = token.split('.')[1];
    const jsonPayload = new TextDecoder().decode(
      Uint8Array.from(atob(base64Payload), c => c.charCodeAt(0))
    );
    const payload = JSON.parse(jsonPayload);
    this.userRole = payload.role;
    this.userTeam = payload.team;
  }

  checkCloseAuthorization(): void {
    const normalizedUserTeam = this.normalize(this.userTeam);
    const normalizedIncidentTeam = this.normalize(this.incident?.equipeName);

    this.canClose = this.userRole === 'VALIDATEUR' && normalizedUserTeam === normalizedIncidentTeam;
  }

  normalize(str?: string): string {
    return str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() || '';
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
              alert("Impact ajouté");
              this.ngOnInit();
            }
          )
        }
      }
    });
  }

  noChange() {
    if (this.incident && this.incident.comments) {
      return this.prevCommentaire === this.incident.comments
    }
    return true;
  }

  isNotClosed() {
    if (this.incident) {
      return this.incident.closedAt == null
    }
    return false
  }

  updateCommentaire() {
    if (this.incident) {
      const message = prompt("Entrez un message pour cette modification :", "Mise à jour du commentaire");
      if (message) {
        this.incidentService.updateCommentaire(this.incident.id, this.incident.comments, message).subscribe(
          _ => alert("commentaire mis à jour")
        );
      }
    }
  }

  close() {
    if (this.incident) {
      this.incidentService.close(this.incident.id).subscribe({
        next: () => {
          alert("Incident clôturé avec succès !")
          this.ngOnInit();
        },
        error: (err) => {
          if (err.status === 403) {
            alert("⛔ Vous n’êtes pas autorisé à valider cet incident.");
          } else {
            alert("❌ Une erreur est survenue lors de la clôture de l’incident.");
            console.error(err);
          }
        }
      });
    }
  }

  goToHistory() {
    const id = this.incident?.id;
    if (id) {
      this.router.navigate(['/incident', id, 'history']);
    }
  }

}
