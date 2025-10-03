import { GoBackButton } from './../../shared/components/go-back/go-back.component';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { EntitiesService } from '../../core/services/entities/entities.service';
import { RiskService } from '../../core/services/risk/risk.service';

import { MatrixComponent } from '../../features/cartographie/matrix/matrix.component';
import { RiskMatrixComponent } from '../../features/cartographie/risk-matrix/risk-matrix.component';
import { RiskTemplate } from '../../core/models/RiskTemplate';
import { Process } from '../../core/models/Process';
import { ProcessService } from '../../core/services/process/process.service';
import { RiskLevel, RiskLevelEnum } from '../../core/enum/riskLevel.enum';
import { MatrixService } from '../../core/services/matrix/matrix.service';
import { GoBackComponent } from "../../shared/components/go-back/go-back.component";
import { BusinessUnit } from '../../core/models/BusinessUnit';
import { ConfirmService } from '../../core/services/confirm/confirm.service';

@Component({
  selector: 'app-risk-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatOptionModule, MatSelectModule, MatFormFieldModule,
    MatrixComponent, RiskMatrixComponent,
    GoBackComponent
  ],
  templateUrl: './risk-page.component.html',
  styleUrl: './risk-page.component.scss'
})

export class RiskPageComponent implements OnInit {
  selectedNiveau: RiskLevel | null = null;
  selectedBU: string | 'all' = 'all';

  risks: RiskTemplate[] = [];
  filteredRisks: RiskTemplate[] = [];
  buNameList: string[] = [];

  businessUnit: BusinessUnit | null = null;

  selectedRisk: RiskTemplate | null = null;
  processMap: Record<string, Process> = {};

  levels = Object.values(RiskLevelEnum);

  matrixData: any = null;
  buId: string = '';
  buName: string = '';
  goBackButtons: GoBackButton[] = [];

  private riskService = inject(RiskService);
  private confirmService = inject(ConfirmService);
  private entitiesSrv = inject(EntitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private matrixService = inject(MatrixService);
  private processService: ProcessService = inject(ProcessService);

  ngOnInit(): void {
    this.goBackButtons = [
      { label: 'Ajouter un risque', icon: 'add', class: 'btn-primary', action: () => this.goToAddRisk(), show: true },
      { label: 'Exporter', icon: 'file_download', class: 'btn-green', action: () => this.exportData(), show: true },
    ];

    this.buId = this.route.snapshot.paramMap.get('id')!;
    this.entitiesSrv.findById(this.buId).subscribe(resp => {
      this.businessUnit = resp;
      this.buName = this.businessUnit.name
    });

    this.matrixService.getDefaultMatrix(this.buId).subscribe({
      next: resp => this.matrixData = resp,
      error: err => console.error(err)
    });

    // Construire une map des process (pour fallback BU si besoin)
    this.processService.getAll().subscribe(list => {
      this.processMap = list.reduce<Record<string, Process>>((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});
    });

    // Charger risques + BU en parallèle
    forkJoin({
      risks: this.riskService.getAll(),     // <-- doit renvoyer RiskTemplate[] (mappés)
      bus: this.entitiesSrv.loadEntities()
    }).subscribe({
      next: ({ risks, bus }) => {
        // Pas de calcul de frequency (plus de probability)
        // On garde la liste telle quelle
        this.risks = risks ?? [];
        this.filteredRisks = [...this.risks];
        this.buNameList = bus.map(b => b.name);
      },
      error: err => console.error('Erreur chargement page risques', err)
    });
  }

  refreshData(): void {
    this.ngOnInit();
    this.clearFilters();
  }

  clearFilters(): void {
    this.selectedBU = 'all';
    this.selectedNiveau = null;
    this.applyFilters();
  }

  exportData(): void {
    alert("fonctionnalité non implémentée");
  }

  applyFilters(): void {
    let list = [...this.risks];

    // --- Filtre BU ---
    if (this.selectedBU !== 'all') {
      list = list.filter(r => {
        // Priorité au buName déjà envoyé par le back
        const bu = r.buName || (r.processId ? this.processMap[r.processId]?.buName : undefined);
        return bu === this.selectedBU;
      });
    }

    // --- Filtre niveau (sur le dernier NET) ---
    if (this.selectedNiveau) {
      list = list.filter(r => (r.riskNet?.at(-1)?.evaluation ?? null) === this.selectedNiveau);
    }

    // --- Sync sélection ---
    if (this.selectedRisk && !list.some(r => r.id === this.selectedRisk!.id)) {
      this.selectedRisk = null;
    }

    this.filteredRisks = list;
  }

  onSelectRisk(risk: RiskTemplate): void {
    this.selectedRisk = risk;
  }

  handleModifyRisk(id: string): void {
    this.router.navigate(['reglages', 'risks', id]);
  }

  goToAddRisk(): void {
    if(this.businessUnit?.process.length === 0) {
      this.confirmService.openConfirmDialog("Impossible d'ajouter un risque", "Cette business unit ne contient aucun processus. Veuillez d'abord ajouter un processus avant de créer un risque.")
        .subscribe(res => {
          if(res) {
            this.router.navigate(['reglages'], { queryParams: { buId: this.buId } });
          }
        })
      return;
    }
    this.router.navigate(['reglages', 'risks', 'create'], { queryParams: { buId: this.buId } });
  }
}
