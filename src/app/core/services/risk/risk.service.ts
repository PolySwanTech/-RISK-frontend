import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RiskTemplate, RiskTemplateCreateDto } from '../../models/RiskTemplate';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RiskService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/taxonomie';

  getById(id: string) {
    return this.http.get<RiskTemplate>(this.baseUrl + '/' + id)
  }

  save(dto: RiskTemplateCreateDto) {
    return this.http.post<RiskTemplate>(this.baseUrl, dto);
  }

  reasign(riskId: string, processId: string) {
    return this.http.patch(this.baseUrl + '/reassign', { riskId, processId })
  }

  getAll(buId?: string): Observable<RiskTemplate[]> {
    let params = new HttpParams();
    if (buId) {
      params = params.append('buId', buId);
    }
    return this.http.get<RiskTemplate[]>(this.baseUrl, { params });
  }

  getRisksTree(processId?: string) {
    let params = new HttpParams();
    const option = processId ? { params: params.set('processId', processId) } : {};
    return this.http.get<any[]>(this.baseUrl + '/tree', option)
  }

  getRisksTreeByProcessId(processId: string) {
    let params = new HttpParams();
    return this.http.get<any[]>(this.baseUrl + '/tree/process', { params: params.set('processId', processId) })
  }

  getRiskOfIncident(incidentId: string) {
    const params = new HttpParams().set('incidentId', incidentId);
    return this.http.get<RiskTemplate>(`${this.baseUrl}/incident`, { params: params });
  }
}