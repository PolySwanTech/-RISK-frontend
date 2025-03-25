import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
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
      map((responseData: { id: string; title : string; location : string; comments : string; cause : Cause; declaredAt: Date; survenueAt: Date; detectedAt: Date; closedAt: Date; risk : Risk; subRisk : SubRisk; process : Process; impacts: Impact[];}) => {
        // Constructing an Incident instance using the constructor
        const {
          id,
          title,
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
          impacts
        } = responseData;
  
        // Conversion des dates en objets Date
        return new Incident(
          id,
          title,
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
          comments
        );
      })
    );
  }

  addImpact(impact : Impact, processId : string,  incidentId : string){
    let params = new HttpParams();
    params = params.set("idP", processId).set("idI", incidentId)
    return this.http.post(this.baseUrl + '/impact', impact, {params : params})
  }

  saveIncident(incident: any): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/incidents`, incident);
  }

  updateCommentaire(id : string, commentaire : string){
    console.log(id, commentaire)
    return this.http.put(this.baseUrl + `/incidents/${id}/commentaire`, commentaire)
  }

  close(id: string) {
    return this.http.put(this.baseUrl + `/incidents/${id}/close`, null)
  }
}
