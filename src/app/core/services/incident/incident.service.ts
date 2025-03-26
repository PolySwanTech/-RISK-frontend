import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Incident, State } from '../../models/Incident';
import { environment } from '../../../environments/environment.prod';
import { Impact } from '../../models/Impact';
import { Risk } from '../../models/Risk';
import { Cause } from '../../models/Cause';
import { SubRisk } from '../../models/SubRisk';
import { Process } from '../../models/Process';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  baseUrl = environment.apiUrl

  http = inject(HttpClient);

  loadIncidents() : Observable<Incident[]> {
    return this.http.get<Incident[]>(this.baseUrl + '/incidents');
  }

  countIncidentsNonClotures() : Observable<number> {
    return this.http.get<number>(this.baseUrl + '/incidents/nb/cloture');
  }
  
  getIncidentById(id: string): Observable<Incident> {
    return this.http.get<any>(this.baseUrl + '/incidents/' + id).pipe(
      map((responseData: { id: string; titre : string; location : string; comments : string; cause : Cause; declaredAt: Date; survenueAt: Date; detectedAt: Date; closedAt: Date; risk : Risk; subRisk : SubRisk; process : Process; impacts: Impact[]; state : State}) => {
        // Constructing an Incident instance using the constructor
        const {
          id,
          titre,
          location,
          comments,
          cause,
          declaredAt,
          survenueAt,
          detectedAt,
          closedAt,
          risk,
          subRisk,
          process,
          impacts,
          state
        } = responseData;
  
        // Conversion des dates en objets Date
        return new Incident(
          id,
          titre,
          location,
          new Date(declaredAt),
          new Date(survenueAt),
          new Date(detectedAt),
          closedAt ? new Date(closedAt) : null, // Gestion du cas où closedAt est null
          risk,
          subRisk,
          process,
          cause,
          impacts,
          comments,
          state
        );
      })
    );
  }

  addImpact(impact : Impact){
    return this.http.post(this.baseUrl + '/impact', impact)
  }

  saveIncident(incident: any): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/incidents`, incident);
  }

  draftIncident(incident: any): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/incidents/draft`, incident);
  }

  updateCommentaire(id : string, commentaire : string){
    return this.http.put(this.baseUrl + `/incidents/${id}/commentaire`, commentaire)
  }

  close(id: string) {
    return this.http.put(this.baseUrl + `/incidents/${id}/close`, null)
  }
}
