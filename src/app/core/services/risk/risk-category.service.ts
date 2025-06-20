import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RiskCategory } from '../../models/RiskCategory';

@Injectable({
  providedIn: 'root'
})

export class RiskCategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/risks/categories`;

  getAll(): Observable<RiskCategory[]> {
    return this.http.get<RiskCategory[]>(this.baseUrl);
  }

  getByParent(parentId: string): Observable<RiskCategory[]> {
    return this.http.get<RiskCategory[]>(`${this.baseUrl}/by-parent/${parentId}`);
  }

  getByLevel(level: number): Observable<RiskCategory[]> {
    return this.http.get<RiskCategory[]>(`${this.baseUrl}/level/${level}`);
  }

  getCategoryInfo(id: string): Observable<{ type: string, niveau: number }> {
  return this.http.get<{ type: string, niveau: number }>(`${this.baseUrl}/${id}/info`);
}

}