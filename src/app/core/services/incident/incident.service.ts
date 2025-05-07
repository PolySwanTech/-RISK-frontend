import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Incident, State } from '../../models/Incident';
import { environment } from '../../../environments/environment.prod';
import { Impact } from '../../models/Impact';
import { Risk } from '../../models/Risk';
import { Cause } from '../../models/Cause';
import { Process } from '../../models/Process';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  

  baseUrl = '/api/incidents'; 

  http = inject(HttpClient);

  loadIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.baseUrl);
  }

  countIncidentsNonClotures(): Observable<number> {
    return this.http.get<number>(this.baseUrl + '/nb/cloture');
  }

  sum(id: string) {
    let params = new HttpParams();
    params = params.set("incidentId", id);
    return this.http.get<number>(this.baseUrl + '/impact/sum', { params: params })
  }


  getIncidentById(id: string): Observable<Incident> {
    return this.http.get<any>(this.baseUrl + '/' + id).pipe(
      map((responseData: { id: string; titre: string; location: string; comments: string; cause: Cause; declaredAt: Date; survenueAt: Date; detectedAt: Date; closedAt: Date; risk: Risk; process: Process; impacts: Impact[]; equipeName?: string; state: string }) => {
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
          process,
          impacts,
          equipeName,
          state
        } = responseData;

        const parsedState: State = State[state as keyof typeof State];

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
          process,
          cause,
          impacts,
          comments,
          parsedState,
          equipeName
        );
      })
    );
  }

  addImpact(impact: Impact) {
    return this.http.post(this.baseUrl + '/impact', impact)
  }

  saveIncident(incident: any): Observable<string> {
    return this.http.post<string>(this.baseUrl, incident);
  }

  updateCommentaire(id: string, commentaire: string, message: string) {
    console.log(id, commentaire)
    return this.http.put(this.baseUrl + `/${id}/commentaire`, {
      commentaire,
      message
    });
  }

  draftIncident(incident: any): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/draft`, incident);
  }

  close(id: string) {
    return this.http.put(this.baseUrl + `/${id}/close`, null)
  }

  getIncidentHistory(incidentId: string) {
    return this.http.get<any[]>(`${this.baseUrl}/${incidentId}/history`);
  }
}
