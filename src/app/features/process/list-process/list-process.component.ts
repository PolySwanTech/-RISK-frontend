import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ProcessService } from '../../../core/services/process/process.service';
import { GoBackButton, GoBackComponent } from '../../../shared/components/go-back/go-back.component';

import { Process, ProcessNode } from '../../../core/models/Process';
import { MatDialog } from '@angular/material/dialog';
import { CreateProcessComponent } from '../create-process/create-process.component';
import { RiskService } from '../../../core/services/risk/risk.service';
import { AddEntityDialogComponent } from '../../reglages/add-entity-dialog/add-entity-dialog.component';
import { BusinessUnit } from '../../../core/models/BusinessUnit';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { MatCardModule } from '@angular/material/card';
import { RiskEvaluationService } from '../../../core/services/risk-evaluation/risk-evaluation/risk-evaluation.service';
import { firstValueFrom } from 'rxjs';
import { SnackBarService } from '../../../core/services/snack-bar/snack-bar.service';
import { ConfirmService } from '../../../core/services/confirm/confirm.service';
import { MatBadgeModule } from '@angular/material/badge';
import { RiskEvaluation } from '../../../core/models/RiskEvaluation';
import { BuProcessAccordionComponent } from "../../../shared/components/bu-process-accordion/bu-process-accordion.component";

@Component({
  selector: 'app-list-process',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCardModule,
    GoBackComponent,
    MatBadgeModule,
    BuProcessAccordionComponent
],
  templateUrl: './list-process.component.html',
  styleUrl: './list-process.component.scss'
})
export class ListProcessComponent implements OnInit {
  processService = inject(ProcessService);
  confirmService = inject(ConfirmService);
  router = inject(Router);
  private dialog = inject(MatDialog);
  riskService = inject(RiskService); // Assuming you have a risk service to fetch risks
  riskEvaluationService = inject(RiskEvaluationService);
  entityService = inject(EntitiesService);
  snackBarService = inject(SnackBarService);
  private route = inject(ActivatedRoute);

  processes: Process[] = [];
  displayedColumns: string[] = ['name', 'niveau', 'buName', 'parentName'];
  hierarchicalProcesses: ProcessNode[] = [];
  filteredProcesses: ProcessNode[] = [];
  expandedNodes: Set<string> = new Set();
  searchTerm: string = '';
  years: number[] = [];
  selectedYear: number = new Date().getFullYear();
  entities: BusinessUnit[] = [];

  @Input() isCartographie: boolean = false;

  goBackButtons: GoBackButton[] = [];

  ngOnInit(): void {

    this.hierarchicalProcesses = [];
    this.expandedNodes.clear();
    this.entityService.loadEntities().subscribe((entities: BusinessUnit[]) => {
      this.entities = entities;
      this.fetchProcesses(entities);
    });

    this.goBackButtons = [
      {
        label: 'Nouveau Processus',
        icon: 'add',
        class: 'btn-primary',
        show: true,
        action: () => this.add()
      },
      {
        label: 'Ajouter une entité',
        icon: 'add',
        class: 'btn-primary',
        show: true,
        action: () => this.openEntityDialog()
      },
      {
        label: 'Nouvelle cartographie',
        icon: 'add',
        class: 'btn-primary',
        show: this.isCartographie,
        action: () => this.navToCreateCarto()
      }
    ];

    this.route.queryParams.subscribe(params => {
      if (params['buId'] !== undefined) {
        this.add(params['buId']);
      }
    });
  }

  fetchProcesses(allEntities: BusinessUnit[]): void {
    this.processService.getAll().subscribe((data: any[]) => {
      this.processes = data;
      this.buildHierarchy(allEntities);
      this.filteredProcesses = [...this.hierarchicalProcesses];
    });
  }

  async getEvaluationYears() {
    return await firstValueFrom(this.riskEvaluationService.getYearsOfEvaluation())
  }

  selectYear(year: number) {
    // TODO : get les evaluations pour cette année
    this.selectedYear = year;
    this.riskEvaluationService.getAll(this.selectedYear).subscribe(evaluations => {
      // 2. Pour chaque process
      this.filteredProcesses.forEach(bu => {
        // 3. Pour chaque risque de ce process
        bu.children?.forEach(process => {
          process.risks?.forEach((risk: { id: { id: any; }; riskEvaluations: RiskEvaluation[]; }) => {
            var rId = risk.id.id;
            risk.riskEvaluations = evaluations.filter(e => e.riskId === rId);
          });
        });
      });
    });
  }


  getRisks(event: any, process: Process) {
    event.stopPropagation();
    if (!process.risks || process.risks.length === 0) {
      this.riskService.getAllByProcess(process.id, this.selectedYear).subscribe(risks => {
        process.risks = risks;
      });
    }
    else {
      process.risks = [];
    }

  }

  getRiskClass(level: string): string {
    return ""
    // return level.toLowerCase().replace('é', 'e');
  }

  add(buId?: string): void {
    const dialogRef = this.dialog.open(CreateProcessComponent, {
      width: '600px !important',
      height: '550px',
      minWidth: '600px',
      maxWidth: '600px',
      data: { buId: buId || null }
    });
    dialogRef.afterClosed().subscribe(_ => {
      this.ngOnInit(); // Refresh the list after adding a new process
    });
  }

