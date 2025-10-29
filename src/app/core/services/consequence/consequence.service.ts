import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OperatingLossTypeDto } from '../../models/OperatingLoss';

@Injectable({
  providedIn: 'root'
})
export class ConsequenceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/consequences`;

  getAll(): Observable<OperatingLossTypeDto[]> {
    return this.http.get<OperatingLossTypeDto[]>(this.baseUrl);
  }
}