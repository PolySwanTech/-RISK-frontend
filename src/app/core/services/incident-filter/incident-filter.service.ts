import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IncidentListViewDto } from '../../models/Incident';

type FilterType = 'time' | 'state' | 'category';

@Injectable({ providedIn: 'root' })
export class IncidentFilterService {
  private allIncidents: IncidentListViewDto[] = [];
  private filters: Partial<Record<FilterType, (inc: IncidentListViewDto) => boolean>> = {};

  private filteredIncidentsSubject = new BehaviorSubject<IncidentListViewDto[]>([]);
  filteredIncidents$ = this.filteredIncidentsSubject.asObservable();

  /** Initialise la liste complète */
  setIncidents(incidents: IncidentListViewDto[]) {
    this.allIncidents = incidents;
    this.applyFilters();
  }

  /** Active ou remplace un filtre pour une dimension */
  setFilter(type: FilterType, fn: (inc: IncidentListViewDto) => boolean) {
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
