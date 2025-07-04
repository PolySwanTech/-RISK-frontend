// import { Component, inject, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { IncidentService } from '../../../core/services/incident/incident.service';
// import { MatDialog } from '@angular/material/dialog';
// import { CommonModule } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { SnapshotDialogComponent } from '../snapshot-dialog/snapshot-dialog.component';
// import { SuiviIncidentService } from '../../../core/services/suivi-incident/suivi-incident.service';
// import { Impact } from '../../../core/models/Impact';
// import { IncidentHistory } from '../../../core/models/IncidentHistory';

// @Component({
//     selector: 'app-history',
//     standalone: true,
//     imports: [
//         CommonModule,
//         MatCardModule,
//         MatButtonModule,
//         MatIconModule
//     ],
//     templateUrl: './history.component.html',
//     styleUrls: ['./history.component.scss']
// })
// export class HistoryComponent implements OnInit {
//     history: IncidentHistory[] = [];
//     incidentId: string = '';
//     isLoading: boolean = true;

//     private route = inject(ActivatedRoute);
//     private suiviIncidentService = inject(SuiviIncidentService);
//     private dialog = inject(MatDialog)
//     private incidentService = inject(IncidentService);
//     impacts: Impact[] = [];


//     ngOnInit() {
//         this.incidentId = this.route.snapshot.params['id'];
//         this.loadHistory();
//     }

//     loadHistory() {
//         this.isLoading = true;
//         this.suiviIncidentService.getIncidentHistory(this.incidentId).subscribe({
//             next: (history) => {
//                 this.history = history;
//                 console.log("Historique reçu :", history);
//                 this.isLoading = false;
//             }
//         });
//         this.incidentService.getIncidentById(this.incidentId).subscribe({
//             next: (incident) => {
//                 this.impacts = incident.impactIncidents;
//                 console.log("Impacts reçus :", this.impacts);
//             },
//             error: (error) => {
//                 console.error("Erreur lors de la récupération des impacts :", error);
//             }
//         });
//     }

//     openSnapshotDialog(entry: any) {
//         this.dialog.open(SnapshotDialogComponent, {
//             width: '800px',
//             data: entry,
//             panelClass: 'snapshot-dialog-panel'
//         });
//     }

//     getImpactSummary(message: string): string | null {
//         const normalizedMessage = message.trim().toLowerCase();

//         const matching = this.impacts
//             .filter(i => i.message?.trim().toLowerCase() === normalizedMessage)
//             .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

//         console.log('Recherche du résumé d’impact pour message :', normalizedMessage);
//         console.log('Matching impacts :', matching);

//         if (matching.length > 0) {
//             const impact = matching[0];
//             return `Impact ${impact.entityName} - ${impact.montant}€ - ${impact.type}`;
//         }

//         return null;
//     }


// }
