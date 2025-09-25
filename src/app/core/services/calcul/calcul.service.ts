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

  createInput(dto: SmaInputCreateDto) {
    return this.http.post<SmaInput>(`${this.baseUrl}`, dto);
  }

  upsertLosses(inputId: string, losses: SmaLossUpsert[]) {
    return this.http.post<SmaLoss[]>(`${this.baseUrl}/${inputId}/losses`, losses);
  }

  getPayload(inputId: string) {
    return this.http.get<SmaPayload>(`${this.baseUrl}/${inputId}`);
  }

  getLatestPayload() {
    return this.http.get<SmaPayload>(`${this.baseUrl}/latest/payload`);
  }

  getResult(inputId: string) {
    return this.http.get<SmaResult>(`${this.baseUrl}/${inputId}/result`);
  }

  getValues(){
    return this.http.get<any>(this.baseUrl)
  }

}
