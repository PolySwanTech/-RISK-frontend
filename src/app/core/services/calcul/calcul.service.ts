import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalculService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/sma/inputs';

  getValues() {
    return this.http.get<any>(this.baseUrl)
  }

  getLosses() {
    return this.http.get<any[]>(this.baseUrl + '/losses')
  }

  saveLosses(losses: { lossYear: number, amount: number }[]) {
    return this.http.post<any[]>(this.baseUrl, losses);
  }

  getResult() {
    return this.http.get<any[]>(this.baseUrl + '/result')
  }

}
