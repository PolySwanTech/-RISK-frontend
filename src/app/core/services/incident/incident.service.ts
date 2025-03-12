import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  baseUrl = environment.apiUrl

  http = inject(HttpClient);

  loadIncidents() : Observable<Incident[]> {
    return this.http.get<Incident[]>(this.baseUrl + '/incidents');
  }
}
