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
  private entitiesService = inject(EntitiesService);

  businessUnits: EntiteResponsable[] = [];

  isLoading: boolean = true;
  messages: SuiviIncident[] = [];

  incident: Incident | undefined

  history : IncidentHistory[] = [];

  readonly TITRE_PAR_ACTION: Record<string, string> = {
    CREATION: 'Création de l’incident',
    MODIFICATION: 'Modification de l’incident',
    CLOTURE: 'Clôture de l’incident',
    IMPACT_ADDED: '➕ Impact ajouté',
    MESSAGE_ADDED: '💬 Message ajouté'
  };

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.entitiesService.loadEntities().subscribe(units => {
      this.businessUnits = units;
    });
    this.incidentService.getIncidentById(id).subscribe((incident) => {
      this.incident = incident;
    }
    );

    this.suiviIncidentService.getSuiviIncidentById(id).subscribe((suiviIncident) => {
      this.messages = suiviIncident;
    });


    this.loadHistory(id);
  }

  loadHistory(id: string) {
    this.isLoading = true;
    this.suiviIncidentService.getIncidentHistory(id).subscribe({
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

  getImpactFromHistory(entry: any): string | null {
    if (!this.incident?.impacts) return null;

    const createdAt = entry.timestamp;

    // On cherche l’impact le plus proche de la date d’ajout dans l’historique
    const matching = this.incident.impacts
      .map(i => ({
        ...i,
        diff: Math.abs(new Date(i.createdAt).getTime() - new Date(createdAt).getTime())
      }))
      .sort((a, b) => a.diff - b.diff);

    if (matching.length > 0) {
      const impact = matching[0];
      return `Impact ${this.getEntityName(impact.entityId)} - ${impact.montant}€ - ${impact.type}`;
    }

    return null;
  }
  getEntityName(id: string): string {
    return this.businessUnits.find(e => e.id === id)?.name || 'Inconnu';
  }



}
