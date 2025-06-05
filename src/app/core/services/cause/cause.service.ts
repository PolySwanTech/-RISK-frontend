import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Risk } from '../../models/Risk';

@Injectable({
  providedIn: 'root'
})
export class CauseService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/cause';

  getAll() {
    return this.http.get<Risk[]>(this.baseUrl)
  }
}
