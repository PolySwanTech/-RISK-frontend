import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OperatingLossTypeDto } from '../../models/OperatingLoss';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class OperatingLossTypeService {

  private baseUrl = environment.apiUrl + '/operating-loss-types';
  private http = inject(HttpClient);

  findByOperatingLossFamily(family: string): Observable<OperatingLossTypeDto[]> {
    return this.http.get<OperatingLossTypeDto[]>(`${this.baseUrl}/by-family/${family}`);
  }
}
