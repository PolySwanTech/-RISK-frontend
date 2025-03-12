import { Component } from '@angular/core';
import { Incident, State } from '../../../core/models/Incident';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { DatePipe } from '@angular/common';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-view',
  imports: [MatCardModule, MatListModule, MatIconModule,
     MatGridListModule, DatePipe, MatButtonModule],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent {

  incident: Incident | undefined

  constructor(private incidentService : IncidentService) {
  }

  ngOnInit(): void {
    this.incidentService.loadIncidents().subscribe((incidents) => {
      this.incident = incidents[0];
    });
  }

  changeStatus(): void {
    // Logic to change the state of the incident
    if(this.incident){
      // this.incident.state = this.incident.state === 'Ouvert' ? State.CLOSED : State.OPEN;
    }
  }

  addImpact(){
    // open dialog to add a new impact 
  }
}
