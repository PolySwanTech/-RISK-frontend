import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaloiseCategoryDto } from '../../models/RiskReferentiel';

@Injectable({
  providedIn: 'root'
})

export class RiskCategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/categories`;

  getAll(): Observable<BaloiseCategoryDto[]> {
    return this.http.get<BaloiseCategoryDto[]>(this.baseUrl);
  }

  getByParent(parentId: string): Observable<BaloiseCategoryDto[]> {
    return this.http.get<BaloiseCategoryDto[]>(`${this.baseUrl}/by-parent/${parentId}`);
  }
}