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


@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule ,
    MatGridListModule, MatButtonModule, ImpactCardComponent],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {

  incident: Incident | undefined
  prevCommentaire : string = ''

  constructor(
    private incidentService: IncidentService,
    private dialog: MatDialog,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {

    const id = this.route.snapshot.params['id'];

    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incident = incident;
      this.prevCommentaire = this.incident.comments || ''
    });
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
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const {impact, process} = result
        if (this.incident)
          this.incidentService.addImpact(impact, process, this.incident.id).subscribe(
            _ => {
              alert("Impact ajouté");
              this.ngOnInit();
            }
          )
      }
    });
    // open dialog to add a new impact 
  }

  hasChange(){
    if(this.incident){
      return this.prevCommentaire !== this.incident.comments
    }
    return false;
  }

  isNotClosed(){
    if(this.incident){
      return this.incident.closedAt == null
    }
    return false
  }

  updateCommentaire(){
    if(this.incident){
      this.incidentService.updateCommentaire(this.incident.id, this.incident.comments).subscribe(
        _ => alert("commentaire mis à jour")
      )
    }
  }

  close(){
    if(this.incident){
      this.incidentService.close(this.incident.id).subscribe(
        _ => {
          alert("incident cloturé")
          this.ngOnInit();
        }
      )
    }
  }
}
