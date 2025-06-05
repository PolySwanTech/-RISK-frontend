import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ControlTemplate } from '../../models/ControlTemplate';
import { ControlExecution } from '../../models/ControlExecution';

@Injectable({
  providedIn: 'root'
})
export class ControlService {

  
  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/risks/controls';
  
  
  createControl(control: ControlTemplate) {
    return this.http.post<ControlTemplate>(`${this.baseUrl}/templates`, control);
  }

  getAllTemplates(){
    return this.http.get<ControlTemplate[]>(`${this.baseUrl}/templates`);
  }

  getAllExections(){
    return this.http.get<ControlExecution[]>(`${this.baseUrl}/executions`);
  }
}
