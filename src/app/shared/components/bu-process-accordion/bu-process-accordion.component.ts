import { MatMenuModule } from '@angular/material/menu';
import { RiskService } from './../../../core/services/risk/risk.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { ProcessService } from '../../../core/services/process/process.service';
import { Process } from '../../../core/models/Process';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSpinner } from '@angular/material/progress-spinner';
import { AddEntityDialogComponent } from '../../../features/reglages/add-entity-dialog/add-entity-dialog.component';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateProcessComponent } from '../../../features/process/create-process/create-process.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CreateRisksComponent } from '../../../features/reglages/risks/create-risks/create-risks.component';

export interface ProcessNode {
  id: string;
  name: string;
  children?: ProcessNode[];
  enfants?: ProcessNode[]; // risques
  buChildren?: ProcessNode[]; // sous-BU
  type?: 'bu' | 'process' | 'risk' | 'parent' | 'child';
  niveau?: number;
  lm?: string;
  buName?: string;
  parentName?: string;
}

@Component({
  selector: 'app-bu-process-accordion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatSpinner,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './bu-process-accordion.component.html',
  styleUrls: ['./bu-process-accordion.component.scss']
})
export class BuProcessAccordionComponent {
  @Input() consultationMode: 'admin' | 'selection' = 'selection';
  @Input() buId = '';

  @Output() processSelected = new EventEmitter<ProcessNode>();
  @Output() buSelected = new EventEmitter<ProcessNode>();
  @Output() riskSelected = new EventEmitter<any>();

