import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Equipe {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class EquipeService {
  
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/users/bu';

  getAllEquipes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  getById(userInCharge: string) {
    return this.http.get<Equipe>(`${this.baseUrl}/${userInCharge}`);
  }
}