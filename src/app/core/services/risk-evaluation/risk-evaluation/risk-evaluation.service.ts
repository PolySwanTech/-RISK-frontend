import { inject, Injectable } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { Observable }         from 'rxjs';

import { RiskEvaluation, RiskEvaluationCreateDto } from '../../../models/RiskEvaluation';
import { environment } from '../../../../environments/environment';
import { RiskLevel } from '../../../enum/riskLevel.enum';


@Injectable({ providedIn: 'root' })
export class RiskEvaluationService {

  private readonly http     = inject(HttpClient);
  private readonly baseUrl  = environment.apiUrl + '/risks/evaluations';

  /* ------------------------------------------------------------------ */
  /*  GET – détail d’une évaluation par son UUID                        */
  /* ------------------------------------------------------------------ */
  get(id: string): Observable<RiskEvaluation> {
    return this.http.get<RiskEvaluation>(`${this.baseUrl}/${id}`);
  }

  /* ------------------------------------------------------------------ */
  /*  GET – liste complète (ton contrôleur la renvoie sur GET /)        */
  /* ------------------------------------------------------------------ */
  getAll(): Observable<RiskEvaluation[]> {
    return this.http.get<RiskEvaluation[]>(this.baseUrl);
  }

  /* ------------------------------------------------------------------ */
  /*  POST – création d’une nouvelle évaluation                         */
  /*       (l’UUID de l’utilisateur est injecté côté back via @Jwt)     */
  /* ------------------------------------------------------------------ */
  save(payload: RiskEvaluationCreateDto): Observable<string> {
    return this.http.post<string>(this.baseUrl, payload);
  }

  updateLevel(
    evaluationId: string,
    newLevel:     RiskLevel
  ): Observable<RiskEvaluation[]> {
    return this.http.put<RiskEvaluation[]>(
      `${this.baseUrl}/${evaluationId}`,
      newLevel                                    // corps = simple enum
    );
  }
}

