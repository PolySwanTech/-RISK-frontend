import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BaloiseCategoryL1, BaloiseCategoryL2 } from '../../models/BaloiseCategory';

@Injectable({
  providedIn: 'root'
})
export class BaloisCategoriesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/risks/baloise-category`;

  getAll(): Observable<BaloiseCategoryL1[]> {
    return this.http.get<BaloiseCategoryL1[]>(`${this.baseUrl}/level1`);
  }

  getAllLevel2(): Observable<BaloiseCategoryL2[]> {
    return this.http.get<BaloiseCategoryL2[]>(`${this.baseUrl}/level2`);
  }

  getLevel2ByL1(l1Name: string): Observable<BaloiseCategoryL2[]> {
    return this.http.get<BaloiseCategoryL2[]>(`${this.baseUrl}/level2/by-level1/${l1Name}`);
  }
}
