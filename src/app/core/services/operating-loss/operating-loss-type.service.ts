import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OperatingLossTypeDto } from '../../models/OperatingLoss';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class OperatingLossTypeService {
  baseUrl = environment.apiUrl + '/operating-loss-types';
  
  http = inject(HttpClient);

  getAll(): Observable<OperatingLossTypeDto[]> {
    return this.http.get<OperatingLossTypeDto[]>(this.baseUrl);
  }
  findByOperatingLossFamily(family: string): Observable<OperatingLossTypeDto[]> {
    return this.http.get<OperatingLossTypeDto[]>(`${this.baseUrl}/by-family/${family}`);
  }
}
