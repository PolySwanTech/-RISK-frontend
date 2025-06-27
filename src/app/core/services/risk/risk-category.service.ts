import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaloiseCategory } from '../../models/BaloiseCategory';

@Injectable({
  providedIn: 'root'
})

export class RiskCategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/risks/categories`;

  getAll(): Observable<BaloiseCategory[]> {
    return this.http.get<BaloiseCategory[]>(this.baseUrl);
  }

  getByParent(parentId: string): Observable<BaloiseCategory[]> {
    return this.http.get<BaloiseCategory[]>(`${this.baseUrl}/by-parent/${parentId}`);
  }

  getCategoryInfo(id: string): Observable<{ type: string, niveau: number }> {
  return this.http.get<{ type: string, niveau: number }>(`${this.baseUrl}/${id}/info`);
}

}