import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Control } from '../../models/Control';

@Injectable({
  providedIn: 'root'
})
export class ControlService {

  
  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/risks/controls';
  
  
  createControl(control: Control) {
    return this.http.post<Control>(`${this.baseUrl}/templates`, control);
  }

  getAll(){
    return this.http.get<Control[]>(`${this.baseUrl}/templates`);
  }
}
