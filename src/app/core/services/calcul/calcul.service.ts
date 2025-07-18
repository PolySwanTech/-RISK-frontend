import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalculService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/rwa';

  submitFormData(data: any) {
    return this.http.post(`${this.baseUrl}/rwa`, data);
  }

  getLosses() {
    return this.http.get<{ [year: string]: number }>(`${this.baseUrl}`);
  }

}
