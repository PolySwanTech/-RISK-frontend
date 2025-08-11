import { DatePipe, CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { SuiviIncidentService } from '../../../../core/services/suivi-incident/suivi-incident.service';
import { IncidentHistory } from '../../../../core/models/IncidentHistory';
import { ConfirmService } from '../../../../core/services/confirm/confirm.service';

@Component({
  selector: 'app-list-suivi',
  imports: [MatCardModule, MatListModule, MatIconModule, FormsModule, DatePipe,
    MatGridListModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatTooltipModule, CommonModule],
  templateUrl: './list-suivi.component.html',
  styleUrl: './list-suivi.component.scss'
})
export class ListSuiviComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private suiviService = inject(SuiviIncidentService);
  private confirmService = inject(ConfirmService);

  @Input() closed: boolean = false;

  suivis: IncidentHistory[] = []
  message : string = '';

  incidentId = this.route.snapshot.paramMap.get('id') || '';

  ngOnInit(): void {
    this.getSuivi();
  }

  getSuivi() {
    this.suiviService.getLatestSuiviIncidentById(this.incidentId).subscribe({
      next: (data) => {
        this.suivis = data;
      },
      error: (err) => {
        alert("Une erreur est survenue lors de la récupération des suivis.");
      }
    });
  }

  sendMessage() {
    if (this.incidentId) {
      this.suiviService.addSuiviIncident(this.message, this.incidentId).subscribe(
        () => {
          this.confirmService.openConfirmDialog("Message envoyé", "Le message a bien été envoyé", false);
          this.ngOnInit();
        });
    }
  }

  accessSuivi() {
    this.router.navigate(['incident', this.incidentId, 'suivi'])
  }

}
