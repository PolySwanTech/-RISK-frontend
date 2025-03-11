import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { EntiteResponsable } from '../../models/EntiteResponsable';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  http = inject(HttpClient);

  loadEntities(): Observable<EntiteResponsable[]> {
    return this.http.get<EntiteResponsable[]>('/data-example/equipe.json');
  }
}
