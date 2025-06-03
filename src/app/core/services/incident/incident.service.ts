import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Incident, State } from '../../models/Incident';
import { environment } from '../../../environments/environment';
import { Impact } from '../../models/Impact';
import { Risk } from '../../models/Risk';
import { Cause } from '../../models/Cause';
import { SubRisk } from '../../models/SubRisk';
import { Process } from '../../models/Process';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  

  baseUrl = environment.apiUrl + '/incidents'

  http = inject(HttpClient);

  loadIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.baseUrl );
  }

  countIncidentsNonClotures(): Observable<number> {
    return this.http.get<number>(this.baseUrl + '/nb/cloture')
  }

  sum(id: string) {
    let params = new HttpParams();
    params = params.set("incidentId", id);
    return this.http.get<number>(this.baseUrl + '/impact/sum', { params: params })
  }


  getIncidentById(id: string): Observable<Incident> {
    return this.http.get<any>(this.baseUrl + '/' + id).pipe(
      map((responseData: { id: string; titre: string; location: string; comments: string; cause: Cause; declaredAt: Date; survenueAt: Date; detectedAt: Date; closedAt: Date; risk: Risk; subRisk: SubRisk; process: Process; impacts: Impact[]; equipeName?: string; state: string, reference : string }) => {
        // Constructing an Incident instance using the constructor
        const {
          id,
          titre,
          location,
          comments,
          declaredAt,
          survenueAt,
          detectedAt,
          closedAt,
          risk,
          subRisk,
          process,
          impacts,
          equipeName,
          state,
          reference
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
          subRisk,
          process,
          impacts,
          comments,
          parsedState,
          equipeName, 
          reference
        );
      })
    );
  }

  addImpact(impact: Impact) {
    return this.http.post(this.baseUrl + '/impact', impact)
  }

  saveIncident(incident: any): Observable<any> {
    return this.http.post(this.baseUrl, incident, { responseType: 'text' as 'json' });
  }
  
  draftIncident(incident: any): Observable<any> {
    return this.http.post(this.baseUrl + '/draft', incident, { responseType: 'text' as 'json' });
  }  

  close(id: string) {
    return this.http.put(this.baseUrl + `/${id}/close`, null)
  }

  getIncidentHistory(incidentId: string) {
    return this.http.get<any[]>(`${this.baseUrl}/${incidentId}/history`);
  }

  downloadExport(incidentId: string): void {
    const url = `${environment.apiUrl}/export/${incidentId}`;
    this.http.get(url, {
      responseType: 'blob'
    }).subscribe(
      blob => {
        saveAs(blob, `incident_${incidentId}.xlsx`);
      },
      error => {
        console.error("Erreur lors du téléchargement de l’export :", error);
      }
    );
  }  
  
}
