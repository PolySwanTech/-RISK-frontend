import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Impact, ImpactCreateDto } from '../../models/Impact';

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

  addImpact(impact: ImpactCreateDto, message : string) {
    return this.http.post(this.baseUrl + '/impact', { impact, message })
  }

  getImpactByIncidentId(id: string) {
    return this.http.get<Impact[]>(`${this.baseUrl}/impact`, { params: { incidentId: id } });
  }
}