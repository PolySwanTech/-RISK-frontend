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
import { PlanifierExecutionPopupComponent } from './popup-planifier-execution/planifier-execution-popup/planifier-execution-popup.component';
import { GoBackComponent } from '../../shared/components/go-back/go-back.component';

@Component({
  selector: 'app-control-details-page',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    PlanifierExecutionPopupComponent,
    GoBackComponent
  ],
  templateUrl: './control-details-page.component.html',
  styleUrls: ['./control-details-page.component.scss']
})
export class ControlDetailsPageComponent implements OnInit {

  private controlService = inject(ControlService);

  activeTab = 'details';

  control: ControlTemplate | null = null;
  controlExecutions: ControlExecution[] = [];

  // Enum references for template
  ControlStatus = Status;
  Priority = Priority;
  ControlLevel = Degree;

  showPopup = false;

  currentUsername: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  goBackButtons = [
    {
      label: 'Exporter',
      icon: 'download', // ou 'icon-download' si tu veux garder une classe <i>, cf remarque plus bas
      class: 'btn-secondary',
      show: true,
      action: () => this.exportControl()
    },
    {
      label: 'Modifier',
      icon: 'edit', // idem, voir ci-dessous
      class: 'btn-primary',
      show: true,
      action: () => this.editControl()
    }
  ];

  ngOnInit(): void {
    this.currentUsername = this.getUsernameFromToken() || '';
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
      console.log('Executions reçues du backend :', executions);
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

  getPriorityClass(priority: Priority | undefined): string {
    return priorityLabels[priority!] || 'priority-default';
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
  }

  markAsRealized(): void {
    // TODO: Implémenter la mise à jour du statut
  }

  scheduleExecution(): void {
    this.showPopup = true;
  }

  addNote(): void {
    // TODO: Implémenter l'ajout de note
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

  formatPriority(priority: Priority | undefined): string {
    return priorityLabels[priority!] || 'Non défini';
  }

  handlePlanification(payload: any): void {
    this.controlService.createExecution(payload).subscribe(() => {
      this.loadControlExecutions(this.control!.id.id); // recharger la liste
    });
  }

  getUsernameFromToken(): string | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || null;
    } catch (e) {
      console.error("Erreur de décodage du token :", e);
      return null;
    }
  }

  canMarkAsRealized(): boolean {
    if (!this.controlExecutions.length || !this.currentUsername) return false;

    const last = this.controlExecutions[this.controlExecutions.length - 1];
    return last.performedBy === this.currentUsername && last.status !== Status.ACHIEVED;
  }

}