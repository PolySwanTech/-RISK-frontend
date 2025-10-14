import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams }         from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { RiskLevelEnum } from '../../../enum/riskLevel.enum';


@Injectable({ providedIn: 'root' })
export class RiskEvaluationService {

  private readonly http     = inject(HttpClient);
  private readonly baseUrl  = environment.apiUrl + '/evaluations';

  saveEvaluation(riskId: string, evaluation: RiskLevelEnum, indicators: any[], brut: boolean) {
    return this.http.post(this.baseUrl, { riskId, evaluation: { name: evaluation, color: "" }, brut, indicators, commentaire: "Test" })
  }

  getEvaluationsByBu(buId: string) {
    const params = new HttpParams().set("buId", buId);
    return this.http.get<any>(this.baseUrl + '/by-bu', { params: params })
  }

  getEvaluationsByRisk(riskId: string) {
    const params = new HttpParams().set("riskId", riskId);
    return this.http.get<any>(this.baseUrl + '/by-risk', { params: params })
  }

}

