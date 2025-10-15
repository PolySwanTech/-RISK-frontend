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

@Component({
  selector: 'app-process-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, GoBackComponent],
  templateUrl: './param-process.component.html',
  styleUrls: ['./param-process.component.scss']
})
export class ProcessManagerComponent implements OnInit {

  processes: Process[] = [];
  selectedProcess: Process | null = null;
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

  goBackButtons: GoBackButton[] = [
    {
      label: "Ajouter un processus",
      icon: "add",
      action: () => this.addProcess(),
      permission: PermissionName.MANAGE_PROCESS,
      show: true
    }
  ]

  ngOnInit() {
    this.buId = this.route.snapshot.queryParams["buId"] || ""
    this.processService.getProcessTree(this.buId).subscribe(list => {
      this.processes = list
    });
    if (this.route.snapshot.queryParams["create"]) {
      this.addProcess();
    }
    this.cartoMode = this.route.snapshot.queryParams['carto']
  }

  addProcess() {
    const dialogRef = this.dialog.open(CreateProcessComponent, {
      width: '800px',
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


  selectProcess(process: Process) {
    this.selectedProcess = process;
    this.showDispatchModal = false;
    this.newSubprocesses = [];
    this.riskDispatch = {};
    this.viewedRisks = this.getAllRisksRecursive(process);
  }

  chooseRiskForCarto(risk: RiskTemplate) {
    const sessionStorageKey = "object_for_carto"
    const obj =
    {
      bu: {
        id: this.buId,
        name: this.selectedProcess?.buName
      },
      process: this.selectedProcess,
      risk: risk
    }

    sessionStorage.setItem(sessionStorageKey, JSON.stringify(obj));

    if (this.cartoMode) {
      this.router.navigate(['cartographie', 'create'], { queryParams: { data: true, key: sessionStorageKey } })
    }
  }

  // Méthode récursive pour collecter tous les risques
  private getAllRisksRecursive(process: Process): RiskTemplate[] {
    const risks: RiskTemplate[] = [...process.risks];

    if (process.enfants && process.enfants.length > 0) {
      process.enfants.forEach(child => {
        risks.push(...this.getAllRisksRecursive(child));
      });
    }

    return risks;
  }

  toggleExpand(process: Process, event: Event) {
    event.stopPropagation();
    process.expanded = !process.expanded;
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

  cancelDispatch() {
    this.showDispatchModal = false;
    this.newSubprocesses = [];
    this.riskDispatch = {};
  }

  createNewEvent(): void {
    const process = this.selectedProcess!

    const dialogRef = this.dialog.open(CreateRisksComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { processId: process.id },
      autoFocus: false
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
