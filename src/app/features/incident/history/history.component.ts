import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SnapshotDialogComponent } from '../snapshot-dialog/snapshot-dialog.component';
import { SuiviIncidentService } from '../../../core/services/suivi-incident/suivi-incident.service';
import { SuiviIncident } from '../../../core/models/SuiviIncident';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  history: SuiviIncident[] = [];
  incidentId: string = '';
  isLoading: boolean = true;

  private route = inject(ActivatedRoute);
  private suiviIncidentService = inject(SuiviIncidentService);
  private dialog = inject(MatDialog)

  ngOnInit() {
    this.incidentId = this.route.snapshot.params['id'];
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.suiviIncidentService.getSuiviIncidentById(this.incidentId).subscribe({
      next: (suivi) => {
        this.history = suivi;
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
