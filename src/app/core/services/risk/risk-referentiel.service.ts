import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { RiskReferentielCreateDto, RiskReferentiel } from '../../models/RiskReferentiel';

@Injectable({
  providedIn: 'root'
})
export class RiskReferentielService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/referentiels';

  create(dto: RiskReferentielCreateDto): Observable<RiskReferentiel> {
    return this.http.post<RiskReferentiel>(this.baseUrl, dto);
  }

  getById(id: string): Observable<RiskReferentiel> {
    return this.http.get<RiskReferentiel>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<RiskReferentiel[]> {
    return this.http.get<RiskReferentiel[]>(this.baseUrl);
  }
}
