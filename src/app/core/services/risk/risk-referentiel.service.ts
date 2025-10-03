import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { RiskReferentielCreateDto, RiskReferentiel } from '../../models/RiskReferentiel';

@Injectable({
  providedIn: 'root'
})
export class RiskReferentielService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/referentiels';

  create(dto: RiskReferentielCreateDto): Observable<RiskReferentiel> {
    return this.http.post<RiskReferentiel>(this.baseUrl, dto);
  }

  update(id: string, dto: RiskReferentielCreateDto): Observable<RiskReferentiel> {
    return this.http.put<RiskReferentiel>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getById(id: string): Observable<RiskReferentiel> {
    return this.http.get<RiskReferentiel>(`${this.baseUrl}/${id}`);
  }

  getAll(): Observable<RiskReferentiel[]> {
    return this.http.get<RiskReferentiel[]>(this.baseUrl);
  }
}
