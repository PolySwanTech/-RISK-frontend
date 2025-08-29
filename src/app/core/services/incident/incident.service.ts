import { HttpClient, HttpParams } from '@angular/common/http';
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
    return this.http.get<Incident>(this.baseUrl + '/' + id);
  }

  saveIncident(incident: any): Observable<any> {
    return this.http.post(this.baseUrl, incident);
  }

  updateIncident(id: string, incidentDto: any) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, incidentDto);
  }

  draftIncident(incident: any): Observable<any> {
    return this.http.post(this.baseUrl + '/draft', incident);
  }

  getIncidentByProcessAndRisk(processId: string, riskId: string): Observable<Incident[]> {
    const params = new HttpParams()
      .set('processId', processId)
      .set('riskId', riskId);
    return this.http.get<Incident[]>(this.baseUrl + '/search', { params });
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

  downloadPDF(incidentId: string) {
    const url = `${this.baseUrl}/${incidentId}/pdf`;
    return this.http.get(url, { responseType: 'blob' });
  }

  hasActionPlan(incidentId: string): Observable<string | null> {
    return this.http.get<string | null>(`${this.baseUrl}/${incidentId}/action-plan`);
  }

}
