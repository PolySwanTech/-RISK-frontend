import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ControlTemplate, ControlTemplateCreateDto } from '../../models/ControlTemplate';
import { ControlExecution } from '../../models/ControlExecution';
import { RiskTemplate } from '../../models/RiskTemplate';
import { Process } from '../../models/Process';

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

  getAllTemplates(
    processId? : string,
    riskId? : string,
  ) {
    let params = new HttpParams();
    if(processId && riskId){
      params = params.set('riskId', riskId).set('processId', processId);
    }
    return this.http.get<ControlTemplate[]>(`${this.baseUrlTemp}`, {params : params});
  }

  getAllExecutions(controlId?: string) {
    return this.http.get<ControlExecution[]>(`${this.baseUrlExec}${controlId ? `?controlId=${controlId}` : ''}`);
  }

  getAllTemplatesByProcessAndRisk(selectedProcess: Process, selectedRisk: RiskTemplate) {
    return this.http.get<ControlTemplate[]>(`${this.baseUrlTemp}`)
  }
}
