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


@Component({
  selector: 'app-suivi',
  imports: [GoBackComponent,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule],

  templateUrl: './suivi.component.html',
  styleUrl: './suivi.component.scss'
})
export class SuiviComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private incidentService = inject(IncidentService);
  private suiviIncidentService = inject(SuiviIncidentService);
  private dialog = inject(MatDialog);

  history: any[] = [];
  isLoading: boolean = true;

  incident: Incident | undefined

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incident = incident;
    }
    );

    this.suiviIncidentService.getSuiviIncidentById(id).subscribe((suiviIncident) => {
      console.log(suiviIncident);
    }
    );
    this.loadHistory(id);
  }

  loadHistory(id: string) {
    this.isLoading = true;
    this.incidentService.getIncidentHistory(id).subscribe({
      next: (data) => {
        this.history = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("❌ Erreur lors de la récupération de l'historique :", err);
        this.isLoading = false;
      }
    });
  }

  openSnapshotDialog(entry: any) {
    this.dialog.open(SnapshotDialogComponent, {
      width: '800px',
      data: entry,
      panelClass: 'snapshot-dialog-panel'
    });
  }

}
