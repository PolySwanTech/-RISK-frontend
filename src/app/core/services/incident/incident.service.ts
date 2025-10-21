import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { environment } from '../../../environments/environment';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  baseUrl = environment.apiUrl + '/incidents'

  http = inject(HttpClient);

  loadIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.baseUrl);
  }

  loadIncidentsFull(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}?completeDto=true`);
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
    return this.http.post(this.baseUrl, incident,
      { headers: new HttpHeaders({ 'X-Show-Loader': 'true' }) }
    );
  }

  updateIncident(id: string, incidentDto: any) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, incidentDto,
      { headers: new HttpHeaders({ 'X-Show-Loader': 'true' }) }
    );
  }

  draftIncident(incident: any): Observable<any> {
    return this.http.post(this.baseUrl + '/draft', incident);
  }

  getIncidentByProcessAndRisk(riskId: string): Observable<Incident[]> {
    const params = new HttpParams()
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

  findAllByIds(ids: Set<string>): Observable<Incident[]> {
    const params = new HttpParams().set('ids', Array.from(ids).join(','));
    return this.http.get<Incident[]>(this.baseUrl + '/ids', { params });
  }

}
