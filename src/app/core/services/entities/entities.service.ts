import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BusinessUnit } from '../../models/BusinessUnit';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/business-units'

  loadEntities(onlyBL : boolean = false): Observable<BusinessUnit[]> {
    return this.http.get<BusinessUnit[]>(this.baseUrl,  {params : { onlyBL }});
  }

  findById(id : string): Observable<BusinessUnit> {
    return this.http.get<BusinessUnit>(this.baseUrl + '/' + id);
  }

  loadEntitiesTree(): Observable<BusinessUnit[]> {
    return this.http.get<BusinessUnit[]>(this.baseUrl + '/tree');
  }

  save(entite: BusinessUnit) {
    return this.http.post(this.baseUrl, entite);
  }

  getByProcess(processId: string): Observable<BusinessUnit> {
    return this.http.get<BusinessUnit>(
      `${this.baseUrl}/byProcess`,
      { params: { processId } }
    );
  }

  update(entite: BusinessUnit) {
    return this.http.put(this.baseUrl, entite);
  }
}
