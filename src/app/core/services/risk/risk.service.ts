import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RiskId, RiskTemplate, RiskTemplateCreateDto } from '../../models/RiskTemplate';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RiskService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/risks/taxonomie';

  getById(id: string) {
    return this.http.get<RiskTemplate>(this.baseUrl + '/' + id)
  }

  save(dto: RiskTemplateCreateDto) {
  return this.http.post<RiskTemplate>(this.baseUrl, dto);
}

  getAll() {
    return this.http.get<RiskTemplate[]>(this.baseUrl)
  }

  getRisksTree(processId?: string) {
    let params = new HttpParams();
    const option = processId ? { params: params.set('processId', processId) } : {};
    return this.http.get<any[]>(this.baseUrl + '/tree', option)
  }

  getAllByProcess(processId: string = "") {
    console.log('Fetching risks for process ID:', processId);
    let params = new HttpParams();
    params = params.append('processId', processId);
    return this.http.get<RiskTemplate[]>(this.baseUrl, { params })
  }

  getByParent(parentId: RiskId) {
    let params = new HttpParams();
    params = params.append('parentId', parentId.toString());
    return this.http.get<RiskTemplate[]>(this.baseUrl, { params: params });
  }
}