import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams }         from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { RiskEvaluationCreateDto } from '../../models/RiskEvaluation';


@Injectable({ providedIn: 'root' })
export class RiskEvaluationService {

  private readonly http     = inject(HttpClient);
  private readonly baseUrl  = environment.apiUrl + '/evaluations';

  saveEvaluation(riskEvaluationCreationDto: RiskEvaluationCreateDto) {
    return this.http.post(this.baseUrl, riskEvaluationCreationDto)
  }

  getEvaluationsByBu(buId: string) {
    const params = new HttpParams().set("buId", buId);
    return this.http.get<any>(this.baseUrl + '/by-bu', { params: params })
  }

  getPeriodsByBu(buId: string) {
    const params = new HttpParams().set("buId", buId);
    return this.http.get<any>(this.baseUrl + '/periods', { params: params })
  }

  getEvaluationsByRisk(riskId: string) {
    const params = new HttpParams().set("riskId", riskId);
    return this.http.get<any>(this.baseUrl + '/by-risk', { params: params })
  }

}

