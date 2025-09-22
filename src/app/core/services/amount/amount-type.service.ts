import { inject, Injectable } from '@angular/core';
import { AmountTypeDto } from '../../models/Amount';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmountTypeService {
  baseUrl = environment.apiUrl + '/amount-types';
  
  http = inject(HttpClient);

  getAll(): Observable<AmountTypeDto[]> {
    return this.http.get<AmountTypeDto[]>(this.baseUrl);
  }
  findByOperatingLossFamily(family: string): Observable<AmountTypeDto[]> {
    return this.http.get<AmountTypeDto[]>(`${this.baseUrl}/by-family/${family}`);
  }
}
