import { AfterViewInit, Component, inject, Input, OnInit, ViewChild } from '@angular/core';
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
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EnumLabelPipe } from '../../pipes/enum-label.pipe';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-process-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GoBackComponent,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    EnumLabelPipe,
    MatSortModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './param-process.component.html',
  styleUrls: ['./param-process.component.scss']
})
export class ProcessManagerComponent implements OnInit, AfterViewInit {

  businessUnits: BusinessUnit[] = [];
  processes: Process[] = [];
  periods: string[] = [];
  selectedBu: BusinessUnit | null = null;
  selectedProcess: Process | null = null;
  selectedPeriod: string | null = null;
  showDispatchModal = false;
  newSubprocesses: Array<{ name: string }> = [];
  riskDispatch: { [riskId: string]: number } = {};

  riskDisplayedColumns: string[] = ['libelle', 'description', 'riskBrut', 'riskNet'];
  riskDataSource = new MatTableDataSource<RiskTemplate>([]);

  viewedRisks: RiskTemplate[] = []

  buId: string = ''

  @Input() cartoMode: boolean = true

  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    if (this.paginator && this.sort) {
      this.riskDataSource.paginator = this.paginator;
      this.riskDataSource.sort = this.sort;
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    }
  }

  ngOnInit() {
    this.entitiesService.loadEntities().subscribe({
      next: (bus) => {
        this.businessUnits = bus;
        console.log(bus)
      },
      error: (err) => console.error("Erreur lors du chargement des BU :", err)
    });

    if (this.route.snapshot.queryParams['carto']) {
      this.cartoMode = JSON.parse(this.route.snapshot.queryParams['carto']);
    }

    // Adapter les colonnes selon le mode
    this.riskDisplayedColumns = this.cartoMode
      ? ['reference', 'libelle', 'description', 'riskBrut', 'riskNet']
      : ['reference', 'libelle', 'description', 'riskBrut', 'riskNet'];

    if (this.route.snapshot.queryParams["create"]) {
      this.addProcess('');
    }
  }

  addBu() {
    this.dialog.open(AddEntityDialogComponent, {
      width: '800px'
    }).afterClosed().subscribe(bu => {
      if (!bu) return;
      this.entitiesService.save(bu).subscribe(resp => {
        this.ngOnInit();
      })
    })
  }

  addProcess(buId: string) {
    const dialogRef = this.dialog.open(CreateProcessComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: false,
      data: { buId: buId }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { create: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  selectBu(bu: BusinessUnit) {
    this.selectedBu = bu;
    this.selectedProcess = null;
    this.showDispatchModal = false;
    this.viewedRisks = this.collectRisksFromBu(bu);

    if (this.cartoMode && bu.id) {
      this.loadPeriodsForBu(bu.id);
    }

    // CORRECTION : Mise à jour immédiate du dataSource
    this.riskDataSource.data = this.viewedRisks;
    console.log(this.riskDataSource.data);

    setTimeout(() => {
      this.riskDataSource.paginator = this.paginator;
      this.riskDataSource.sort = this.sort;
      this.paginator.firstPage();

    });
  }

  selectProcess(process: Process) {
    this.selectedProcess = process;
    this.showDispatchModal = false;
    this.newSubprocesses = [];
    this.riskDispatch = {};
    this.viewedRisks = this.getAllRisksRecursive(process);

    this.riskDataSource.data = this.viewedRisks;
  }

  chooseRiskForCarto(risk: RiskTemplate) {
    const foundProcess = this.findProcessByRiskId(risk.id);
    if (!foundProcess) {
      console.warn("Aucun process trouvé pour ce risque :", risk);
      return;
    }

    const foundBu = this.findBuByProcess(foundProcess);
    if (!foundBu) {
      console.warn("Aucune BU trouvée pour le process :", foundProcess);
      return;
    }

    this.selectedBu = foundBu;
    this.selectedProcess = foundProcess;

    const sessionStorageKey = "object_for_carto";
    const obj = {
      bu: { id: foundBu.id, name: foundBu.name },
      process: foundProcess,
      risk: risk
    };

    sessionStorage.setItem(sessionStorageKey, JSON.stringify(obj));

    if (this.cartoMode) {
      this.router.navigate(['cartographie', 'create'], {
        queryParams: { data: true, key: sessionStorageKey }
      });
    }
  }

  private getAllRisksRecursive(process: Process, currentPeriod?: string): RiskTemplate[] {
    this.riskDataSource.data = [];
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
    this.riskDataSource.data = [];
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

    const newChildren: any[] = this.newSubprocesses.map((sp, index) => {
      const child = {
        name: sp.name,
        buId: this.selectedProcess!.buId,
        parentId: this.selectedProcess!.id
      };
      return child;
    });

    console.log(this.selectedProcess)

    const risksByChild: Map<number, RiskTemplate[]> = new Map();
    this.selectedProcess.risks.forEach(risk => {
      const targetIndex = this.riskDispatch[risk.id];
      if (targetIndex !== undefined) {
        const indexAsNumber = typeof targetIndex === 'string' ? parseInt(targetIndex, 10) : targetIndex;

        if (!risksByChild.has(indexAsNumber)) {
          risksByChild.set(indexAsNumber, []);
        }
        risksByChild.get(indexAsNumber)!.push(risk);
      }
    });

    const createRequests = newChildren.map((child, index) => {
      return this.processService.createProcess({
        name: child.name,
        bu: child.buId,
        parentId: child.parentId
      }).pipe(
        switchMap(createdProcess => {
          const risksToUpdate = risksByChild.get(index) || [];
          const reassignRequests = risksToUpdate.map(risk =>
            this.riskService.reasign(risk.id, createdProcess.id).pipe(
              tap(() => {
                risk.processId = createdProcess.id;
                risk.processName = createdProcess.name;
              })
            )
          );

          return (reassignRequests.length > 0 ? forkJoin(reassignRequests) : of([])).pipe(
            map(() => {
              createdProcess.risks = risksToUpdate;
              return createdProcess;
            })
          );
        }),
        tap(createdProcess => {
          this.selectedProcess!.enfants.push(createdProcess);
        })
      );
    });

    forkJoin(createRequests).subscribe({
      next: () => {
        this.selectedProcess!.risks = [];
        this.showDispatchModal = false;
        this.newSubprocesses = [];
        this.riskDispatch = {};
      },
      error: (error) => {
        console.error('Erreur lors de la création des sous-processus ou réassignation:', error);
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
    if (this.selectedBu && this.selectedBu.evaluationFrequency === EvaluationFrequency.SEMESTER) {
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
    this.router.navigate(['reglages', 'risks', risk.id]);
  }

  createNewEvent(): void {
    const process = this.selectedProcess!

    const dialogRef = this.dialog.open(CreateRisksComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      disableClose: false,
      autoFocus: false,
      data: { processId: process.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBarService.info("Evènement de risque crée avec succès");
        this.ngOnInit();
        this.selectedProcess = process;
      }
    });
  }

  onRiskRowClick(risk: RiskTemplate, event: Event): void {
    // Éviter de déclencher si on clique sur le bouton d'action
    const target = event.target as HTMLElement;
    if (target.closest('.action-cell button')) {
      return;
    }

    // Si on n'est pas en mode carto, aller directement aux détails
    if (!this.cartoMode) {
      this.viewRiskDetails(risk);
      return;
    }

    // Logique pour le mode carto
    const hasRiskBrut = risk.riskBrut && risk.riskBrut.length > 0;
    const hasRiskNet = risk.riskNet && risk.riskNet.length > 0;

    // Trouver le process et la BU associés
    const foundProcess = this.findProcessByRiskId(risk.id);
    const foundBu = foundProcess ? this.findBuByProcess(foundProcess) : null;

    if (!foundProcess || !foundBu) {
      console.warn("Impossible de trouver le contexte pour ce risque");
      return;
    }

    const sessionStorageKey = "object_for_carto";
    const obj = {
      bu: { id: foundBu.id, name: foundBu.name },
      process: foundProcess,
      risk: risk
    };
    sessionStorage.setItem(sessionStorageKey, JSON.stringify(obj));

    if (!hasRiskBrut) {
      // Pas d'évaluation brute → créer évaluation brute
      this.router.navigate(['cartographie', 'evaluation-brute'], {
        queryParams: { data: true, key: sessionStorageKey }
      });
    } else if (!hasRiskNet) {
      // A évaluation brute mais pas nette → aller à l'évaluation nette
      this.router.navigate(['cartographie', 'evaluation-nette'], {
        queryParams: {
          data: true,
          key: sessionStorageKey
        }
      });
    } else {
      // A les deux évaluations → voir les détails
      this.viewRiskDetails(risk);
    }
  }

  getRiskBrutColor(risk: RiskTemplate): string {
    if (!risk.riskBrut || risk.riskBrut.length === 0) {
      return '#cbd5e1';
    }
    return risk.riskBrut[0].evaluation?.color || '#cbd5e1';
  }

  getRiskNetColor(risk: RiskTemplate): string {
    if (!risk.riskNet || risk.riskNet.length === 0) {
      return '#cbd5e1';
    }
    return risk.riskNet[0].evaluation?.color || '#cbd5e1';
  }

  getRiskTooltip(risk: RiskTemplate): string {
    if (!this.cartoMode) {
      return 'Cliquez pour voir les détails du risque';
    }

    const hasRiskBrut = risk.riskBrut && risk.riskBrut.length > 0;
    const hasRiskNet = risk.riskNet && risk.riskNet.length > 0;

    if (!hasRiskBrut) {
      return 'Cliquez pour créer l\'évaluation brute';
    } else if (!hasRiskNet) {
      return 'Cliquez pour créer l\'évaluation nette';
    } else {
      return 'Cliquez pour voir les détails et gérer les évaluations';
    }
  }

  // ============================================
  // NOUVELLES MÉTHODES POUR LE MENU CONTEXTUEL
  // ============================================

  deleteBu(id: string) {
    this.confirmService.openConfirmDialog(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette Business Unit ? Cette action est irréversible."
    ).subscribe(confirm => {
      if (confirm) {
        this.entitiesService.delete(id).subscribe({
          next: () => {
            this.snackBarService.info("Business Unit supprimée avec succès !");
            this.selectedBu = null;
            this.ngOnInit();
          },
          error: (err) => {
            this.snackBarService.error("Erreur lors de la suppression : " + err.message);
          }
        });
      }
    });
  }

  openEntityDialog(entite?: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.dialog.open(AddEntityDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: {
        ...entite,
        enableDraft: false
      }
    }).afterClosed().subscribe(bu => {
      if (bu) {
        if (bu.id) {
          this.entitiesService.update(bu).subscribe(_ => {
            this.ngOnInit();
            this.snackBarService.info("Entité modifiée avec succès !");
          });
        }
        else {
          this.entitiesService.save(bu).subscribe(_ => {
            this.ngOnInit();
            this.snackBarService.info("Entité ajoutée avec succès !");
          });
        }
      }
    });
  }

  goToMatrixPage(buId: any) {
    this.router.navigate(['risk', buId]);
  }
}