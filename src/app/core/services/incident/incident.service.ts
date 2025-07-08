import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Incident } from '../../models/Incident';
import { environment } from '../../../environments/environment';
import { Impact, ImpactCreateDto } from '../../models/Impact';
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

  countIncidentsNonClotures(): Observable<number> {
    return this.http.get<number>(this.baseUrl + '/nb/cloture')
  }

  sum(id: string) {
    let params = new HttpParams();
    params = params.set("incidentId", id);
    return this.http.get<number>(this.baseUrl + '/impact/sum', { params: params })
  }


  getIncidentById(id: string): Observable<Incident> {
    return this.http.get<any>(this.baseUrl + '/' + id);
  }

  addImpact(impact: ImpactCreateDto) {
    return this.http.post(this.baseUrl + '/impact', impact)
  }

  saveIncident(incident: any): Observable<any> {
    return this.http.post(this.baseUrl, incident);
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
