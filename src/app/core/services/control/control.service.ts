import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ControlTemplate, ControlTemplateCreateDto } from '../../models/ControlTemplate';
import { ControlExecution } from '../../models/ControlExecution';
import { RiskTemplate } from '../../models/RiskTemplate';
import { Process } from '../../models/Process';
import { ControlEvaluation } from '../../models/ControlEvaluation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControlService {

  http = inject(HttpClient);
  baseUrlTemp = environment.apiUrl + '/controls/templates';
  baseUrlExec = environment.apiUrl + '/controls/executions';
  baseUrlEval = environment.apiUrl + '/controls/evaluations';


  createControl(control: ControlTemplateCreateDto) {
    console.log(control)
    return this.http.post<ControlTemplateCreateDto>(`${this.baseUrlTemp}`, control);
  }

  getControl(id: string) {
    return this.http.get<ControlTemplate>(`${this.baseUrlTemp}/${id}`);
  }

  getAllTemplates(
    processId?: string,
    riskId?: string,
  ) {
    let params = new HttpParams();
    if (processId && riskId) {
      params = params.set('riskId', riskId).set('processId', processId);
    }
    return this.http.get<ControlTemplate[]>(`${this.baseUrlTemp}`, { params: params });
  }

  getAllExecutions(controlId?: string) {
    return this.http.get<ControlExecution[]>(`${this.baseUrlExec}${controlId ? `?controlId=${controlId}` : ''}`);
  }

  getAllTemplatesByProcessAndRisk(selectedProcess: Process, selectedRisk: RiskTemplate) {
    return this.http.get<ControlTemplate[]>(`${this.baseUrlTemp}`)
  }

  createExecution(data: any) {
    return this.http.post(`${this.baseUrlExec}`, data);
  }

  updateExecution(data: { id: string; priority: string; performedBy: string }) {
    return this.http.put(`${this.baseUrlExec}/update`, data);
  }

  createEvaluation(evaluation: ControlEvaluation): Observable<any> {
    return this.http.post(`${this.baseUrlEval}`, evaluation);
  }

  getBlockers(executionId: string) {
    return this.http.get<ControlExecution[]>(`${this.baseUrlExec}/${executionId}/blockers`);
  }

  getEvaluationByExecution(executionId: string) {
    return this.http.get(`${this.baseUrlEval}/by-execution/${executionId}`);
  }

  reviewEvaluationApprove(evaluationId: string, comment: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrlEval}/${evaluationId}/review`, {
      decision: 'APPROVE',
      comment
    });
  }

  reviewEvaluationReexam(evaluationId: string, comment: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrlEval}/${evaluationId}/review`, {
      decision: 'REEXAM',
      comment
    });
  }
}
