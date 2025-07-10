import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Status, statusLabels } from '../../core/enum/status.enum';
import { Priority, priorityLabels } from '../../core/enum/Priority';
import { Degree, degreeLabels } from '../../core/enum/degree.enum';
import { ControlService } from '../../core/services/control/control.service';
import { ControlTemplate } from '../../core/models/ControlTemplate';
import { ControlExecution } from '../../core/models/ControlExecution';

@Component({
  selector: 'app-control-details-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './control-details-page.component.html',
  styleUrls: ['./control-details-page.component.scss']
})
export class ControlDetailsPageComponent implements OnInit {

  private controlService = inject(ControlService);

  activeTab = 'details';

  control: ControlTemplate | null = null;
  controlExecutions : ControlExecution[] = [];

  // Enum references for template
  ControlStatus = Status;
  Priority = Priority;
  ControlLevel = Degree;

  private route =  inject(ActivatedRoute);
  private router =  inject(Router);

  ngOnInit(): void {
    // Récupérer l'ID du contrôle depuis l'URL
    const controlId = this.route.snapshot.paramMap.get('id');
    if (controlId) {
      this.loadControl(controlId);
      this.loadControlExecutions(controlId);
    }
  }

  loadControl(id: string): void {
    // TODO: Appeler votre service pour récupérer les données du contrôle
    this.controlService.getControl(id).subscribe(control => {
      this.control = control;
    });
  }

  loadControlExecutions(id: string): void {
    this.controlService.getAllExecutions(id).subscribe(executions => {
      this.controlExecutions = executions;
    });
  }

  getStatusClass(status: Status): string {
    switch (status) {
      case Status.ACHIEVED:
        return 'status-realise';
      case Status.IN_PROGRESS:
        return 'status-en-cours';
      case Status.NOT_ACHIEVED:
        return 'status-non-realise';
      default:
        return 'status-default';
    }
  }

  getPriorityClass(priority: Priority): string {
    return priorityLabels[priority];
  }

  goBack(): void {
    this.router.navigate(['/control/chart']);
  }

  editControl(): void {
    if (this.control)
      this.router.navigate(['/controls', this.control.id, 'edit']);
  }

  exportControl(): void {
    // TODO: Implémenter l'export
    if (this.control)
      console.log('Export du contrôle:', this.control.id);
  }

  markAsRealized(): void {
    // TODO: Implémenter la mise à jour du statut
    if (this.control)
      console.log('Marquer comme réalisé:', this.control.id);
  }

  scheduleExecution(): void {
    // TODO: Implémenter la planification
    if (this.control)
      console.log('Planifier exécution:', this.control.id);
  }

  addNote(): void {
    // TODO: Implémenter l'ajout de note
    if (this.control)
      console.log('Ajouter une note:', this.control.id);
  }

  viewFullHistory(): void {
    if (this.control)
      this.router.navigate(['/controls', this.control.id, 'history']);
  }

  formatStatus(status: Status): string {
    return statusLabels[status];
  }

  formatLevel(level: Degree): string {
    return degreeLabels[level];
  }

  formatPriority(priority: Priority): string {
    return priorityLabels[priority];
  }
}