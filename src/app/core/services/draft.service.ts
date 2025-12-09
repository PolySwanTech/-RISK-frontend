import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Draft {
  id: string;
  title: string;
  data: any;
  timestamp: Date;
  component: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DraftService {
  // Configuration
  private readonly MAX_DRAFTS_PER_COMPONENT = 5;
  private readonly MAX_AGE_HOURS = 24;

  private draftsSubject = new BehaviorSubject<Draft[]>([]);
  public drafts$: Observable<Draft[]> = this.draftsSubject.asObservable();
  
  // Observable des brouillons visibles uniquement
  public visibleDrafts$: Observable<Draft[]> = this.drafts$.pipe(
    map(drafts => drafts.filter(d => d.visible))
  );

  constructor() {
    this.loadDraftsFromMemory();
    this.startCleanupInterval();
  }

  private loadDraftsFromMemory(): void {
    this.cleanupOldDrafts();
    const savedDrafts = this.draftsSubject.value;
    this.draftsSubject.next(savedDrafts);
  }

  private startCleanupInterval(): void {
    // Nettoyer les vieux brouillons toutes les heures
    setInterval(() => {
      this.cleanupOldDrafts();
    }, 60 * 60 * 1000); // 1 heure
  }

  private cleanupOldDrafts(): void {
    const now = new Date();
    const drafts = this.draftsSubject.value.filter(draft => {
      const age = now.getTime() - new Date(draft.timestamp).getTime();
      const ageInHours = age / (1000 * 60 * 60);
      return ageInHours < this.MAX_AGE_HOURS;
    });
    
    if (drafts.length !== this.draftsSubject.value.length) {
      this.draftsSubject.next(drafts);
    }
  }

  /**
   * Crée un nouveau brouillon avec un ID unique
   * Applique les limites de quantité par composant
   */
  createDraft(componentName: string, title: string, data: any, visible: boolean = true): string {
    this.cleanupOldDrafts();
    
    let drafts = this.draftsSubject.value;
    
    // Limiter à MAX_DRAFTS_PER_COMPONENT par composant
    const componentDrafts = drafts.filter(d => d.component === componentName);
    if (componentDrafts.length >= this.MAX_DRAFTS_PER_COMPONENT) {
      // Supprimer le plus ancien brouillon de ce composant
      const oldest = componentDrafts.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )[0];
      
      this.deleteDraft(oldest.id);
      drafts = this.draftsSubject.value; // Rafraîchir après suppression
    }
    
    const draft: Draft = {
      id: this.generateId(),
      title,
      data,
      timestamp: new Date(),
      component: componentName,
      visible
    };

    drafts.push(draft);
    this.draftsSubject.next([...drafts]);
    
    return draft.id;
  }

  /**
   * Met à jour un brouillon existant par son ID
   */
  updateDraft(draftId: string, title: string, data: any, visible: boolean = true): void {
    const drafts = this.draftsSubject.value;
    const draftIndex = drafts.findIndex(d => d.id === draftId);
    
    if (draftIndex >= 0) {
      drafts[draftIndex] = {
        ...drafts[draftIndex],
        title,
        data,
        timestamp: new Date(), // Met à jour le timestamp
        visible
      };
      this.draftsSubject.next([...drafts]);
    }
  }

  /**
   * Récupère un brouillon par son ID
   */
  getDraftById(draftId: string): Draft | null {
    const drafts = this.draftsSubject.value;
    return drafts.find(d => d.id === draftId) || null;
  }

  /**
   * Récupère tous les brouillons d'un composant
   */
  getDraftsByComponent(componentName: string): Draft[] {
    const drafts = this.draftsSubject.value;
    return drafts.filter(d => d.component === componentName);
  }

  /**
   * Marquer un brouillon comme visible
   */
  showDraft(draftId: string): void {
    const drafts = this.draftsSubject.value;
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      draft.visible = true;
      this.draftsSubject.next([...drafts]);
    }
  }

  /**
   * Cacher un brouillon (quand on l'ouvre pour l'éditer)
   */
  hideDraft(draftId: string): void {
    const drafts = this.draftsSubject.value;
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      draft.visible = false;
      this.draftsSubject.next([...drafts]);
    }
  }

  /**
   * Supprime un brouillon par son ID
   */
  deleteDraft(draftId: string): void {
    const drafts = this.draftsSubject.value.filter(d => d.id !== draftId);
    this.draftsSubject.next(drafts);
  }

  /**
   * Supprime tous les brouillons d'un composant
   */
  deleteAllDrafts(componentName: string): void {
    const drafts = this.draftsSubject.value.filter(d => d.component !== componentName);
    this.draftsSubject.next(drafts);
  }

  /**
   * Vérifie si un composant a des brouillons
   */
  hasDrafts(componentName: string): boolean {
    return this.draftsSubject.value.some(d => d.component === componentName);
  }

  /**
   * Compte le nombre de brouillons pour un composant
   */
  countDrafts(componentName: string): number {
    return this.draftsSubject.value.filter(d => d.component === componentName).length;
  }

  /**
   * Obtient les limites de configuration
   */
  getConfig() {
    return {
      maxDraftsPerComponent: this.MAX_DRAFTS_PER_COMPONENT,
      maxAgeHours: this.MAX_AGE_HOURS
    };
  }

  private generateId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}