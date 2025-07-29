import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ProcessService } from '../../../core/services/process/process.service';
import { GoBackComponent } from '../../../shared/components/go-back/go-back.component';

interface ProcessNode {
  id: string;
  name: string;
  niveau: number;
  type: 'bu' | 'parent' | 'child';
  buName?: string;
  parentName?: string;
  children?: ProcessNode[];
}
import { Process } from '../../../core/models/Process';
import { MatDialog } from '@angular/material/dialog';
import { CreateProcessComponent } from '../create-process/create-process.component';
import { RiskService } from '../../../core/services/risk/risk.service';
import { AddEntityDialogComponent } from '../../reglages/add-entity-dialog/add-entity-dialog.component';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { MatCardModule } from '@angular/material/card';

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
    MatCardModule
  ],
  templateUrl: './list-process.component.html',
  styleUrl: './list-process.component.scss'
})
export class ListProcessComponent implements OnInit {
  processService = inject(ProcessService);
  router = inject(Router);
  private dialog = inject(MatDialog);
  riskService = inject(RiskService); // Assuming you have a risk service to fetch risks
  entityService = inject(EntitiesService);

  processes: Process[] = [];
  displayedColumns: string[] = ['name', 'niveau', 'buName', 'parentName'];
  hierarchicalProcesses: ProcessNode[] = [];
  filteredProcesses: ProcessNode[] = [];
  expandedNodes: Set<string> = new Set();
  searchTerm: string = '';

  @Input() isCartographie: boolean = false;

  ngOnInit(): void {
     this.entityService.loadEntities().subscribe((entities: EntiteResponsable[]) => {
    this.fetchProcesses(entities);
  });
  }

  fetchProcesses(allEntities: EntiteResponsable[]): void {
  this.processService.getAll().subscribe((data: any[]) => {
    this.processes = data;
    this.buildHierarchy(allEntities);
    this.filteredProcesses = [...this.hierarchicalProcesses];
  });
}


  getRisks(event: any, process: Process) {
    event.stopPropagation();
    if (!process.risks || process.risks.length === 0) {
      this.riskService.getAllByProcess(process.id).subscribe(risks => {
        console.table(risks);
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

  add() {
    const dialogRef = this.dialog.open(CreateProcessComponent, {
      width: '600px !important',
      height: '550px',
      minWidth: '600px',
      maxWidth: '600px',
    });
    dialogRef.afterClosed().subscribe((needRefresh: boolean) => {
      if (needRefresh) {
        this.ngOnInit(); // Refresh the list after adding a new process
      }
    });
  }

  addRisk(id: string): void {
    this.router.navigate(['reglages', 'risks', 'create', id]);
  }

  navToRisk(id: number) {
    this.router.navigate(['reglages', 'risks', id]);
  }

buildHierarchy(allEntities: EntiteResponsable[]): void {
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
        id: `bu-${entity.name}`,
        name: entity.name,
        niveau: 0,
        type: 'bu' as const,
        children: this.buildBUChildren(processes)
      };
    });

  if (!this.isCartographie) {
    const orphanProcesses = buMap.get('Sans BU');
    if (orphanProcesses) {
      this.hierarchicalProcesses.push({
        id: `bu-no-bu`,
        name: 'Sans BU',
        niveau: 0,
        type: 'bu' as const,
        children: this.buildBUChildren(orphanProcesses)
      });
    }
  }
}

  private groupByBU(): Array<{ buName: string | null, processes: any[] }> {
    const buMap = new Map<string, any[]>();

    this.processes.forEach(process => {
      const buKey = process.buName || 'no-bu';
      if (!buMap.has(buKey)) {
        buMap.set(buKey, []);
      }
      buMap.get(buKey)!.push(process);
    });

    return Array.from(buMap.entries()).map(([buName, processes]) => ({
      buName: buName === 'no-bu' ? null : buName,
      processes
    }));
  }

  private buildBUChildren(processes: any[]): ProcessNode[] {
    // Séparer les parents (pas de parentName) des enfants
    const parents = processes.filter(p => !p.parentName);
    const children = processes.filter(p => p.parentName);

    return parents.map(parent => ({
      id: parent.id,
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
  
      const dialogRef = this.dialog.open(AddEntityDialogComponent, {
        width: '500px',
        data: entite || null // Passe l'entité si c'est une modification, sinon null
      });
  
      dialogRef.afterClosed().subscribe(entiteResponsable => {
        if (entiteResponsable) {
          if (entiteResponsable.id == null) {
            this.entityService.save(entiteResponsable).subscribe(() => {
              this.ngOnInit(); // Rafraîchir après ajout/modification
            });
          }
          else {
            this.entityService.update(entiteResponsable).subscribe(() => {
              this.ngOnInit(); // Rafraîchir après ajout/modification
            });
          }
        }
      });
    }
}