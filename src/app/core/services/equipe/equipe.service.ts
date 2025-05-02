import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

export interface Equipe {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class EquipeService {
  private http = inject(HttpClient);
  private baseUrl = (environment.log ? environment.apiLogUserUrl : environment.apiUserUrl) + '/equipe';

  getAllEquipes(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(`${this.baseUrl}`);
  }
}