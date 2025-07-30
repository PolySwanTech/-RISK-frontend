import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { environment } from '../../../environments/environment';
import { saveAs } from 'file-saver';
import { State } from '../../enum/state.enum';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  baseUrl = environment.apiUrl + '/incidents'

  http = inject(HttpClient);

  loadIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.baseUrl);
  }

  deleteIncident(id: string) {
    return this.http.delete(this.baseUrl + `/${id}`)  
  }

  countIncidentsNonClotures(): Observable<number> {
    return this.http.get<number>(this.baseUrl + '/nb/cloture')
  }

  getIncidentById(id: string): Observable<Incident> {
    return this.http.get<any>(this.baseUrl + '/' + id);
  }

  saveIncident(incident: any, state: State): Observable<any> {
    const params = new HttpParams().set('state', state);
    return this.http.post(this.baseUrl, incident, { params });
  }

  updateIncident(id: string, incidentDto: any, state: State) {

    const params = new HttpParams().set('state', state);
    return this.http.put<void>(`${this.baseUrl}/${id}`, incidentDto, { params });
  }

  draftIncident(incident: any): Observable<any> {
    return this.http.post(this.baseUrl + '/draft', incident);
  }  

  close(id: string) {
    return this.http.put(this.baseUrl + `/${id}/close`, null)
  }

  downloadExport(incidentId: string): void {
    const url = `${this.baseUrl}/${incidentId}/export`;
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
