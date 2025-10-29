import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AmountListDto, CreateAmountDto } from '../../models/Amount';
import { ReviewStatus } from '../../enum/reviewStatus.enum';

@Injectable({ providedIn: 'root' })
export class AmountService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/amounts`;

  /** POST /amounts/operating-losses/{operatingLossId} */
  create(operatingLossId: string, dto: CreateAmountDto){
    return this.http.post<CreateAmountDto>(
      `${this.baseUrl}/operating-losses/${operatingLossId}`,
      dto
    );
  }

  /** GET /amounts/operating-losses/{operatingLossId} */
  listByOperatingLoss(operatingLossId: string, all? : boolean): Observable<AmountListDto[]> {
    return this.http.get<AmountListDto[]>(
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
