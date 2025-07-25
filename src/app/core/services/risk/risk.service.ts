import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RiskTemplate, RiskTemplateCreateDto } from '../../models/RiskTemplate';

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

  getAllByProcess(processId: string = "") {
    let params = new HttpParams();
    params = params.append('processId', processId);
    return this.http.get<RiskTemplate[]>(this.baseUrl)
  }
}