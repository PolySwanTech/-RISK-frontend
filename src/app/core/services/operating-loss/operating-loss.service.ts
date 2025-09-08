import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateOperatingLossDto, OperatingLoss } from '../../models/OperatingLoss';

@Injectable({
  providedIn: 'root'
})
export class OperatingLossService {

  baseUrl = environment.apiUrl + '/operating-losses';

  http = inject(HttpClient);


  create(operatingLoss: CreateOperatingLossDto, message : string) {
    return this.http.post(this.baseUrl, { operatingLoss, message })
  }

  listByIncident(incidentId: string) {
    return this.http.get<OperatingLoss[]>(`${this.baseUrl}`, { params: { incidentId: incidentId } });
  }

}