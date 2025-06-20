import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Cause } from '../../models/Cause';

@Injectable({
  providedIn: 'root'
})
export class CauseService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/incidents/cause';

  getAll() {
    return this.http.get<Cause[]>(this.baseUrl)
  }
}