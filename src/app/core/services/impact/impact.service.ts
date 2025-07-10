import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ImpactCreateDto } from '../../models/Impact';

@Injectable({
  providedIn: 'root'
})
export class ImpactService {

 baseUrl = environment.apiUrl + '/incidents'

  http = inject(HttpClient);


  sum(id: string) {
    let params = new HttpParams();
    params = params.set("incidentId", id);
    return this.http.get<number>(this.baseUrl + '/impact/sum', { params: params })
  }

  addImpact(impact: ImpactCreateDto) {
    return this.http.post(this.baseUrl + '/impact', impact)
  }

  // getImpactById(id: string): Observable<Impact> {
  //   return this.http.get<Impact>(`${this.baseUrl}/impact/${id}`);
  // }
}