import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { AttenuationMetrics, AttenuationMetricsCreateDto, AttenuationMetricsTypeDto } from '../../../models/dmr/AttenuationMetrics';

@Injectable({
  providedIn: 'root'
})
export class AttenuationMetricsService  {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/attenuation-metrics';

  getAll(): Observable<AttenuationMetrics[]> {
    return this.http.get<AttenuationMetrics[]>(this.baseUrl);
  }

  getByRisk(riskId: string): Observable<AttenuationMetrics[]> {
    return this.http.get<AttenuationMetrics[]>(`${this.baseUrl}/risk/${riskId}`);
  }

  create(dto: AttenuationMetricsCreateDto): Observable<AttenuationMetrics> {
    return this.http.post<AttenuationMetrics>(this.baseUrl, dto);
  }

  getAllType(): Observable<AttenuationMetricsTypeDto[]> {
    return this.http.get<AttenuationMetricsTypeDto[]>(`${this.baseUrl}/type`);
  }

  getTypeByParent(parentId: string): Observable<AttenuationMetricsTypeDto[]> {
    return this.http.get<AttenuationMetricsTypeDto[]>(`${this.baseUrl}/type-by-parent/${parentId}`);
  }

  updateEvaluation(id: string, evaluation: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/evaluation`, { evaluation });
  }
  
  updateStatus(id: string, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, { active });
  }
}