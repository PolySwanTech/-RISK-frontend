import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { EntiteResponsable } from '../../models/EntiteResponsable';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/users/bu'

  loadEntities(): Observable<EntiteResponsable[]> {
    return this.http.get<EntiteResponsable[]>(this.baseUrl);
  }

  findById(id : string): Observable<EntiteResponsable> {
    return this.http.get<EntiteResponsable>(this.baseUrl + '/' + id);
  }

  loadEntitiesTree(): Observable<EntiteResponsable[]> {
    return this.http.get<EntiteResponsable[]>(this.baseUrl + '/tree');
  }

  save(entite: EntiteResponsable) {
    return this.http.post(this.baseUrl, entite);
  }

  getByProcess(processId: string): Observable<EntiteResponsable> {
    return this.http.get<EntiteResponsable>(
      `${this.baseUrl}/byProcess`,
      { params: { processId } }
    );
  }

  update(entite: EntiteResponsable) {
    return this.http.put(this.baseUrl, entite);
  }
}
