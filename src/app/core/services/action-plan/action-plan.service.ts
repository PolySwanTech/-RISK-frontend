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

  getActionPlan(id: string) {
    const allPlans = this.getActionsPlan();
    return allPlans.find(plan => plan.id === id);

    // return this.http.get<ActionPlan>(`${this.base}/${id}`);
  }

  getActionsPlan() {
    // return this.http.get<ActionPlan[]>(this.base);
    return [
      {
        id: '1',
        creator: 'Incident #123',
        name: 'Amélioration du processus de validation',
        description: 'Réduire les délais de validation des documents internes.',
        responsable: 'Julie Martin',
        echeance: "2025-05-22T07:59:14.994731Z",
        priority: Priority.MEDIUM,
        status: Statut.IN_PROGRESS,
        actions: [
          {
            name: 'Analyser les délais actuels',
            date: '2025-05-10',
            fileName: 'attestation-formation.pdf',
            completedBy: 'Thomas Leroy',
            completedAt: '2025-05-21T10:30:00Z'
          },
          {
            name: 'Proposer une nouvelle procédure',
            date: '2025-05-15',
            fileName: 'attestation-formation.pdf',
            completedBy: 'Thomas Leroy',
            completedAt: '2025-05-21T10:30:00Z'
          },
          {
            name: 'Former les équipes',
            date: '2025-05-20',
          }
        ]
      },
      {
        id: '2',
        creator: 'Incident #124',
        name: 'Mise à jour de la documentation sécurité',
        description: 'Actualiser les procédures liées à la sécurité informatique.',
        responsable: 'Marc Dupont',
        priority: Priority.MAXIMUM,
        echeance: "2025-05-22T07:59:14.994731Z",
        status: Statut.IN_PROGRESS,
        actions: [
          {
            name: 'Recenser les documents existants',
            date: '2025-05-08',
          },
          {
            name: 'Élaborer les nouvelles procédures',
            date: '2025-05-13',
            fileName: 'attestation-formation.pdf',
            completedBy: 'Thomas Leroy',
            completedAt: '2025-05-21T10:30:00Z'
          },
          {
            name: 'Valider avec le RSSI',
            date: '2025-05-18',
          }
        ]
      },
      {
        id: '3',
        creator: 'Incident #125',
        name: 'Audit des accès aux systèmes',
        description: 'Contrôle des droits utilisateurs sur les applications critiques.',
        responsable: 'Claire Bernard',
        priority: Priority.MINIMAL,
        echeance: "2025-05-22T07:59:14.994731Z",
        status: Statut.NOT_ACHIEVED,
        actions: [
          {
            name: 'Lister les systèmes critiques',
            date: '2025-05-05',
          },
          {
            name: 'Analyser les droits attribués',
            date: '2025-05-12',
          },
          {
            name: 'Corriger les anomalies',
            date: '2025-05-19',
          }
        ]
      },
      {
        id: '4',
        creator: 'Incident #126',
        name: 'Formation RGPD pour les équipes',
        description: 'Organiser une session de sensibilisation RGPD.',
        responsable: 'Thomas Leroy',
        priority: Priority.MEDIUM,
        echeance: "2025-05-22T07:59:14.994731Z",
        status: Statut.ACHIEVED,
        actions: [
          {
            name: 'Préparer le contenu de la formation',
            date: '2025-05-07',
            fileName: 'attestation-formation.pdf',
            completedBy: 'Thomas Leroy',
            completedAt: '2025-05-21T10:30:00Z'
          },
          {
            name: 'Planifier les sessions',
            date: '2025-05-14',
            fileName: 'attestation-formation.pdf',
            completedBy: 'Thomas Leroy',
            completedAt: '2025-05-21T10:30:00Z'
          },
          {
            name: 'Former les équipes',
            date: '2025-05-21',
            fileName: 'attestation-formation.pdf',
            completedBy: 'Thomas Leroy',
            completedAt: '2025-05-21T10:30:00Z'
          }
        ]
      }
    ];
  }
}
