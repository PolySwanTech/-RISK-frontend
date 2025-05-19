import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Risk } from '../../models/Risk';

@Injectable({
  providedIn: 'root'
})
export class RiskService {

  http = inject(HttpClient);
  baseUrl = (environment.log ? environment.apiLogUrl : environment.apiUrl) + '/risk';

  getAll() {
    return this.http.get<Risk[]>(this.baseUrl)
  }

  getById(id: string) {
    return this.http.get<Risk>(this.baseUrl + '/' + id)
  }

  save(risk: Risk) {
    return this.http.post<Risk>(this.baseUrl, risk)
  }

}