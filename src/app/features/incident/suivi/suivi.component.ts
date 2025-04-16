import { Component, inject, OnInit } from '@angular/core';
import { GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { ActivatedRoute } from '@angular/router';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { Incident } from '../../../core/models/Incident';

@Component({
  selector: 'app-suivi',
  imports: [GoBackComponent],
  templateUrl: './suivi.component.html',
  styleUrl: './suivi.component.scss'
})
export class SuiviComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private incidentService = inject(IncidentService);

  incident: Incident | undefined

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incident = incident;
    }
    );
  }

}
