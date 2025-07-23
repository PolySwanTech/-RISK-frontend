import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RiskId, RiskTemplate, RiskTemplateCreateDto } from '../../models/RiskTemplate';

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
  return this.http.post(this.baseUrl, dto);
}

  getAll() {
    return this.http.get<RiskTemplate[]>(this.baseUrl)
  }

  getRisksTree(processId: string) {
     let params = new HttpParams();
    params = params.append('processId', processId);
    return this.http.get<any[]>(this.baseUrl + '/tree', { params })
  }

  getAllByProcess(processId: string = "", year: number = new Date().getFullYear()) {
    let params = new HttpParams();
    params = params.append('processId', processId);
    params = params.append('year', year);
    return this.http.get<RiskTemplate[]>(this.baseUrl, { params })
  }

  getByParent(parentId: RiskId) {
    let params = new HttpParams();
    params = params.append('parentId', parentId.toString());
    return this.http.get<RiskTemplate[]>(this.baseUrl, { params: params });
  }
}