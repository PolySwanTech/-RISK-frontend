import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Consequence } from '../../models/Consequence';

@Injectable({
  providedIn: 'root'
})
export class ConsequenceService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/incidents/consequences';

  getAll(): Observable<Consequence[]> {
    return this.http.get<Consequence[]>(this.baseUrl);
  }
}