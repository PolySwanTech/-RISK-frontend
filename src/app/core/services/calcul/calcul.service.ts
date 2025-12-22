import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import saveAs from 'file-saver';

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

  addSmaItemValues(payload: { year: number, values: { itemKey: string, value: number } }) {
    return this.http.post<void>(this.baseUrl + '/items', payload);
  }

  export() {
    return this.http.get(this.baseUrl + '/export/c16', { responseType: 'blob' })
      .subscribe({
        next: (data: Blob) => {
          saveAs(data, "C16.xlsx");
        },
        error: (err) => {
          console.error("Erreur lors de l'export Excel :", err);
        }
      });
  }

}
