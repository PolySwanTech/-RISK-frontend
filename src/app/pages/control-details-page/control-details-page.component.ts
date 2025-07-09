import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

export interface ControlExecution {
  date: string;
  status: ControlStatus;
  responsible: string;
  score: string;
  quarter: string;
  year: string;
  auditTrail: string;
  cotationFinale?: string;
}

export interface Taxonomie {
  entite: string;
  macroProcess: string;
  process: string;
}

export interface Control {
  id: string;
  reference: string;
  libelle: string;
  description: string;
  frequency: Frequency;
  controlType: ControlType;
  level: ControlLevel;
  priority: Priority;
  creator: string;
  createdDate: string;
  taxonomie: Taxonomie;
  lastExecution: ControlExecution;
  executions: ControlExecution[];
}

export enum ControlStatus {
  REALISE = 'REALISE',
  EN_COURS = 'EN_COURS',
  NON_REALISE = 'NON_REALISE'
}

export enum Frequency {
  HEBDOMADAIRE = 'HEBDOMADAIRE',
  MENSUELLE = 'MENSUELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
  SEMESTRIELLE = 'SEMESTRIELLE',
  ANNUELLE = 'ANNUELLE'
}

export enum ControlType {
  PREVENTIF = 'PREVENTIF',
  DETECTIF = 'DETECTIF',
  CORRECTIF = 'CORRECTIF',
  AUTOMATISE = 'AUTOMATISE',
  MANUEL = 'MANUEL'
}

export enum ControlLevel {
  NIVEAU_1 = 'NIVEAU_1',
  NIVEAU_2 = 'NIVEAU_2'
}

export enum Priority {
  MINIMALE = 'MINIMALE',
  MOYENNE = 'MOYENNE',
  MAXIMALE = 'MAXIMALE'
}

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

  control: any = {
    id: 'CTRL-2024-001',
    reference: 'REF-COMPTA-001',
    libelle: 'Contrôle mensuel de rapprochement bancaire',
    description: 'Vérification de la cohérence entre les écritures comptables et les relevés bancaires. Questions clés : Qui a effectué le rapprochement ? Quels écarts ont été identifiés ? Comment ont-ils été traités ? Validation par le responsable comptable.',
    frequency: Frequency.MENSUELLE,
    controlType: ControlType.DETECTIF,
    level: ControlLevel.NIVEAU_1,
    priority: Priority.MAXIMALE,
    creator: 'Marie Dubois',
    createdDate: '2024-01-15',
    taxonomie: {
      entite: 'Direction Financière',
      macroProcess: 'Gestion Financière',
      process: 'Comptabilité Générale'
    },
    lastExecution: {
      date: '2024-06-15',
      status: ControlStatus.REALISE,
      responsible: 'Jean Martin',
      quarter: 'T2',
      year: '2024',
      auditTrail: 'Document de rapprochement signé et archivé',
      cotationFinale: '85/100'
    },
    executions: [
      { 
        date: '2024-06-15', 
        status: ControlStatus.REALISE, 
        responsible: 'Jean Martin', 
        score: '85/100',
        quarter: 'T2',
        year: '2024',
        auditTrail: 'Document signé'
      },
      { 
        date: '2024-05-15', 
        status: ControlStatus.REALISE, 
        responsible: 'Jean Martin', 
        score: '90/100',
        quarter: 'T2',
        year: '2024',
        auditTrail: 'Document archivé'
      },
      { 
        date: '2024-04-15', 
        status: ControlStatus.REALISE, 
        responsible: 'Sophie Leroy', 
        score: '88/100',
        quarter: 'T2',
        year: '2024',
        auditTrail: 'Contrôle validé'
      },
      { 
        date: '2024-03-15', 
        status: ControlStatus.EN_COURS, 
        responsible: 'Jean Martin', 
        score: '-',
        quarter: 'T1',
        year: '2024',
        auditTrail: 'En cours de validation'
      }
    ]
  };

  activeTab = 'details';
  
  // Enum references for template
  ControlStatus = ControlStatus;
  Priority = Priority;
  ControlLevel = ControlLevel;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du contrôle depuis l'URL
    const controlId = this.route.snapshot.paramMap.get('id');
    if (controlId) {
      this.loadControl(controlId);
    }
  }

  loadControl(id: string): void {
    // TODO: Appeler votre service pour récupérer les données du contrôle
    // this.controlService.getControl(id).subscribe(control => {
    //   this.control = control;
    // });
  }

  getStatusClass(status: ControlStatus): string {
    switch(status) {
      case ControlStatus.REALISE:
        return 'status-realise';
      case ControlStatus.EN_COURS:
        return 'status-en-cours';
      case ControlStatus.NON_REALISE:
        return 'status-non-realise';
      default:
        return 'status-default';
    }
  }

  getPriorityClass(priority: Priority): string {
    switch(priority) {
      case Priority.MAXIMALE:
        return 'priority-maximale';
      case Priority.MOYENNE:
        return 'priority-moyenne';
      case Priority.MINIMALE:
        return 'priority-minimale';
      default:
        return 'priority-default';
    }
  }

  goBack(): void {
    this.router.navigate(['/control/chart']);
  }

  editControl(): void {
    this.router.navigate(['/controls', this.control.id, 'edit']);
  }

  exportControl(): void {
    // TODO: Implémenter l'export
  }

  markAsRealized(): void {
    // TODO: Implémenter la mise à jour du statut
  }

  scheduleExecution(): void {
    // TODO: Implémenter la planification
  }

  addNote(): void {
    // TODO: Implémenter l'ajout de note
  }

  viewFullHistory(): void {
    this.router.navigate(['/controls', this.control.id, 'history']);
  }

  formatStatus(status: ControlStatus): string {
    return status.replace('_', ' ');
  }

  formatLevel(level: ControlLevel): string {
    return level.replace('_', ' ');
  }

  formatPriority(priority: Priority): string {
    return priority.toLowerCase();
  }
}