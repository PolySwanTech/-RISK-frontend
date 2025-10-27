// src/app/services/amount.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

// Adapte ces chemins selon ton projet
import { AmountDto, CreateAmountDto } from '../../models/Amount';
import { ReviewStatus } from '../../enum/reviewStatus.enum';

@Injectable({ providedIn: 'root' })
export class AmountService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/amounts`;

  /** POST /amounts/operating-losses/{operatingLossId} */
  create(operatingLossId: string, dto: CreateAmountDto): Observable<AmountDto> {
    return this.http.post<AmountDto>(
      `${this.baseUrl}/operating-losses/${operatingLossId}`,
      dto
    );
  }

  /** GET /amounts/operating-losses/{operatingLossId} */
  listByOperatingLoss(operatingLossId: string, all? : boolean): Observable<AmountDto[]> {
    return this.http.get<AmountDto[]>(
      all ? `${this.baseUrl}/operating-losses/${operatingLossId}?all=${all}` : `${this.baseUrl}/operating-losses/${operatingLossId}`
    );
  }


  updateReviewStatus(id: string, status: ReviewStatus) {
    return this.http.put<void>(`${this.baseUrl}/${id}/review-status`, { status });
  }


  /** DELETE /amounts/{id} */
  deactivate(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

}
