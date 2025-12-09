import { AfterViewInit, Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoBackButton, GoBackComponent } from '../go-back/go-back.component';
import { RiskTemplate } from '../../../core/models/RiskTemplate';
import { ProcessService } from '../../../core/services/process/process.service';
import { RiskService } from '../../../core/services/risk/risk.service';
import { Process } from '../../../core/models/Process';
import { CreateRisksComponent } from '../../../features/reglages/risks/create-risks/create-risks.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { BasePopupComponent, PopupAction } from '../base-popup/base-popup.component';

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
    MatButtonModule,
    BasePopupComponent
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
  @Input() popupMode: boolean = false  // Nouveau mode popup

  // Actions de la popup
  popupActions: PopupAction[] = [];

  // Propriétés pour sauvegarder l'état de l'arborescence
  private expandedBuIds = new Set<string>();
  private expandedProcessIds = new Set<string>();
  private selectedBuId: string | null = null;
  private selectedProcessId: string | null = null;

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
  private dataChangedListener: any;

  // Injection optionnelle du DialogRef pour le mode popup
  dialogRef = inject(MatDialogRef<ProcessManagerComponent> , { optional: true });
  data = inject(MAT_DIALOG_DATA, { optional: true });

  goBackButtons: GoBackButton[] = [
    {
      label: "Ajouter une entité",
      icon: "add",
      action: () => this.addBu(),
      permission: PermissionName.MANAGE_PROCESS,
      show: !this.cartoMode
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
        
        // Restaurer l'état d'expansion après le chargement
        this.restoreExpansionState();
        
        // Restaurer la sélection
        this.restoreSelection();
      },
      error: (err) => console.error("Erreur lors du chargement des BU :", err)
    });

    this.dataChangedListener = () => {
      this.ngOnInit();
    };
    window.addEventListener('dataChanged', this.dataChangedListener);

    // En mode popup, récupérer les données passées via MAT_DIALOG_DATA

      if (this.data) {
        this.cartoMode = this.data.cartoMode ?? this.cartoMode;
        this.popupMode = this.data.popupMode ?? this.popupMode;
      }

    // Sinon, récupérer depuis les query params (mode normal)
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

    // En mode popup, masquer le bouton "Ajouter une entité"
    if (this.popupMode) {
      this.goBackButtons = [];
      // Configurer les actions de la popup
      this.initPopupActions();
    }
  }

  // Initialiser les actions de la popup
  initPopupActions(): void {
    this.popupActions = [
      {
        label: 'Annuler',
        color: 'red',
        icon: 'close',
        onClick: () => this.closePopup()
      }
    ];
  }

  // Méthode pour obtenir le DialogRef
  getDialogRef(): MatDialogRef<any> | null {
    return this.dialogRef;
  }

  // Méthode pour fermer la popup
  closePopup(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  // ============================================
  // MÉTHODES DE SAUVEGARDE/RESTAURATION DE L'ÉTAT
  // ============================================

  private saveExpansionState(): void {
    this.expandedBuIds.clear();
    this.expandedProcessIds.clear();

    const saveBuState = (bu: BusinessUnit) => {
      if (bu.expanded) {
        this.expandedBuIds.add(bu.id);
      }
      
      // Sauvegarder l'état des processus
      bu.process?.forEach(proc => this.saveProcessState(proc));
      
      // Récursif pour les sous-BU
      bu.children?.forEach(saveBuState);
    };

    this.businessUnits.forEach(saveBuState);
    
    // Sauvegarder les sélections
    this.selectedBuId = this.selectedBu?.id || null;
    this.selectedProcessId = this.selectedProcess?.id || null;
  }

  private saveProcessState(process: Process): void {
    if (process.expanded) {
      this.expandedProcessIds.add(process.id);
    }
    process.enfants?.forEach(child => this.saveProcessState(child));
  }

  private restoreExpansionState(): void {
    const restoreBuState = (bu: BusinessUnit) => {
      if (this.expandedBuIds.has(bu.id)) {
        bu.expanded = true;
      }
      
      // Restaurer l'état des processus
      bu.process?.forEach(proc => this.restoreProcessState(proc));
      
      // Récursif pour les sous-BU
      bu.children?.forEach(restoreBuState);
    };

    this.businessUnits.forEach(restoreBuState);
  }

  private restoreProcessState(process: Process): void {
    if (this.expandedProcessIds.has(process.id)) {
      process.expanded = true;
    }
    process.enfants?.forEach(child => this.restoreProcessState(child));
  }

  private restoreSelection(): void {
    if (this.selectedBuId) {
      const bu = this.findBuById(this.selectedBuId);
      if (bu) {
        this.selectBu(bu);
      }
    }
    
    if (this.selectedProcessId) {
      const process = this.findProcessById(this.selectedProcessId);
      if (process) {
        this.selectProcess(process);
      }
    }
  }

  private findBuById(id: string): BusinessUnit | null {
    const findRecursive = (buList: BusinessUnit[]): BusinessUnit | null => {
      for (const bu of buList) {
        if (bu.id === id) return bu;
        if (bu.children?.length) {
          const found = findRecursive(bu.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findRecursive(this.businessUnits);
  }

  private findProcessById(id: string): Process | null {
    const findInProcessList = (processes: Process[]): Process | null => {
      for (const proc of processes) {
        if (proc.id === id) return proc;
        if (proc.enfants?.length) {
          const found = findInProcessList(proc.enfants);
          if (found) return found;
        }
      }
      return null;
    };

    for (const bu of this.businessUnits) {
      const found = findInProcessList(bu.process || []);
      if (found) return found;
      
      if (bu.children?.length) {
        const findInBuChildren = (buList: BusinessUnit[]): Process | null => {
          for (const childBu of buList) {
            const proc = findInProcessList(childBu.process || []);
            if (proc) return proc;
            if (childBu.children?.length) {
              const found = findInBuChildren(childBu.children);
              if (found) return found;
            }
          }
          return null;
        };
        const found = findInBuChildren(bu.children);
        if (found) return found;
      }
    }
    return null;
  }

  // ============================================
  // MÉTHODES ORIGINALES (MODIFIÉES)
  // ============================================

  addBu() {
    this.saveExpansionState();
    
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
    this.saveExpansionState();
    
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

    this.riskDataSource.data = this.viewedRisks;

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

    this.saveExpansionState();

    const newChildren: any[] = this.newSubprocesses.map((sp, index) => {
      const child = {
        name: sp.name,
        buId: this.selectedProcess!.buId,
        parentId: this.selectedProcess!.id
      };
      return child;
    });

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
        this.ngOnInit();
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

    this.saveExpansionState();

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
        this.snackBarService.info("Evènement de risque créé avec succès");
        this.ngOnInit();
      }
    });
  }

  onRiskRowClick(risk: RiskTemplate, event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.action-cell button')) {
      return;
    }

    // MODE POPUP : Fermer le dialog avec les données
    if (this.popupMode && this.dialogRef) {
      const foundProcess = this.findProcessByRiskId(risk.id);
      const foundBu = foundProcess ? this.findBuByProcess(foundProcess) : null;

      if (foundProcess && foundBu) {
        const result = {
          bu: { id: foundBu.id, name: foundBu.name },
          process: foundProcess,
          risk: { id: risk.id, name: risk.libelle }
        };
        this.dialogRef.close(result);
        return;
      }
    }

    // MODE NORMAL (non-popup)
    if (!this.cartoMode) {
      this.viewRiskDetails(risk);
      return;
    }

    const hasRiskBrut = risk.riskBrut && risk.riskBrut.length > 0;
    const hasRiskNet = risk.riskNet && risk.riskNet.length > 0;

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
      this.router.navigate(['cartographie', 'evaluation-brute'], {
        queryParams: { data: true, key: sessionStorageKey }
      });
    } else if (!hasRiskNet) {
      this.router.navigate(['cartographie', 'evaluation-nette'], {
        queryParams: {
          data: true,
          key: sessionStorageKey
        }
      });
    } else {
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
    // En mode popup, afficher un tooltip spécifique
    if (this.popupMode) {
      return 'Cliquez pour sélectionner ce risque';
    }

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

  deleteBu(id: string) {
    this.confirmService.openConfirmDialog(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette Business Unit ? Cette action est irréversible."
    ).subscribe(confirm => {
      if (confirm) {
        this.saveExpansionState();
        
        this.entitiesService.delete(id).subscribe({
          next: () => {
            this.snackBarService.info("Business Unit supprimée avec succès !");
            this.selectedBu = null;
            this.selectedBuId = null;
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
    
    this.saveExpansionState();
    
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