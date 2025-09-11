import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-todo',
  imports: [CommonModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss'
})
export class TodoComponent implements OnInit {
  currentView: 'grouped' | 'unified' = 'grouped';
  currentTypeFilter: string = 'all';
  currentPriorityFilter: string = 'all';
  
  collapsedGroups = {
    plans: false,
    incidents: false,
    controls: false
  };
  
  typeFilters = [
    { value: 'all', label: 'Tous' },
    { value: 'plans', label: 'Plans' },
    { value: 'incidents', label: 'Incidents' },
    { value: 'controls', label: 'Contrôles' }
  ];
  
  priorityFilters = [
    { value: 'all', label: 'Toutes' },
    { value: 'high', label: 'Haute' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'low', label: 'Basse' }
  ];
  
  // Données d'exemple
  todoItems: any[] = [
    // Plans d'action
    {
      id: '1',
      type: 'plans',
      title: 'Mise à jour des procédures de sécurité',
      priority: 'high',
      date: '25/09/2025',
      responsible: 'M. Dupont'
    },
    {
      id: '2',
      type: 'plans',
      title: 'Formation équipe qualité',
      priority: 'medium',
      date: '02/10/2025',
      responsible: 'Mme Martin'
    },
    {
      id: '3',
      type: 'plans',
      title: 'Optimisation des processus',
      priority: 'low',
      date: '15/10/2025',
      responsible: 'M. Bernard'
    },
    
    // Incidents
    {
      id: '4',
      type: 'incidents',
      title: 'Panne système de production',
      priority: 'high',
      date: '10/09/2025',
      responsible: 'Équipe IT',
      status: 'Critique'
    },
    {
      id: '5',
      type: 'incidents',
      title: 'Non-conformité documentation',
      priority: 'medium',
      date: '08/09/2025',
      responsible: 'Service qualité'
    },
    
    // Contrôles
    {
      id: '6',
      type: 'controls',
      title: 'Audit sécurité mensuel',
      priority: 'high',
      date: '18/09/2025',
      responsible: 'M. Rousseau'
    },
    {
      id: '7',
      type: 'controls',
      title: 'Vérification équipements',
      priority: 'medium',
      date: '20/09/2025',
      responsible: 'Mme Petit'
    }
  ];
  
  ngOnInit() {
    // Initialisation si nécessaire
  }
  
  setView(view: 'grouped' | 'unified') {
    this.currentView = view;
  }
  
  setTypeFilter(filter: string) {
    this.currentTypeFilter = filter;
  }
  
  setPriorityFilter(filter: string) {
    this.currentPriorityFilter = filter;
  }
  
  toggleGroup(groupType: 'plans' | 'incidents' | 'controls') {
    this.collapsedGroups[groupType] = !this.collapsedGroups[groupType];
  }
  
  getItemCount(type: 'plans' | 'incidents' | 'controls'): number {
    return this.todoItems.filter(item => item.type === type).length;
  }
  
  getFilteredItems(type: 'plans' | 'incidents' | 'controls'): any[] {
    return this.todoItems.filter(item => 
      item.type === type && 
      (this.currentPriorityFilter === 'all' || item.priority === this.currentPriorityFilter)
    );
  }
  
  getAllFilteredItems(): any[] {
    return this.todoItems.filter(item => 
      (this.currentTypeFilter === 'all' || item.type === this.currentTypeFilter) &&
      (this.currentPriorityFilter === 'all' || item.priority === this.currentPriorityFilter)
    );
  }
  
  getFilteredGroupCount(type: 'plans' | 'incidents' | 'controls'): number {
    return this.getFilteredItems(type).length;
  }
  
  shouldShowGroup(type: 'plans' | 'incidents' | 'controls'): boolean {
    return this.getFilteredGroupCount(type) > 0;
  }
  
  shouldShowItem(item: any): boolean {
    return this.currentPriorityFilter === 'all' || item.priority === this.currentPriorityFilter;
  }
  
  getPriorityLabel(priority: string): string {
    const labels = {
      'high': 'Priorité haute',
      'medium': 'Priorité moyenne',
      'low': 'Priorité basse'
    };
    return labels[priority as keyof typeof labels] || priority;
  }
  
  getTypeLabel(type: string): string {
    const labels = {
      'plans': 'Plan',
      'incidents': 'Incident', 
      'controls': 'Contrôle'
    };
    return labels[type as keyof typeof labels] || type;
  }
  
  getDateLabel(item: any): string {
    const labels = {
      'plans': 'Échéance',
      'incidents': 'Créé',
      'controls': 'Planifié'
    };
    return 'Créé';
  }
  
  getActionsForType(type: string) {
    const actions = {
      'plans': [
        { key: 'view', label: 'Voir' },
        { key: 'edit', label: 'Modifier' }
      ],
      'incidents': [
        { key: 'treat', label: 'Traiter' },
        { key: 'escalate', label: 'Escalader' }
      ],
      'controls': [
        { key: 'start', label: 'Démarrer' },
        { key: 'schedule', label: 'Planifier' }
      ]
    };
    return actions[type as keyof typeof actions] || [];
  }
  
  // Actions
  executeAction(action: any, item: any) {
    console.log(`Action ${action.key} sur item:`, item);
    // Implémentation selon l'action
  }
  
  viewItem(item: any) {
    console.log('Voir item:', item);
  }
  
  editItem(item: any) {
    console.log('Modifier item:', item);
  }
  
  treatItem(item: any) {
    console.log('Traiter item:', item);
  }
  
  escalateItem(item: any) {
    console.log('Escalader item:', item);
  }
  
  startItem(item: any) {
    console.log('Démarrer item:', item);
  }
  
  scheduleItem(item: any) {
    console.log('Planifier item:', item);
  }
}