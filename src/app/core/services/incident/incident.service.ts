import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../models/Incident';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  http = inject(HttpClient);

  loadIncidents() : Observable<Incident[]> {
    return this.http.get<Incident[]>('/data-example/incident-example.json');
  }
}
