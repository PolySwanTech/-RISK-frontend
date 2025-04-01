import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { EntiteImpactee } from '../../models/EntiteImpactee';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/entites'

  loadEntities(): Observable<EntiteImpactee[]> {
    return this.http.get<EntiteImpactee[]>(this.baseUrl);
  }

  findById(id : string): Observable<EntiteImpactee> {
    return this.http.get<EntiteImpactee>(this.baseUrl + '/' + id);
  }

  loadEntitiesTree(): Observable<EntiteImpactee[]> {
    return this.http.get<EntiteImpactee[]>(this.baseUrl + '/tree');
  }

  save(entite: EntiteImpactee) {
    return this.http.post(this.baseUrl, entite);
  }

  update(entite: EntiteImpactee) {
    return this.http.put(this.baseUrl, entite);
  }
}