  private riskService = inject(RiskService);
  public data = inject(MAT_DIALOG_DATA, { optional: true }) as { stopAtProcess?: boolean } | null;
  private entityService = inject(EntitiesService);
  private processService = inject(ProcessService);
  private dialogRef = inject(MatDialogRef<BuProcessAccordionComponent>, { optional: true });
  private dialog = inject(MatDialog);
  private snackBarService = inject(SnackBarService);
  private confirmService = inject(ConfirmService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  view: 'bu' | 'process' | 'risks' = 'bu';
  breadcrumb: { id: string; name: string; nodes: ProcessNode[], type: 'bu' | 'process' | 'risks' }[] = [];
  currentNodes: ProcessNode[] = [];
  entities: BusinessUnit[] = [];
  processes: Process[] = [];
  hierarchicalProcesses: any[] = [];
  filteredProcesses: ProcessNode[] = [];

  stopAtProcess: boolean = false;
  searchText: string = "Rechercher un risque";


  // Recherche globale
  searchQuery: string = '';
  searchResults: any[] = [];
  isSearching: boolean = false;
  showSearchResults: boolean = false;
  allRisks: any[] = []; // Cache de tous les risques pour la recherche

  ngOnInit() {
    this.entityService.loadEntitiesTree().subscribe((entitiesTree: any) => {
      this.entities = entitiesTree;
      this.fetchProcesses(entitiesTree);
    });
    if (this.data?.stopAtProcess) {
      this.stopAtProcess = this.data.stopAtProcess
      this.searchText = "Rechercher un processus"
    }
  }

  fetchProcesses(allEntities: BusinessUnit[]): void {
    this.processService.getAll().subscribe((data: any[]) => {
      this.processes = data;
      this.buildHierarchy(allEntities);
      this.filteredProcesses = [...this.hierarchicalProcesses];
      this.currentNodes = this.hierarchicalProcesses;

      // Charger tous les risques pour la recherche
      this.loadAllRisks();

      // Vérifier les query params après avoir construit la hiérarchie
      this.checkQueryParams();
    });
  }

  // Vérifier et traiter les query params
  private checkQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      const buId = params['buId'] || this.buId;
      if (buId) {
        console.log('➡️ BU ID trouvé dans les query params:', buId);
        this.navigateToBuFromQueryParam(buId);
      }
    });
  }

  // Naviguer vers les processus d'une BU depuis les query params
  private navigateToBuFromQueryParam(buId: string): void {
    // Chercher la BU dans la hiérarchie
    const bu = this.findBuById(buId);

    if (bu) {
      console.log('➡️ BU trouvée:', bu);

      // Naviguer directement vers les processus de cette BU
      this.viewProcesses(bu);

      // Optionellement, nettoyer le query param après navigation
      // this.router.navigate([], { 
      //   relativeTo: this.route, 
      //   queryParams: { buId: null }, 
      //   queryParamsHandling: 'merge' 
      // });
    } else {
      console.warn('➡️ BU non trouvée avec l\'ID:', buId);
      this.snackBarService.error('Unité métier non trouvée');
    }
  }

  // Rechercher une BU par son ID dans toute la hiérarchie
  private findBuById(buId: string): any {
    // Chercher dans les BU principales
    for (let bu of this.hierarchicalProcesses) {
      if (bu.id === buId) {
        return bu;
      }

      // Chercher récursivement dans les sous-BU
      const foundInChildren = this.findBuByIdInChildren(bu.buChildren || [], buId);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
    return null;
  }

  // Recherche récursive dans les sous-BU
  private findBuByIdInChildren(buChildren: any[], buId: string): any {
    for (let child of buChildren) {
      if (child.id === buId) {
        return child;
      }

      if (child.buChildren?.length) {
        const found = this.findBuByIdInChildren(child.buChildren, buId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Charger tous les risques pour la recherche globale
  private loadAllRisks(): void {
    const processIds = this.processes.map(p => p.id);
    const riskPromises = processIds.map(processId =>
      this.riskService.getRisksTreeByProcessId(processId).toPromise()
    );

    Promise.allSettled(riskPromises).then(results => {
      this.allRisks = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.length) {
          const processId = processIds[index];
          const process = this.processes.find(p => p.id === processId);
          const bu = this.findBuByProcessId(processId);

          result.value.forEach((risk: any) => {
            this.addRiskToCache(risk, process, bu);
          });
        }
      });
    });
  }

  private addRiskToCache(risk: any, process: any, bu: any): void {
    this.allRisks.push({
      ...risk,
      processId: process?.id,
      processName: process?.name,
      buId: bu?.id,
      buName: bu?.name,
      type: 'risk'
    });

    // Ajouter récursivement les sous-risques
    if (risk.enfants?.length) {
      risk.enfants.forEach((subRisk: any) => {
        this.addRiskToCache(subRisk, process, bu);
      });
    }
  }

  private findBuByProcessId(processId: string): any {
    for (let bu of this.hierarchicalProcesses) {
      const process = this.findProcessInBu(bu, processId);
      if (process) return bu;

      // Chercher dans les sous-BU
      if (bu.buChildren) {
        const result = this.findBuInChildren(bu.buChildren, processId);
        if (result) return result;
      }
    }
    return null;
  }

  private findProcessInBu(bu: any, processId: string): any {
    if (bu.children) {
      for (let process of bu.children) {
        if (process.id === processId) return process;
        if (process.children) {
          const found = this.findProcessInChildren(process.children, processId);
          if (found) return found;
        }
      }
    }
    return null;
  }

  private findBuInChildren(buChildren: any[], processId: string): any {
    for (let child of buChildren) {
      const process = this.findProcessInBu(child, processId);
      if (process) return child;

      if (child.buChildren) {
        const result = this.findBuInChildren(child.buChildren, processId);
        if (result) return result;
      }
    }
    return null;
  }

  private findProcessInChildren(children: any[], processId: string): any {
    for (let child of children) {
      if (child.id === processId) return child;
      if (child.children) {
        const found = this.findProcessInChildren(child.children, processId);
        if (found) return found;
      }
    }
    return null;
  }

  buildHierarchy(allEntities: BusinessUnit[]): void {
    const buMap = new Map<string, Process[]>();

    this.processes.forEach(process => {
      const buName = process.buName || 'Sans BU';
      if (!buMap.has(buName)) {
        buMap.set(buName, []);
      }
      buMap.get(buName)!.push(process);
    });

    this.hierarchicalProcesses = allEntities.map(entity => {
      const processes = buMap.get(entity.name) || [];
      return {
        id: entity.id,
        name: entity.name,
        lm: entity.lm,
        niveau: (entity as any).niveau ?? 1,
        type: 'bu' as const,
        buChildren: this.buildBuHierarchy(entity.children || [], buMap),
        children: this.buildBUChildren(processes)
      };
    });
  }

  private buildBuHierarchy(buChildren: any[], buMap: Map<string, Process[]>): ProcessNode[] {
    if (!buChildren?.length) return [];

    return buChildren.map(child => {
      const childProcesses = buMap.get(child.name) || [];
      return {
        id: child.id,
        name: child.name,
        lm: child.lm,
        niveau: child.niveau,
        type: 'bu' as const,
        parentId: child.parentId,
        // Récursivement construire les sous-BU
        buChildren: this.buildBuHierarchy(child.children || [], buMap),
        // Construire les processus de cette BU
        children: this.buildBUChildren(childProcesses.length > 0 ? childProcesses : (child.process || []))
      };
    });
  }

  private buildBUChildren(processes: any[]): ProcessNode[] {
    if (!processes?.length) return [];

    const parents = processes.filter(p => !p.parentName);
    const children = processes.filter(p => p.parentName);

    return parents.map(parent => ({
      id: parent.id,
      lm: parent.lm,
      name: parent.name,
      niveau: parent.niveau,
      type: 'process' as const,
      buName: parent.buName,
      parentName: parent.parentName,
      children: this.findChildren(parent.name, children)
    }));
  }

  private findChildren(parentName: string, allChildren: any[]): ProcessNode[] {
    const directChildren = allChildren.filter(child => child.parentName === parentName);

    return directChildren.map(child => ({
      id: child.id,
      lm: child.lm,
      name: child.name,
      niveau: child.niveau,
      type: 'process' as const,
      buName: child.buName,
      parentName: child.parentName,
      children: this.findChildren(child.name, allChildren.filter(c => c.id !== child.id))
    }));
  }

  get breadcrumbDisplay(): string {
    return this.breadcrumb.map(b => b.name).join(' > ');
  }

  // ---- Navigation avec les flèches (descente dans la hiérarchie) ----
  enterNode(node: ProcessNode) {

    let children: ProcessNode[] = [];
    let newView: 'bu' | 'process' | 'risks' = this.view; // On garde la même vue par défaut

    if (this.view === 'bu' && node.buChildren?.length) {
      // Navigation dans les sous-BU - on reste en vue BU
      children = node.buChildren;
      newView = 'bu';
    } else if (this.view === 'process' && node.children?.length) {
      // Navigation dans les sous-processus - on reste en vue process
      children = node.children;
      newView = 'process';
    } else if (this.view === 'risks' && node.enfants?.length) {
      // Navigation dans les sous-risques - on reste en vue risks
      children = node.enfants;
      newView = 'risks';
    } else {
      // Nœud feuille - émettre l'événement approprié
      this.emitSelection(node);
      return;
    }

    if (children.length) {
      this.currentNodes = children;
      this.view = newView;
      this.breadcrumb.push({
        id: node.id,
        name: node.name,
        nodes: children,
        type: newView // Le type correspond à la vue, pas au type du nœud
      });
    }
  }

  // ---- Navigation avec les boutons "Voir les ..." (passage d'un type à l'autre) ----
  viewNextLevel(node: ProcessNode) {

    if (this.view === 'bu') {
      // De BU vers processus
      this.viewProcesses(node);
    } else if (this.view === 'process') {
      // si on veut s'arrêter au processus, on émet et on s'arrête
      if (this.stopAtProcess && this.consultationMode === 'selection') {
        const result = {
          bu: this.breadcrumb.find(b => b.type === 'process' || b.type === 'bu'),
          process: node
        };

        // Si ouvert dans un dialog → on ferme
        if (this.dialogRef) {
          this.dialogRef.close(result);
        } else {
          this.processSelected.emit(node);
        }
        return;
      }
      // Sinon, comportement normal : on affiche les risques
      this.viewRisks(node);
    }
  }

  private viewProcesses(bu: ProcessNode) {

    // Vérifier d'abord dans `children` (processus construits via buildBUChildren)
    let processes = bu.children;

    // Si pas de processus dans children, vérifier dans la propriété `process` directe
    if (!processes?.length && (bu as any).process?.length) {
      processes = this.buildBUChildren((bu as any).process);
    }

    if (processes?.length) {
      this.view = 'process'; // CHANGEMENT DE VUE : de BU vers process
      this.currentNodes = processes;
      this.breadcrumb = [{
        id: bu.id,
        name: bu.name,
        nodes: processes,
        type: 'process' // On passe en vue process
      }];
      this.buSelected.emit(bu);
    } else {
      this.snackBarService.info('Aucun processus associé à cette BU.');
    }
  }

  private viewRisks(process: ProcessNode) {

    this.riskService.getRisksTreeByProcessId(process.id).subscribe({
      next: (risks) => {
        const riskNodes = risks.map(r => ({
          id: r.id,
          name: r.libelle,
          enfants: r.enfants,
          type: 'risk' as const
        }));

        this.view = 'risks'; // CHANGEMENT DE VUE : de process vers risks
        this.currentNodes = riskNodes;
        this.breadcrumb.push({
          id: process.id,
          name: process.name,
          nodes: riskNodes,
          type: 'risks' // On passe en vue risks
        });
        // if (riskNodes.length) {
        // } else {
        //   this.snackBarService.info('Aucun risque associé à ce processus.');
        // }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des risques:', error);
        this.snackBarService.info("Erreur lors du chargement des risques");
      }
    });
  }

  private emitSelection(node: ProcessNode) {
    switch (this.view) {
      case 'bu':
        this.buSelected.emit(node);
        break;
      case 'process':
        this.processSelected.emit(node);
        break;
      case 'risks':
        this.riskSelected.emit(node);
        break;
    }
  }

  // ---- Navigation dans le fil d'Ariane ----
  jumpTo(index: number) {

    if (index === -1) {
      // Retour à la vue initiale
      this.view = 'bu';
      this.breadcrumb = [];
      this.currentNodes = this.hierarchicalProcesses;
    } else {
      this.breadcrumb = this.breadcrumb.slice(0, index + 1);
      const target = this.breadcrumb[index];
      this.currentNodes = target.nodes;
      this.view = target.type;
    }
  }

  back() {

    if (this.breadcrumb.length > 0) {
      this.breadcrumb.pop();

      if (this.breadcrumb.length > 0) {
        const last = this.breadcrumb[this.breadcrumb.length - 1];
        this.currentNodes = last.nodes;
        this.view = last.type;
      } else {
        // Retour à la vue initiale des BU
        this.view = 'bu';
        this.currentNodes = this.hierarchicalProcesses;
      }
    }
  }

  // Helper methods pour le template
  hasChildren(node: ProcessNode): boolean {
    if (this.view === 'bu') {
      return !!(node.buChildren?.length); // Flèche seulement s'il y a des sous-BU
    } else if (this.view === 'process') {
      return !!(node.children?.length); // Flèche seulement s'il y a des sous-processus
    } else if (this.view === 'risks') {
      return !!(node.enfants?.length); // Flèche seulement s'il y a des sous-risques
    }
    return false;
  }

  canViewNextLevel(node: ProcessNode): boolean {
    if (this.view === 'bu') {
      // Une BU peut avoir des processus soit dans `children` soit dans `process`
      return !!(node.children?.length || (node as any).process?.length);
    }
    if (this.view === 'process') {
      return true; // Peut toujours essayer de voir les risques depuis un processus
    }
    return false;
  }

  getNextLevelButtonText(node: any): string {
    if (this.view === 'bu') {
      const processCount = node.children?.length || 0;
      return this.consultationMode == 'admin' ? 'Voir les processus ' : 'Sélectionner la BU (' + processCount + ')';
    }
    if (this.view === 'process') {
      return this.consultationMode == 'admin' ? 'Voir les risques' : 'Sélectionner le process';
    }
    return 'Voir';
  }

  getViewTitle(): string {
    switch (this.view) {
      case 'bu': return 'Unités Métiers';
      case 'process': return 'Processus';
      case 'risks': return 'Evenements de Risques';
      default: return '';
    }
  }

  selectRisk(node: ProcessNode) {
    const firstProcess = this.breadcrumb.find(b => b.type === 'process');
    const firstRisks = this.breadcrumb.find(b => b.type === 'risks');

    const obj = {
      bu: firstProcess,
      process: firstRisks,
      risk: node
    }

    if (this.consultationMode == 'admin') {
      this.navToRisk(node.id);
    }
    else {
      if (this.dialogRef) {
        this.dialogRef.close(obj);
      }
      else {
        this.riskSelected.emit(obj);
      }
    }
  }

  // ---- Fonctions de recherche ----
  onSearchInput(event: any): void {
    this.searchQuery = event.target.value.trim();
    if (this.searchQuery.length >= 2) {
      this.stopAtProcess ? this.performSearchProcess() : this.performSearch();
    } else {
      this.clearSearch();
    }
  }

  private performSearchProcess(): void {
    this.isSearching = true;
    this.showSearchResults = true;

    // Recherche dans tous les processus disponibles
    const processResults = this.processes
      .filter(p =>
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      .map(p => {
        // Trouver la BU associée
        const bu = this.findBuByProcessId(p.id);
        return {
          id: p.id,
          name: p.name,
          buId: bu?.id,
          buName: bu?.name,
          displayType: 'Processus',
          fullPath: bu ? `${bu.name} > ${p.name}` : p.name,
          type: 'process'
        };
      });

    this.searchResults = processResults.slice(0, 10); // Limiter à 10 résultats
    this.isSearching = false;
    console.log('➡️ Résultats de recherche de processus:', this.searchResults);
  }


  private performSearch(): void {
    this.isSearching = true;
    this.showSearchResults = true;

    // Rechercher dans les risques
    const riskResults = this.allRisks.filter(risk =>
      risk.libelle.toLowerCase().includes(this.searchQuery.toLowerCase())
    ).map(risk => ({
      ...risk,
      displayType: 'Risque',
      fullPath: `${risk.buName} > ${risk.processName} > ${risk.libelle}`
    }));

    this.searchResults = [
      ...riskResults.slice(0, 5),
    ];

    this.isSearching = false;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  selectSearchResult(result: any): void {
    console.log('➡️ Sélection depuis la recherche:', result);

    if (result.type === 'risk') {
      const obj = {
        bu: { id: result.buId, name: result.buName },
        process: { id: result.processId, name: result.processName },
        risk: result
      };
      if (this.dialogRef) this.dialogRef.close(obj);
      else this.riskSelected.emit(obj);
    }

    if (result.type === 'process') {
      const obj = {
        bu: { id: result.buId, name: result.buName },
        process: result
      };

      if (this.dialogRef) this.dialogRef.close(obj);
      else this.processSelected.emit(result);
    }

    this.clearSearch();
  }


  deleteBu(id: string) {
    this.confirmService.openConfirmDialog("Confirmer la suppression", "Êtes-vous sûr de vouloir supprimer ce processus ? Cette action est irréversible.")
      .subscribe(confirm => {
        if (confirm) {
          this.entityService.delete(id).subscribe({
            next: () => {
              this.snackBarService.info("Processus supprimé avec succès !");
              this.ngOnInit();
            },
            error: (err) => {
              this.snackBarService.error("Erreur lors de la suppression du processus : " + err.message);
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
      width: '500px',
      data: entite || null
    }).afterClosed().subscribe(bu => {
      if (bu) {
        if (bu.id) {
          this.entityService.update(bu).subscribe(_ => {
            this.ngOnInit();
            this.snackBarService.info("Entité modifiée avec succès !");
          });
        }
        else {
          this.entityService.save(bu).subscribe(_ => {
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

  openProcessDialog(process?: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.dialog.open(CreateProcessComponent, {
      width: '600px !important',
      data: process || null
    }).afterClosed().subscribe(_ => {
      this.ngOnInit();
    });
  }

  deleteProcess(id: string): void {
    this.confirmService.openConfirmDialog("Confirmer la suppression", "Êtes-vous sûr de vouloir supprimer ce processus ? Cette action est irréversible.")
      .subscribe(confirm => {
        if (confirm) {
          this.processService.delete(id).subscribe({
            next: () => {
              this.snackBarService.info("Processus supprimé avec succès !");
              this.ngOnInit();
            },
            error: (err) => {
              this.snackBarService.error("Erreur lors de la suppression du processus : " + err.message);
            }
          });
        }
      });
  }

  addRisk(id: string): void {
    this.router.navigate(['reglages', 'risks', 'create'], { queryParams: { processId: id } });
  }

  addRiskReferentiel(id: string): void {
    this.router.navigate(['reglages', 'risks', 'create-referentiel'], { queryParams: { processId: id } });
  }


  navToRisk(id: string) {
    this.router.navigate(['reglages', 'risks', id]);
  }

  addProcess(buId: string) {
    this.dialog.open(CreateProcessComponent,
      {
        width: '800px',
        data: { buId: buId }
      }
    ).afterClosed().subscribe(p => {
      this.processService.createProcess(p).subscribe(resp => {
        this.ngOnInit();
      },
        error => {
          this.ngOnInit();
        });
    });
  }

  getTooltip(view: string): string {
    const isAdmin = this.consultationMode === 'admin';

    switch (view) {
      case 'bu':
        return isAdmin
          ? 'Consulter les processus de la BU'
          : 'Sélectionner la BU';
      case 'process':
        return isAdmin
          ? 'Consulter les risques du processus'
          : 'Sélectionner le processus';
      case 'risks':
        return isAdmin
          ? 'Consulter le risque'
          : 'Sélectionner le risque';
      default:
        return isAdmin
          ? 'Gérer l\'élément'
          : 'Voir les détails de l\'élément';
    }
  }

  createNewEvent(): void {
    const buId = this.breadcrumb.find(b => b.type === 'process')?.id;
    const processId = this.breadcrumb.find(b => b.type === 'risks')?.id;
    const redirect = this.router.url;

    const dialogRef = this.dialog.open(CreateRisksComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { processId, buId, redirect },
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const node = {
          id: result.createdEventId, name: result.libelle, isInfo: true
        }
        this.selectRisk(node)
        this.refreshCurrentRisks(processId || '');
        // Recharger le cache pour la recherche
        this.loadAllRisks();
      }
    });
  }

  private refreshCurrentRisks(processId: string): void {
    if (!processId || this.view !== 'risks') return;

    this.riskService.getRisksTreeByProcessId(processId).subscribe({
      next: (risks) => {
        const riskNodes = risks.map(r => ({
          id: r.id,
          name: r.libelle,
          enfants: r.enfants,
          type: 'risk' as const
        }));

        // Mettre à jour les nœuds actuels
        this.currentNodes = riskNodes;

        // Mettre à jour le breadcrumb
        if (this.breadcrumb.length > 0) {
          this.breadcrumb[this.breadcrumb.length - 1].nodes = riskNodes;
        }

        this.snackBarService.info('Liste des risques actualisée');
      },
      error: (error) => {
        console.error('Erreur lors du rechargement des risques:', error);
        this.snackBarService.error('Erreur lors du rechargement');
      }
    });
  }
}