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
import { MatDialogRef } from '@angular/material/dialog';
import { PopupEvaluationControleComponent } from '../../../pages/control-details-page/popup-evaluation-controle/popup-evaluation-controle/popup-evaluation-controle.component';
import { MatSpinner } from '@angular/material/progress-spinner';

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
    MatSpinner
  ],
  templateUrl: './bu-process-accordion.component.html',
  styleUrls: ['./bu-process-accordion.component.scss']
})
export class BuProcessAccordionComponent {
  @Input() consultationMode: 'admin' | 'selection' = 'selection';
  @Output() processSelected = new EventEmitter<ProcessNode>();
  @Output() buSelected = new EventEmitter<ProcessNode>();
  @Output() riskSelected = new EventEmitter<any>();

  private riskService = inject(RiskService);
  private entityService = inject(EntitiesService);
  private processService = inject(ProcessService);
  private dialogRef = inject(MatDialogRef<BuProcessAccordionComponent>, { optional: true });

  view: 'bu' | 'process' | 'risks' = 'bu';
  breadcrumb: { id: string; name: string; nodes: ProcessNode[], type: 'bu' | 'process' | 'risks' }[] = [];
  currentNodes: ProcessNode[] = [];
  entities: BusinessUnit[] = [];
  processes: Process[] = [];
  hierarchicalProcesses: any[] = [];
  filteredProcesses: ProcessNode[] = [];

  ngOnInit() {
    this.entityService.loadEntitiesTree().subscribe((entitiesTree: any) => {
      this.entities = entitiesTree;
      console.log('➡️ Entités chargées :', entitiesTree);
      this.fetchProcesses(entitiesTree);
    });
  }

  fetchProcesses(allEntities: BusinessUnit[]): void {
    this.processService.getAll().subscribe((data: any[]) => {
      this.processes = data;
      this.buildHierarchy(allEntities);
      this.filteredProcesses = [...this.hierarchicalProcesses];
      this.currentNodes = this.hierarchicalProcesses;
    });
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

    console.log(allEntities);
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
    console.log('➡️ hiérarchie des processus construite :', this.hierarchicalProcesses);
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
    console.log('Entering node:', node, 'Current view:', this.view);

    let children: ProcessNode[] = [];
    let newView: 'bu' | 'process' | 'risks' = this.view; // On garde la même vue par défaut

    if (this.view === 'bu' && node.buChildren?.length) {
      // Navigation dans les sous-BU - on reste en vue BU
      children = node.buChildren;
      newView = 'bu';
      console.log('Navigating to sub-BUs:', children);
    } else if (this.view === 'process' && node.children?.length) {
      // Navigation dans les sous-processus - on reste en vue process
      children = node.children;
      newView = 'process';
      console.log('Navigating to sub-processes:', children);
    } else if (this.view === 'risks' && node.enfants?.length) {
      // Navigation dans les sous-risques - on reste en vue risks
      children = node.enfants;
      newView = 'risks';
      console.log('Navigating to sub-risks:', children);
    } else {
      // Nœud feuille - émettre l'événement approprié
      console.log('Leaf node reached, emitting selection');
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
      console.log('Updated breadcrumb:', this.breadcrumb);
      console.log('New view:', this.view);
    }
  }

  // ---- Navigation avec les boutons "Voir les ..." (passage d'un type à l'autre) ----
  viewNextLevel(node: ProcessNode) {
    console.log('Viewing next level for:', node, 'Current view:', this.view);

    if (this.view === 'bu') {
      // De BU vers processus
      this.viewProcesses(node);
    } else if (this.view === 'process') {
      // De processus vers risques
      this.viewRisks(node);
    }
  }

  private viewProcesses(bu: ProcessNode) {
    console.log('Viewing processes for BU:', bu);

    // Vérifier d'abord dans `children` (processus construits via buildBUChildren)
    let processes = bu.children;

    // Si pas de processus dans children, vérifier dans la propriété `process` directe
    if (!processes?.length && (bu as any).process?.length) {
      processes = this.buildBUChildren((bu as any).process);
    }

    if (processes?.length) {
      this.view = 'process'; // CHANGEMENT DE VUE : de BU vers process
      this.currentNodes = processes;
      this.breadcrumb.push({
        id: bu.id,
        name: bu.name,
        nodes: processes,
        type: 'process' // On passe en vue process
      });
      this.buSelected.emit(bu);
      console.log('Switched to process view, breadcrumb:', this.breadcrumb);
    } else {
      alert('Aucun processus associé à cette BU.');
    }
  }

  private viewRisks(process: ProcessNode) {
    console.log('Viewing risks for process:', process);

    this.riskService.getRisksTreeByProcessId(process.id).subscribe({
      next: (risks) => {
        const riskNodes = risks.map(r => ({
          id: r.id,
          name: r.name,
          enfants: r.enfants,
          type: 'risk' as const
        }));

        if (riskNodes.length) {
          this.view = 'risks'; // CHANGEMENT DE VUE : de process vers risks
          this.currentNodes = riskNodes;
          this.breadcrumb.push({
            id: process.id,
            name: process.name,
            nodes: riskNodes,
            type: 'risks' // On passe en vue risks
          });
          console.log('Switched to risks view, breadcrumb:', this.breadcrumb);
        } else {
          alert('Aucun risque associé à ce processus.');
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des risques:', error);
        alert('Erreur lors du chargement des risques.');
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
    console.log('Jumping to index:', index, 'Current breadcrumb:', this.breadcrumb);

    if (index === -1) {
      // Retour à la vue initiale
      this.view = 'bu';
      this.breadcrumb = [];
      this.currentNodes = this.hierarchicalProcesses;
      console.log('Reset to initial BU view');
    } else {
      this.breadcrumb = this.breadcrumb.slice(0, index + 1);
      const target = this.breadcrumb[index];
      this.currentNodes = target.nodes;
      this.view = target.type;
      console.log('Jumped to:', target, 'New view:', this.view);
    }
  }

  back() {
    console.log('Going back, current breadcrumb:', this.breadcrumb);

    if (this.breadcrumb.length > 0) {
      this.breadcrumb.pop();

      if (this.breadcrumb.length > 0) {
        const last = this.breadcrumb[this.breadcrumb.length - 1];
        this.currentNodes = last.nodes;
        this.view = last.type;
        console.log('Went back to:', last, 'New view:', this.view);
      } else {
        // Retour à la vue initiale des BU
        this.view = 'bu';
        this.currentNodes = this.hierarchicalProcesses;
        console.log('Went back to initial BU view');
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
      return this.consultationMode == 'admin' ? 'Voir les processus ' : 'Sélectionner la BU ' + '(' + node.children.length + ')';
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
      case 'risks': return 'Risques';
      default: return '';
    }
  }

  selectRisk(node: ProcessNode) {
    const firstProcess = this.breadcrumb.find(b => b.type === 'process');
    const firstRisks = this.breadcrumb.find(b => b.type === 'risks');

    console.log('➡️ Bu sélectionné:', firstProcess);
    console.log('➡️ Process sélectionné:', firstRisks);
    console.log('➡️ Risque sélectionné:', node);

    const obj = {
      bu: firstProcess,
      process: firstRisks,
      risk: node
    }
    if (this.dialogRef) {
      this.dialogRef.close(obj)
    }
    else {
      this.riskSelected.emit(obj);
    }

  }
}