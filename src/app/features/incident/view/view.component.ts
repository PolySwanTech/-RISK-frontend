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
import { TeamMemberService } from '../../../core/services/team/team-member.service';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, CurrencyPipe,
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

  incident: Incident | undefined
  prevCommentaire: string = ''
  totalAmount = 0;
  userRole: string | undefined;
  userTeam: string | undefined;
  canClose: boolean = false;

  ngOnInit(): void {
    this.loadIncident();
  }

  loadIncident(): void {
    const id = this.route.snapshot.params['id'];
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      console.log(incident)
      this.incident = incident;
      this.prevCommentaire = incident.comments || '';
      this.extractTokenInfo();
      this.checkCloseAuthorization();
    });

    this.incidentService.sum(id).subscribe(
      result => this.totalAmount = result
    )
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

  updateCommentaire(): void {
    if (this.incident) {
      const message = prompt("Entrez un message pour cette modification :", "Mise à jour du commentaire");
      if (message) {
        this.incidentService.updateCommentaire(this.incident.id, this.incident.comments, message).subscribe(() => {
          alert("Commentaire mis à jour");
          this.ngOnInit();
        });
      }
    }
  }

  accessSuivi(){
    this.router.navigate(['incident', this.incident?.id, 'suivi'])
  }

  close(): void {
    if (this.incident) {
      this.incidentService.close(this.incident.id).subscribe({
        next: () => {
          alert("Incident clôturé avec succès !");
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
