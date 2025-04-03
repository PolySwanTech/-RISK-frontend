import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IncidentService } from '../../../core/services/incident/incident.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SnapshotDialogComponent } from '../snapshot-dialog/snapshot-dialog.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    SnapshotDialogComponent
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  history: any[] = [];
  incidentId: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private incidentService: IncidentService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.incidentId = this.route.snapshot.params['id'];
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.incidentService.getIncidentHistory(this.incidentId).subscribe({
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
