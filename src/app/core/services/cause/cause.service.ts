import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RiskTemplate } from '../../models/RiskTemplate';

@Injectable({
  providedIn: 'root'
})
export class CauseService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/cause';

  getAll() {
    return this.http.get<RiskTemplate[]>(this.baseUrl)
  }
}
