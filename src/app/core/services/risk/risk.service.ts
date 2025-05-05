import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Risk } from '../../models/Risk';

@Injectable({
  providedIn: 'root'
})
export class RiskService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  getAll() {
    return this.http.get<Risk[]>(this.baseUrl)
  }

  getById(id: string) {
    return this.http.get<Risk>(this.baseUrl + '/' + id)
  }

  save(title: Risk, description : string, level : string, processId: string) {
    const body = {
      name: title,
      description: description,
      level: level,
      processId: processId
    }
    console.log(body)
    return this.http.post<Risk>(this.baseUrl, body);
  }

}