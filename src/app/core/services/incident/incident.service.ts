import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { environment } from '../../../environments/environment.prod';
import { Impact } from '../../models/Impact';

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
      map((responseData: { id: string; title : string; declaredAt: Date; survenueAt: Date; detectedAt: Date; closedAt: Date; impacts: Impact[]; comments : string}) => {
        // Constructing an Incident instance using the constructor
        const {
          id,
          title,
          declaredAt,
          survenueAt,
          detectedAt,
          closedAt,
          impacts, 
          comments
        } = responseData;

        // Convert string dates to Date objects if necessary
        return new Incident(
          id,
          title,
          new Date(declaredAt),
          new Date(survenueAt),
          new Date(detectedAt),
          closedAt ? new Date(closedAt) : null, // Handle the possibility of a null closedAt
          impacts, 
          comments // Assuming impacts is already an array of Impact objects or needs further processing
        );
      })
    );
  }

  addImpact(impact : Impact, processId : string,  incidentId : string){
    let params = new HttpParams();
    params = params.set("idP", processId).set("idI", incidentId)
    return this.http.post(this.baseUrl + '/impact', impact, {params : params})
  }

  updateCommentaire(id : string, commentaire : string){
    console.log(id, commentaire)
    return this.http.put(this.baseUrl + `/incidents/${id}/commentaire`, commentaire)
  }

  close(id: string) {
    return this.http.put(this.baseUrl + `/incidents/${id}/close`, null)
  }
}
