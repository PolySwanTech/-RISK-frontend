import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BaloiseCategoryL1 } from '../../models/BaloiseCategory';



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