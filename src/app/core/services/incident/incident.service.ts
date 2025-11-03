import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident, IncidentCreateDto, IncidentListDto, IncidentListViewDto } from '../../models/Incident';
import { environment } from '../../../environments/environment';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  private baseUrl = environment.apiUrl + '/incidents'
  private http = inject(HttpClient);

  loadIncidents(): Observable<IncidentListViewDto[]> {
    return this.http.get<IncidentListViewDto[]>(this.baseUrl);
  }

  loadIncidentsFull(): Observable<IncidentListViewDto[]> {
    return this.http.get<IncidentListViewDto[]>(`${this.baseUrl}?completeDto=true`);
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

  saveIncident(incident: IncidentCreateDto): Observable<any> {
    return this.http.post(this.baseUrl, incident,
      { headers: new HttpHeaders({ 'X-Show-Loader': 'true' }) }
    );
  }

  updateIncident(id: string, incidentDto: any) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, incidentDto,
      { headers: new HttpHeaders({ 'X-Show-Loader': 'true' }) }
    );
  }

  getIncidentByProcessAndRisk(riskId: string): Observable<IncidentListDto[]> {
    const params = new HttpParams()
      .set('riskId', riskId);
    return this.http.get<IncidentListDto[]>(this.baseUrl + '/search', { params });
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
    /* TODO : ajouter l'ecran de chargement "PDF en cours" */
    const header = new HttpHeaders().set('X-Show-Loader', 'true');
    const url = `${this.baseUrl}/${incidentId}/pdf`;
    return this.http.get(url, { headers: header, responseType: 'blob' },);
  }

  findAllByIds(ids: Set<string>): Observable<Incident[]> {
    const params = new HttpParams().set('ids', Array.from(ids).join(','));
    return this.http.get<Incident[]>(this.baseUrl + '/ids', { params });
  }

}
