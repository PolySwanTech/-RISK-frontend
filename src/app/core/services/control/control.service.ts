import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ControlTemplate, ControlTemplateCreateDto } from '../../models/ControlTemplate';
import { ControlExecution } from '../../models/ControlExecution';
import { ControlEvaluation } from '../../models/ControlEvaluation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControlService {


  http = inject(HttpClient);
  baseUrlTemp = environment.apiUrl + '/risks/controls/templates';
  baseUrlExec = environment.apiUrl + '/risks/controls/executions';
  baseUrlEval = environment.apiUrl + '/risks/controls/evaluations';


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

  createExecution(data: any) {
    return this.http.post(`${this.baseUrlExec}`, data);
  }

  createEvaluation(evaluation: ControlEvaluation): Observable<any> {
    return this.http.post(`${this.baseUrlEval}`, evaluation);
  }

  updateExecution(data: { id: string; priority: string; performedBy: string }) {
    return this.http.put(`${this.baseUrlExec}/update`, data);
  }

}
