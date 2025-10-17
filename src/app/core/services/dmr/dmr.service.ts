import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DmrService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/dmr';

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  create(dto: any): Observable<string> {
    return this.http.post<string>(this.baseUrl, dto);
  }

  createDMRIfAbsent(dto: any): Observable<string> {
    return this.http.post<string>(this.baseUrl + '/create-risk', dto);
  }
}