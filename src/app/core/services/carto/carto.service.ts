import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cartography, CreateCarto } from '../../models/Cartography';

@Injectable({
  providedIn: 'root'
})
export class CartoService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/cartos';

  getAll(): Observable<Cartography[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
  getById(id: string): Observable<Cartography> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
  create(dto: CreateCarto): Observable<string> {
    return this.http.post<string>(this.baseUrl, dto);
  } 
  getLastCarto(buId: string): Observable<Cartography> {
    const params = new HttpParams().set('buId', buId);
    return this.http.get<Cartography>(`${this.baseUrl}/last`, { params });
  }

  getAllGroupedByBu(buId?: string): Observable<Record<string, Cartography[]>> {
    let params = new HttpParams();
    if (buId) {
      params = params.set('buId', buId);
    }
    return this.http.get<Record<string, Cartography[]>>(`${this.baseUrl}/by-bu`, { params });
  }
}
