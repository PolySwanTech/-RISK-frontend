import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoBackButton, GoBackComponent } from '../go-back/go-back.component';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { ProcessService } from '../../../core/services/process/process.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { Process } from '../../../core/models/Process';
import { CreateRisksComponent } from '../../../features/reglages/risks/create-risks/create-risks.component';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, map, of, switchMap, tap } from 'rxjs';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { PermissionName } from '../../../core/enum/permission.enum';
import { CreateProcessComponent } from '../../../features/process/create-process/create-process.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { AddEntityDialogComponent } from '../../../features/reglages/add-entity-dialog/add-entity-dialog.component';
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation.service';
import { EvaluationFrequency } from '../../../core/enum/evaluation-frequency.enum';

@Component({
  selector: 'app-process-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, GoBackComponent, MatIconModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './param-process.component.html',
  styleUrls: ['./param-process.component.scss']
})
export class ProcessManagerComponent implements OnInit {

  businessUnits: BusinessUnit[] = [];
  processes: Process[] = [];
  periods: string[] = [];
  selectedBu: BusinessUnit | null = null;
  selectedProcess: Process | null = null;
  selectedPeriod: string | null = null;
  showDispatchModal = false;
  newSubprocesses: Array<{ name: string }> = [];
  riskDispatch: { [riskId: string]: number } = {};

  viewedRisks: RiskTemplate[] = []

  buId: string = ''

  cartoMode: boolean = false

  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private processService = inject(ProcessService);
  private riskService = inject(RiskService);
  private entitiesService = inject(EntitiesService);
  private riskEvaluationService = inject(RiskEvaluationService);
  private risksCache = new Map<string, RiskTemplate[]>();


  goBackButtons: GoBackButton[] = [
    {
      label: "Ajouter une entité",
      icon: "add",
      action: () => this.addBu(),
      permission: PermissionName.MANAGE_PROCESS,
      show: true
    }
  ]

  ngOnInit() {
    this.entitiesService.loadEntities().subscribe({
      next: (bus) => {
        this.businessUnits = bus;
      },
      error: (err) => console.error("Erreur lors du chargement des BU :", err)
    });

    this.cartoMode = JSON.parse(this.route.snapshot.queryParams['carto'] || 'false');

    if (this.route.snapshot.queryParams["create"]) {
      this.addProcess();
    }
    else{    
      this.cartoMode = JSON.parse(this.route.snapshot.queryParams['carto']);
    }
}

  onBuChange(): void {
    if (!this.selectedBu) {
      this.processes = [];
      this.selectedProcess = null;
      return;
    }
    this.processes =this.selectedBu.process;
  }

  addBu() {
      this.dialog.open(AddEntityDialogComponent,
        {
          width: '800px'
        }
      ).afterClosed().subscribe(bu => {
        if (!bu) return;
        this.entitiesService.save(bu).subscribe(resp => {
        })
      })
    }

