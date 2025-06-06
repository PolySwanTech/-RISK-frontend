import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface BaloiseCategoryL2 {
  name: string;
  description: string;
  categoryL1: string | null;

}

export interface BaloiseCategoryL1 {
  name: string;
  description: string;
  categoriesL2?: BaloiseCategoryL2[];
}
@Injectable({
  providedIn: 'root'
})
export class BaloisCategoriesService {
    http = inject(HttpClient);
    baseUrl = environment.apiUrl + '/risks/baloise-category'

  getAll(): Observable<BaloiseCategoryL1[]> {
    return this.http.get<BaloiseCategoryL1[]>(this.baseUrl);
  }
}