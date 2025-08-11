import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Ajouté
import { GoBackComponent } from '../../../shared/components/go-back/go-back.component';
import { ActivatedRoute } from '@angular/router';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { Incident } from '../../../core/models/Incident';
import { SuiviIncidentService } from '../../../core/services/suivi-incident/suivi-incident.service';
import { SnapshotDialogComponent } from '../snapshot-dialog/snapshot-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SuiviIncident } from '../../../core/models/SuiviIncident';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { IncidentHistory } from '../../../core/models/IncidentHistory';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-suivi',
  imports: [GoBackComponent,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,       // ✅ stepper vertical/horizontal
    MatFormFieldModule,     // ✅ <mat-form-field>
    MatInputModule,         // ✅ <input matInput>
    ReactiveFormsModule],

  templateUrl: './suivi.component.html',
  styleUrl: './suivi.component.scss'
})
export class SuiviComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private suiviIncidentService = inject(SuiviIncidentService);

  private incidentId = this.route.snapshot.params['id'] || '';

  isLoading: boolean = true;

  history: IncidentHistory[] = [];

  ngOnInit(): void {
    this.loadHistory(this.incidentId);
  }

  loadHistory(id: string) {
    this.isLoading = true;
    this.suiviIncidentService.getIncidentHistory(id).subscribe({
      next: (data) => {
        this.history = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }
}
