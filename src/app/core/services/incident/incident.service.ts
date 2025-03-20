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
  
  getIncidentById(id: string): Observable<Incident> {
    return this.http.get<any>(this.baseUrl + '/incidents/' + id).pipe(
      map((responseData: { id: string; titre : string; declaredAt: Date; survenueAt: Date; detectedAt: Date; closedAt: Date; impacts: Impact[]; }) => {
        // Constructing an Incident instance using the constructor
        const {
          id,
          titre,
          declaredAt,
          survenueAt,
          detectedAt,
          closedAt,
          impacts
        } = responseData;

        // Convert string dates to Date objects if necessary
        return new Incident(
          id,
          titre,
          new Date(declaredAt),
          new Date(survenueAt),
          new Date(detectedAt),
          closedAt ? new Date(closedAt) : null, // Handle the possibility of a null closedAt
          impacts // Assuming impacts is already an array of Impact objects or needs further processing
        );
      })
    );
  }

  addImpact(impact : Impact, processId : string,  incidentId : string){
    let params = new HttpParams();
    params = params.set("idP", processId).set("idI", incidentId)
    return this.http.post(this.baseUrl + '/impact', impact, {params : params})
  }
}
