import { CommonModule }                 from '@angular/common';
import { Component, inject, OnInit }    from '@angular/core';
import { FormsModule }                  from '@angular/forms';
import { Router }                       from '@angular/router';
import { forkJoin }                     from 'rxjs';

import { MatButtonModule }  from '@angular/material/button';
import { MatCardModule }    from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule }    from '@angular/material/icon';
import { MatOptionModule }  from '@angular/material/core';
import { MatSelectModule }  from '@angular/material/select';

import { EntitiesService }  from '../../core/services/entities/entities.service';
import { RiskService }      from '../../core/services/risk/risk.service';

import { MatrixComponent }      from '../../features/cartographie/matrix/matrix.component';
import { RiskMatrixComponent }  from '../../features/cartographie/risk-matrix/risk-matrix.component';
import { RiskTemplate }         from '../../core/models/RiskTemplate';
import { Process } from '../../core/models/Process';
import { ProcessService } from '../../core/services/process/process.service';
import { RiskLevelScores, RiskLevel } from '../../core/enum/riskLevel.enum';

@Component({
  selector   : 'app-risk-page',
  standalone : true,
  imports    : [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatOptionModule, MatSelectModule, MatFormFieldModule,
    MatrixComponent, RiskMatrixComponent
  ],
  templateUrl: './risk-page.component.html',
  styleUrl   : './risk-page.component.scss'
})
export class RiskPageComponent implements OnInit {

  /* -------------------------- filtres -------------------------- */
  selectedNiveau : RiskLevel | null = null
  selectedBU    : string | 'all' = 'all';

  /* ------------------------- données --------------------------- */
  risks         : RiskTemplate[] = [];   // liste complète
  filteredRisks : RiskTemplate[] = [];   // après filtrage
  buNameList    : string[]       = [];   // liste dynamique des BUs

  selectedRisk  : RiskTemplate   | null = null;
  processMap: Record<string,Process> = {};

  levels = Object.values(RiskLevel);

  /* ------------------ services / navigation -------------------- */
  private riskService   = inject(RiskService);
  private entitiesSrv   = inject(EntitiesService);
  private router        = inject(Router);
  processService: ProcessService = inject(ProcessService);

  /* ============================================================= */
  ngOnInit(): void {

    this.processService.getAll().subscribe(list => {
      this.processMap = list.reduce<Record<string, Process>>(
      (acc, p) => ({ ...acc, [p.id]: p }),
      {}
    );
    this.filteredRisks = [...this.risks];   // ou ton chargement réel
  });
  
  /* On charge les risques ET les BUs en parallèle */
  forkJoin({
    risks : this.riskService.getAll(),
    bus   : this.entitiesSrv.loadEntities()
  }).subscribe({
    next: ({ risks, bus }) => {
        /* ---------------- Pré-traitement ---------------- */
        this.risks = risks.map(risk => {
          const lastEval = risk.riskEvaluations?.at(-1);

          /* probability est sur 1-10 → on le ramène sur 1-5 */
          const frequency = lastEval && lastEval.probability !== undefined ? Math.ceil(lastEval.probability / 2) : null;

          /* riskNet est l’enum (LOW, MEDIUM…) → on le convertit en score 1-5 */
          const impact    = lastEval
              ? RiskLevelScores[lastEval.riskNet as RiskLevel]   // ex. HIGH → 4
              : null;

          return { ...risk, frequency, impact };
        });
        this.filteredRisks = [...risks];
        this.buNameList    = bus.map(b => b.name);
      },
      error: err => console.error('Erreur chargement page risques', err)
    });
  }

  /* ============================================================= */
  refreshData(): void {
    this.ngOnInit();              // re-charge tout
    this.clearFilters();          // optionnel : réinitialise les filtres
  }

  clearFilters(): void {
    this.selectedBU     = 'all';
    this.selectedNiveau = RiskLevel.LOW;
    this.applyFilters();
  }

  /* ------------------------- filtrage -------------------------- */
  applyFilters(): void {

    let list = [...this.risks];

    /* --- BU --- */
    if (this.selectedBU !== 'all') {
      list.forEach(r => {
        r.buName = this.processMap[r.processId].buName
      })
      list = list.filter(r => r.buName === this.selectedBU);
    }

    /* --- niveau --- */
    if(this.selectedNiveau){
      list = list.filter(r => r.riskEvaluations?.at(-1)?.riskNet == this.selectedNiveau);
    }

    /* --- synchro sélection courante --- */
    if (this.selectedRisk && !list.some(r => r.id === this.selectedRisk!.id)) {
      this.selectedRisk = null;
    }

    this.filteredRisks = list;
  }

  /* ------------------------- actions --------------------------- */
  onSelectRisk(risk: RiskTemplate): void {
    this.selectedRisk = risk;
  }

  handleModifyRisk(id: string): void {
    this.router.navigate(['reglages', 'risks', id]);
  }

  goToAddRisk(): void {
    this.router.navigate(['reglages', 'risks', 'create']);
  }
}
