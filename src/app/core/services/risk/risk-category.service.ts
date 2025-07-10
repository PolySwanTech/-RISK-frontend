import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaloiseCategoryEnum } from '../../enum/baloisecategory.enum';

@Injectable({
  providedIn: 'root'
})

export class RiskCategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/risks/categories`;

  getAll(): Observable<BaloiseCategoryEnum[]> {
    return this.http.get<BaloiseCategoryEnum[]>(this.baseUrl);
  }

  getByParent(parentId: string): Observable<BaloiseCategoryEnum[]> {
    return this.http.get<BaloiseCategoryEnum[]>(`${this.baseUrl}/by-parent/${parentId}`);
  }
}