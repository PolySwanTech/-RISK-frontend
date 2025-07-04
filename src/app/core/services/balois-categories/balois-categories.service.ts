import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BaloiseCategory } from '../../models/BaloiseCategory';

@Injectable({
  providedIn: 'root'
})
export class BaloisCategoriesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/risks/baloise-category`;

  getAll(): Observable<BaloiseCategory[]> {
    return this.http.get<BaloiseCategory[]>(`${this.baseUrl}/level1`);
  }

  getAllLevel2(): Observable<BaloiseCategory[]> {
    return this.http.get<BaloiseCategory[]>(`${this.baseUrl}/level2`);
  }

  getLevel2ByL1(l1Name: string): Observable<BaloiseCategory[]> {
    return this.http.get<BaloiseCategory[]>(`${this.baseUrl}/level2/by-level1/${l1Name}`);
  }
}
