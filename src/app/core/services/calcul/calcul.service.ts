import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SmaInput, SmaInputCreateDto, SmaLoss, SmaLossUpsert, SmaPayload } from '../../models/Sma';
import { SmaResult } from '../../models/SmaResult';

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

  saveLosses(losses: any[]) {
    return this.http.post<any[]>(this.baseUrl, losses);
  }

  getResult(){
    return this.http.get<any[]>(this.baseUrl + '/result')
  }

}
