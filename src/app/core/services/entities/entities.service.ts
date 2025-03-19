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
  baseUrl = environment.apiUrl

  loadEntities(): Observable<EntiteResponsable[]> {
    return this.http.get<EntiteResponsable[]>(this.baseUrl + '/entites');
  }
}
