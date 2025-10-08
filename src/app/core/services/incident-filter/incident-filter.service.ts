import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Incident } from '../../models/Incident';

type FilterType = 'time' | 'state' | 'category';

@Injectable({ providedIn: 'root' })
export class IncidentFilterService {
  private allIncidents: Incident[] = [];
  private filters: Partial<Record<FilterType, (inc: Incident) => boolean>> = {};

  private filteredIncidentsSubject = new BehaviorSubject<Incident[]>([]);
  filteredIncidents$ = this.filteredIncidentsSubject.asObservable();

  /** Initialise la liste complète */
  setIncidents(incidents: Incident[]) {
    this.allIncidents = incidents;
    this.applyFilters();
  }

  /** Active ou remplace un filtre pour une dimension */
  setFilter(type: FilterType, fn: (inc: Incident) => boolean) {
    this.filters[type] = fn;
    this.applyFilters();
  }

  /** Supprime un filtre pour une dimension */
  clearFilter(type: FilterType) {
    delete this.filters[type];
    this.applyFilters();
  }

  /** Recalcule la liste finale */
  private applyFilters() {
    let result = [...this.allIncidents];
    Object.values(this.filters).forEach(fn => {
      result = result.filter(fn);
    });
    this.filteredIncidentsSubject.next(result);
  }
}
