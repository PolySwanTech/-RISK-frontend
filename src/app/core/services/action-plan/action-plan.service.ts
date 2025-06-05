import { Priority } from './../../models/Priority';
import { Statut } from './../../models/Statut';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActionPlan } from '../../models/ActionPlan';

@Injectable({
  providedIn: 'root'
})
export class ActionPlanService {

  base = environment.apiUrl + '/risks/action-plans';
  http = inject(HttpClient);  

  createActionPlan(actionPlan: ActionPlan) {
    return this.http.post(this.base, actionPlan);
  }

  getActionsPlan() {
    return [
      {
        id: '1',
        creator: 'Incident #123',
        name: 'Amélioration du processus de validation',
        description: 'Réduire les délais de validation des documents internes.',
        responsable: 'Julie Martin',
        echeance: "2025-05-22T07:59:14.994731Z",
        priority: Priority.MEDIUM, // ou 'MINIMAL', 'MAXIMUM', selon ton enum
        status: Statut.IN_PROGRESS // ou 'DRAFT', 'CLOSED', selon ton enum
      },
      {
        id: '2',
        creator: 'Incident #124',
        name: 'Mise à jour de la documentation sécurité',
        description: 'Actualiser les procédures liées à la sécurité informatique.',
        responsable: 'Marc Dupont',
        priority: Priority.MAXIMUM,
        echeance: "2025-05-22T07:59:14.994731Z",
        status: Statut.IN_PROGRESS
      },
      {
        id: '3',
        creator: 'Incident #125',
        name: 'Audit des accès aux systèmes',
        description: 'Contrôle des droits utilisateurs sur les applications critiques.',
        responsable: 'Claire Bernard',
        priority: Priority.MINIMAL,
        echeance: "2025-05-22T07:59:14.994731Z",
        status: Statut.NOT_ACHIEVED
      },
      {
        id: '4',
        creator: 'Incident #126',
        name: 'Formation RGPD pour les équipes',
        description: 'Organiser une session de sensibilisation RGPD.',
        responsable: 'Thomas Leroy',
        priority: Priority.MEDIUM,
        echeance: "2025-05-22T07:59:14.994731Z",
        status: Statut.ACHIEVED
      }
    ];
  }
}
