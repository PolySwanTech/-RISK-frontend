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
  baseUrlTemp = environment.apiUrl + '/controls/templates';
  baseUrlExec = environment.apiUrl + '/controls/executions';


  createControl(control: ControlTemplateCreateDto) {
    return this.http.post<ControlTemplateCreateDto>(`${this.baseUrlTemp}`, control);
  }

  getControl(id: string) {
    return this.http.get<ControlTemplate>(`${this.baseUrlTemp}/${id}`);
  }

  getAllTemplates() {
    return this.http.get<ControlTemplate[]>(`${this.baseUrlTemp}`);
  }

  getAllExecutions(controlId?: string) {
    return this.http.get<ControlExecution[]>(`${this.baseUrlExec}${controlId ? `?controlId=${controlId}` : ''}`);
  }
}
