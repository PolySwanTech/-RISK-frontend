import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { EntiteResponsable } from '../../models/EntiteResponsable';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  http = inject(HttpClient);
  baseUrl = '/api/entites'

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

  update(entite: EntiteResponsable) {
    return this.http.put(this.baseUrl, entite);
  }
}
