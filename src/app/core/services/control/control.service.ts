import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ControlTemplate, ControlTemplateCreateDto } from '../../models/ControlTemplate';
import { ControlExecution } from '../../models/ControlExecution';

@Injectable({
  providedIn: 'root'
})
export class ControlService {

  
  http = inject(HttpClient);
  baseUrlTemp = environment.apiUrl + '/risks/controls/templates';
  baseUrlExec = environment.apiUrl + '/risks/controls/executions';
  
  
  createControl(control: ControlTemplateCreateDto) {
    return this.http.post<ControlTemplateCreateDto>(`${this.baseUrlTemp}`, control);
  }

  getAllTemplates(){
    return this.http.get<ControlTemplate[]>(`${this.baseUrlTemp}`);
  }

  getAllExections(){
    return this.http.get<ControlExecution[]>(`${this.baseUrlExec}`);
  }
}