  addProcess() {
    const dialogRef = this.dialog.open(CreateProcessComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container', // Classe CSS personnalisée
      disableClose: false,
      autoFocus: false,
      data: { buId: this.buId }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Recharger les données
      this.ngOnInit();

      // Supprimer le queryParam `create`
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { create: null }, // 👈 Supprime 'create'
        queryParamsHandling: 'merge',  // 👈 Garde les autres queryParams (comme buId)
        replaceUrl: true               // 👈 Évite d’ajouter une nouvelle entrée dans l’historique du navigateur
      });
    });
  }

  selectBu(bu: BusinessUnit) {
    this.selectedBu = bu;
    this.selectedProcess = null;
    this.showDispatchModal = false;
    this.viewedRisks = this.collectRisksFromBu(bu);
    console.log(this.viewedRisks)

    if (this.cartoMode && bu.id) {
      this.loadPeriodsForBu(bu.id);
    }
  }

  selectProcess(process: Process) {
    this.selectedProcess = process;
    this.showDispatchModal = false;
    this.newSubprocesses = [];
    this.riskDispatch = {};
    this.viewedRisks = this.getAllRisksRecursive(process);
  }


  chooseRiskForCarto(risk: RiskTemplate) {
    // 🔍 Trouver le process qui contient ce risque
    const foundProcess = this.findProcessByRiskId(risk.id);
    if (!foundProcess) {
      console.warn("Aucun process trouvé pour ce risque :", risk);
      return;
    }

    // 🔍 Trouver la BU parente
    const foundBu = this.findBuByProcess(foundProcess);
    if (!foundBu) {
      console.warn("Aucune BU trouvée pour le process :", foundProcess);
      return;
    }

    // ✅ Mettre à jour le contexte sélectionné
    this.selectedBu = foundBu;
    this.selectedProcess = foundProcess;

    // 🧩 Enregistrer dans le sessionStorage pour la carto
    const sessionStorageKey = "object_for_carto";
    const obj = {
      bu: { id: foundBu.id, name: foundBu.name },
      process: foundProcess,
      risk: risk
    };

    sessionStorage.setItem(sessionStorageKey, JSON.stringify(obj));
    console.log("➡️ Contexte cartographie enregistré :", obj);

    // 🚀 Redirection si on est en mode cartographie
    if (this.cartoMode) {
      this.router.navigate(['cartographie', 'create'], {
        queryParams: { data: true, key: sessionStorageKey }
      });
    }
  }


  // Méthode récursive pour collecter tous les risques
  private getAllRisksRecursive(process: Process, currentPeriod?: string): RiskTemplate[] {
    const risks: RiskTemplate[] = process.risks?.map(risk => {
      const frequency = process.bu?.evaluationFrequency;
      if (currentPeriod && frequency) {
        try {
          risk.evaluationState = risk.computeEvaluationState(currentPeriod, frequency);
        } catch (e) {
          console.warn(`Période invalide pour le risque "${risk.libelle}" (${process.name})`, e);
        }
      }
      return risk;
    }) ?? [];

    if (Array.isArray(process.enfants) && process.enfants.length > 0) {
      for (const child of process.enfants) {
        risks.push(...this.getAllRisksRecursive(child, currentPeriod));
      }
    }

    console.debug(`${process.name}: ${risks.length} risques collectés`);
    return risks;
  }

  toggleExpand(item: any, event: Event) {
    event.stopPropagation();
    item.expanded = !item.expanded;
  }

  getLevelLabel(level: number | undefined): string {
    const labels: { [key: number]: string } = {
      1: 'Macro',
      2: 'Processus',
      3: 'Sous-proc'
    };

    if (level === undefined) return labels[1];
    if (level > 3) return labels[2];

    return labels[level];
  }

  initiateAddChild() {
    if (!this.selectedProcess) return;

    this.showDispatchModal = true;
    this.newSubprocesses = [
      { name: '' },
      { name: '' }
    ];
    this.riskDispatch = {};
  }

  addSubprocess() {
    this.newSubprocesses.push({ name: '' });
  }

  removeSubprocess(index: number) {
    if (this.newSubprocesses.length > 2) {
      this.newSubprocesses.splice(index, 1);
      Object.keys(this.riskDispatch).forEach(riskId => {
        if (this.riskDispatch[riskId] === index) {
          delete this.riskDispatch[riskId];
        } else if (this.riskDispatch[riskId] > index) {
          this.riskDispatch[riskId]--;
        }
      });
    }
  }

  

  private collectRisksFromBu(bu: BusinessUnit): RiskTemplate[] {
    if (this.risksCache.has(bu.id)) {
      return this.risksCache.get(bu.id)!;
    }

    const risks = new Map<string, RiskTemplate>();
    const collectRecursive = (unit: BusinessUnit) => {
      unit.process?.forEach(proc => {
        this.getAllRisksRecursive(proc).forEach(risk => {
          if (!risks.has(risk.id)) risks.set(risk.id, risk);
        });
      });
      unit.children?.forEach(collectRecursive);
    };

    collectRecursive(bu);

    const result = Array.from(risks.values());
    this.risksCache.set(bu.id, result);
    return result;
  }


  canConfirmDispatch(): boolean {
    if (this.newSubprocesses.length < 2) return false;

    const hasAllNames = this.newSubprocesses.every(sp => sp.name.trim() !== '');
    if (!hasAllNames) return false;

    const allRisksAssigned = this.selectedProcess?.risks.every(
      risk => this.riskDispatch[risk.id] !== undefined && this.riskDispatch[risk.id] !== null
    );

    return allRisksAssigned || false;
  }

  confirmDispatch() {
    if (!this.selectedProcess || !this.canConfirmDispatch()) return;

    const newChildren: Process[] = this.newSubprocesses.map((sp, index) => {
      const child = new Process(
        sp.name,
        this.selectedProcess!.bu,
        this.selectedProcess!.id
      );
      return child;
    });

    // Dispatcher les risques avant de créer les processus
    const risksByChild: Map<number, RiskTemplate[]> = new Map();
    this.selectedProcess.risks.forEach(risk => {
      const targetIndex = this.riskDispatch[risk.id];
      if (targetIndex !== undefined) {
        // Convertir en number si c'est une string
        const indexAsNumber = typeof targetIndex === 'string' ? parseInt(targetIndex, 10) : targetIndex;

        if (!risksByChild.has(indexAsNumber)) {
          risksByChild.set(indexAsNumber, []);
        }
        risksByChild.get(indexAsNumber)!.push(risk);
      }
    });

    // Créer chaque sous-processus via le service
    const createRequests = newChildren.map((child, index) => {
      return this.processService.createProcess({
        name: child.name,
        bu: this.buId,
        parentId: child.parentId
      }).pipe(
        switchMap(createdProcess => {
          // Mettre à jour les risques avec l'ID réel du processus créé
          const risksToUpdate = risksByChild.get(index) || [];

          // Créer les requêtes de réassignation pour chaque risque
          const reassignRequests = risksToUpdate.map(risk =>
            this.riskService.reasign(risk.id, createdProcess.id).pipe(
              tap(() => {
                risk.processId = createdProcess.id;
                risk.processName = createdProcess.name;
              })
            )
          );

          // Attendre que toutes les réassignations soient terminées
          return (reassignRequests.length > 0 ? forkJoin(reassignRequests) : of([])).pipe(
            map(() => {
              createdProcess.risks = risksToUpdate;
              return createdProcess;
            })
          );
        }),
        tap(createdProcess => {
          // Ajouter le processus créé aux enfants
          this.selectedProcess!.enfants.push(createdProcess);
        })
      );
    });

    // Exécuter toutes les requêtes en parallèle
    forkJoin(createRequests).subscribe({
      next: () => {
        // Vider les risques du processus parent
        this.selectedProcess!.risks = [];

        this.showDispatchModal = false;
        this.newSubprocesses = [];
        this.riskDispatch = {};
      },
      error: (error) => {
        console.error('Erreur lors de la création des sous-processus ou réassignation:', error);
        // Optionnel : afficher un message d'erreur à l'utilisateur
      }
    });
  }

  getRootProcesses(bu: BusinessUnit): Process[] {
    return bu.process.filter(p => !p.parentId);
  }

  loadPeriodsForBu(buId: string) {
  this.riskEvaluationService.getPeriodsByBu(buId).subscribe({
    next: (periodsFromDb: string[]) => {
      const current = this.getCurrentPeriod();
      const uniquePeriods = new Set([...periodsFromDb, current]);
      this.periods = Array.from(uniquePeriods).sort().reverse();
      this.selectedPeriod = current;
    },
    error: (err) => console.error("Erreur lors du chargement des périodes :", err)
  });
}

  getCurrentPeriod(): string {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const semester = month <= 6 ? 'S1' : 'S2';
    if (!this.selectedBu && this.selectedBu!.evaluationFrequency === EvaluationFrequency.SEMESTER) {
      return `${semester} ${year}`;
    }
    return `${year}`;
  }

  cancelDispatch() {
    this.showDispatchModal = false;
    this.newSubprocesses = [];
    this.riskDispatch = {};
  }

  private findProcessByRiskId(riskId: string): Process | null {
    for (const bu of this.businessUnits) {
      const found = this.findProcessRecursive(bu.process, riskId);
      if (found) return found;
    }
    return null;
  }

  private findProcessRecursive(processes: Process[], riskId: string): Process | null {
    for (const process of processes) {
      if (process.risks?.some(r => r.id === riskId)) {
        return process;
      }
      if (process.enfants?.length) {
        const childFound = this.findProcessRecursive(process.enfants, riskId);
        if (childFound) return childFound;
      }
    }
    return null;
  }

  /**
   * Recherche de la BU associée à un Process donné.
   */
  private findBuByProcess(targetProcess: Process): BusinessUnit | null {
    for (const bu of this.businessUnits) {
      if (bu.process?.some(p => p.id === targetProcess.id)) {
        return bu;
      }
      if (bu.children?.length) {
        const found = this.findBuByProcessRecursive(bu.children, targetProcess);
        if (found) return found;
      }
    }
    return null;
  }

  private findBuByProcessRecursive(buList: BusinessUnit[], targetProcess: Process): BusinessUnit | null {
    for (const bu of buList) {
      if (bu.process?.some(p => p.id === targetProcess.id)) {
        return bu;
      }
      if (bu.children?.length) {
        const found = this.findBuByProcessRecursive(bu.children, targetProcess);
        if (found) return found;
      }
    }
    return null;
  }

  viewRiskDetails(risk: RiskTemplate): void {
    // const sessionStorageKey = "object_for_carto";
    // const obj = {
    //   bu: this.selectedBu ? { id: this.selectedBu.id, name: this.selectedBu.name } : null,
    //   process: this.selectedProcess,
    //   risk: risk
    // };
    this.router.navigate(['reglages', 'risks', risk.id]);

  }

  createNewEvent(): void {
    const process = this.selectedProcess!

    const dialogRef = this.dialog.open(CreateRisksComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container', // Classe CSS personnalisée
      disableClose: false,
      autoFocus: false,
      data: { processId: process.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBarService.info("Evènement de risque crée avec succès");
        this.ngOnInit();
        this.selectedProcess = process
        // reload les risques
      }
    });
  }
}
