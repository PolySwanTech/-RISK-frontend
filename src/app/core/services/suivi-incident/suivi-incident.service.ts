import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SuiviIncident } from '../../models/SuiviIncident';
import { IncidentHistory } from '../../models/IncidentHistory';

@Injectable({
  providedIn: 'root'
})
export class SuiviIncidentService {
  

  private base = environment.apiUrl + '/histories';
  private http = inject(HttpClient);

  addSuiviIncident(content: string, incidentId: string) {
    let params = new HttpParams();
    params = params.append('incidentId', incidentId);
    return this.http.post<SuiviIncident>(this.base, content, { params: params });
  }

  getIncidentHistory(incidentId: string) {
    const params = new HttpParams().set('incidentId', incidentId);
    return this.http.get<IncidentHistory[]>(this.base, { params : params });
  }

  getLatestSuiviIncidentById(incidentId: string, limit : number = 2) {
    return this.http.get<IncidentHistory[]>(`${this.base}/latest`, {
      params: new HttpParams().set('incidentId', incidentId).set('limit', limit)
    });
  }
}
