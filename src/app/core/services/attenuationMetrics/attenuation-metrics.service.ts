import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AttenuationMetrics, AttenuationMetricsCreateDto, AttenuationMetricsTypeDto } from '../../models/AttenuationMetrics';

@Injectable({
  providedIn: 'root'
})
export class AttenuationMetricsService  {


  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/attenuation-metrics';

  getAll(): Observable<AttenuationMetrics[]> {
    return this.http.get<AttenuationMetrics[]>(this.baseUrl);
  }

  getByRisk(riskId: string): Observable<AttenuationMetrics[]> {
    return this.http.get<AttenuationMetrics[]>(`${this.baseUrl}/risk/${riskId}`);
  }

  getById(id: string): Observable<AttenuationMetrics> {
    return this.http.get<AttenuationMetrics>(`${this.baseUrl}/${id}`);
  }

  create(dto: AttenuationMetricsCreateDto): Observable<AttenuationMetrics> {
    return this.http.post<AttenuationMetrics>(this.baseUrl, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
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