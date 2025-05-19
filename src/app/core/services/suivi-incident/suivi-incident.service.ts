import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { SuiviIncident } from '../../models/SuiviIncident';

@Injectable({
  providedIn: 'root'
})
export class SuiviIncidentService {

  private base = (environment.log ? environment.apiLogUrl : environment.apiUrl) + '/incident/suivi';
  private http = inject(HttpClient);


  getSuiviIncidentById(id: string) {
    let params = new HttpParams();
    params = params.append('incidentId', id);
    return this.http.get<SuiviIncident[]>(this.base, {params: params});
  }
  

  addSuiviIncident(content: string, incidentId: string, username: string) {
    let params = new HttpParams();
    params = params.append('incidentId', incidentId);
    return this.http.post<SuiviIncident>(this.base, {content : content, username : username}, {params: params});
  }

}