  addRisk(id: string): void {
    this.router.navigate(['reglages', 'risks', 'create'], { queryParams: { processId: id } });
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

  navToRisk(id: number) {
    this.router.navigate(['reglages', 'risks', id]);
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

    this.hierarchicalProcesses = allEntities
      .filter(entity => !this.isCartographie || buMap.has(entity.name)) // 💡 Le filtre
      .map(entity => {
        const processes = buMap.get(entity.name) || [];
        return {
          id: entity.id,
          name: entity.name,
          lm: entity.lm,
          niveau: (entity as any).niveau ?? 1,
          type: 'bu' as const,
          children: this.buildBUChildren(processes)
        };
      });

    if (!this.isCartographie) {
      const orphanProcesses = buMap.get('Sans BU');
      if (orphanProcesses) {
        this.hierarchicalProcesses.push({
          id: `bu-no-bu`,
          lm: false,
          name: 'Sans BU',
          niveau: 1,
          type: 'bu' as const,
          children: this.buildBUChildren(orphanProcesses)
        });
      }
    }
  }

  private buildBUChildren(processes: any[]): ProcessNode[] {
    // Séparer les parents (pas de parentName) des enfants
    const parents = processes.filter(p => !p.parentName);
    const children = processes.filter(p => p.parentName);

    return parents.map(parent => ({
      id: parent.id,
      lm: parent.lm,
      name: parent.name,
      niveau: parent.niveau,
      type: this.determineNodeType(parent),
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
      type: this.determineNodeType(child),
      buName: child.buName,
      parentName: child.parentName,
      children: this.findChildren(child.name, allChildren.filter(c => c.id !== child.id))
    }));
  }

  private determineNodeType(process: any): 'parent' | 'child' {
    // Si le processus a un parent, c'est un enfant, sinon c'est un parent
    return process.parentName ? 'child' : 'parent';
  }

  toggleNode(nodeId: string): void {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
  }

  isExpanded(nodeId: string): boolean {
    return this.expandedNodes.has(nodeId);
  }

  hasChildren(node: ProcessNode): boolean {
    return !!(node.children && node.children.length > 0);
  }

  getChildrenCount(node: ProcessNode): number {
    return node.children ? node.children.length : 0;
  }

  getNodeIcon(type: string): string {
    switch (type) {
      case 'bu':
        return 'business';
      case 'parent':
        return 'folder';
      case 'child':
        return 'description';
      default:
        return 'description';
    }
  }

  getNodeClasses(node: ProcessNode): string {
    const classes = [`node-${node.type}`, `level-${node.niveau}`];

    if (this.hasChildren(node)) {
      classes.push('has-children');
    }

    if (this.isExpanded(node.id)) {
      classes.push('expanded');
    }

    return classes.join(' ');
  }

  onSearch(event: any): void {
    const term = event.target.value.toLowerCase();
    this.searchTerm = term;

    if (!term) {
      this.filteredProcesses = [...this.hierarchicalProcesses];
      return;
    }

    // Filtrer et garder la structure hiérarchique
    this.filteredProcesses = this.filterHierarchy(this.hierarchicalProcesses, term);
  }

  private filterHierarchy(nodes: ProcessNode[], searchTerm: string): ProcessNode[] {
    return nodes.reduce((filtered: ProcessNode[], node) => {
      const nodeMatches = node.name.toLowerCase().includes(searchTerm);
      const filteredChildren = node.children ? this.filterHierarchy(node.children, searchTerm) : [];

      if (nodeMatches || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        });

        // Auto-expand si des enfants matchent
        if (filteredChildren.length > 0) {
          this.expandedNodes.add(node.id);
        }
      }

      return filtered;
    }, []);
  }

  navToCreate(): void {
    this.router.navigate(['reglages', 'process', 'create']);
  }

  navToEdit(id: string): void {
    this.router.navigate(['reglages', 'process', id]);
  }

  openEntityDialog(entite?: any, event?: Event) {
    if (event) {
      event.stopPropagation(); // Empêche la propagation du clic
    }
    this.dialog.open(AddEntityDialogComponent, {
      width: '500px',
      data: entite || null // Passe l'entité si c'est une modification, sinon null
    }).afterClosed().subscribe(bu => {
      if (bu) {
        if (bu.id) {
          // modification
          this.entityService.update(bu).subscribe(_ => {
            this.ngOnInit()
            this.snackBarService.info("Entité modifiée avec succès !")
          })
        }
        else {
          this.entityService.save(bu).subscribe(_ => {
            this.ngOnInit()
            this.snackBarService.info("Entité ajoutée avec succès !")
          })
        }
      }
    });
  }

  openProcessDialog(process?: any, event?: Event) {
    if (event) {
      event.stopPropagation(); // Empêche la propagation du clic
    }
    this.dialog.open(CreateProcessComponent, {
      width: '600px !important',
      data: process || null
    }).afterClosed().subscribe(_ => {
      this.ngOnInit();
    });
  }

  navToCreateCarto() {
    this.router.navigate(['reglages', 'evaluation', 'create'])
  }

  goToMatrixPage(buId: any) {
    this.router.navigate(['risk', buId])
  }

  loadProcesses(bu: any) {
    this.processService.getProcessLeaf(bu.id).subscribe(processes => {
    bu.children = processes;
  });
}

// loadRisksAndChildren(process: ProcessNode) {
//   this.processService.getChildren(process.id).subscribe(children => {
//     process.children = children;
//   });

//   this.processService.getRisksByProcess(process.id).subscribe(risks => {
//     process.risks = risks;
//   });
// }

onRiskSelected(risk: any) {
  console.log('➡️ Risque sélectionné :', risk);
}

test(event : any){
  console.log(event)
}
}