import { HttpClient } from '@angular/common/http';
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
      map((responseData: { id: any; declaredAt: any; survenueAt: any; detectedAt: any; closedAt: any; processName: any; entiteResponsable: any; impacts: any; }) => {
        // Constructing an Incident instance using the constructor
        const {
          id,
          declaredAt,
          survenueAt,
          detectedAt,
          closedAt,
          processName,
          entiteResponsable,
          impacts
        } = responseData;

        // Convert string dates to Date objects if necessary
        return new Incident(
          id,
          new Date(declaredAt),
          new Date(survenueAt),
          new Date(detectedAt),
          closedAt ? new Date(closedAt) : null, // Handle the possibility of a null closedAt
          processName,
          entiteResponsable,
          impacts // Assuming impacts is already an array of Impact objects or needs further processing
        );
      })
    );
  }

  addImpact(impact : Impact, id : string){
    return this.http.post(this.baseUrl + '/incidents/impact/' + id, impact)
  }
}
