import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateOperatingLossDto, OperatingLoss } from '../../models/OperatingLoss';
import { OperatingLossState } from '../../enum/operatingLossState.enum';

@Injectable({
  providedIn: 'root'
})
export class OperatingLossService {

  baseUrl = environment.apiUrl + '/operating-losses';

  http = inject(HttpClient);


  create(operatingLoss: CreateOperatingLossDto, message : string) {
    return this.http.post<string>(this.baseUrl, { operatingLoss, message })
  }

  listByIncident(incidentId: string, all?: boolean) {
    let params = new HttpParams().set('incidentId', incidentId);
    if (all) {
      params = params.set('all', all);
    }
    return this.http.get<OperatingLoss[]>(`${this.baseUrl}`, { params: params });
  }

  updateState(id: string, state: OperatingLossState) {
  return this.http.put<void>(`${this.baseUrl}/${id}/state`, { state });
}


  deactivate(id: string) {
    return this.http.put<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

}