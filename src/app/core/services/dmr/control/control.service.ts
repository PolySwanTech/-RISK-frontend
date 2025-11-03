
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ControlDetailsView, ControlTemplateCreateDto, ControlTemplateListViewDto } from '../../../models/ControlTemplate';
import { ControlExecution } from '../../../models/ControlExecution';
import { ControlEvaluation } from '../../../models/ControlEvaluation';
import { Observable } from 'rxjs';
import { ControlMethodologyCreateDto, ControlMethodologyViewDto } from '../../../models/ControlMethodology';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ControlService {

  private http = inject(HttpClient);
  private baseUrlTemp = environment.apiUrl + '/controls/templates';
  private baseUrlExec = environment.apiUrl + '/controls/executions';
  private baseUrlEval = environment.apiUrl + '/controls/evaluations';
  private baseUrlMeth = environment.apiUrl + '/controls/methodologies';


  createControl(control: ControlTemplateCreateDto) {
    return this.http.post<ControlTemplateCreateDto>(`${this.baseUrlTemp}`, control);
  }

  getControl(id: string) {
    return this.http.get<ControlDetailsView>(`${this.baseUrlTemp}/${id}`);
  }

  getAllTemplates(
    processId?: string,
    riskId?: string,
  ) {
    let params = new HttpParams();
    if (processId && riskId) {
      params = params.set('riskId', riskId).set('processId', processId);
    }
    return this.http.get<ControlTemplateListViewDto[]>(`${this.baseUrlTemp}`, { params: params });
  }

  getAllExecutions(controlId?: string, isHistory: boolean = false) {
    let params = [];
    if (controlId) params.push(`controlId=${controlId}`);
    params.push(`isHistory=${isHistory}`); // ajoute le paramètre pour le backend
    const queryString = params.length ? `?${params.join('&')}` : '';

    return this.http.get<ControlExecution[]>(`${this.baseUrlExec}${queryString}`);
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

  reviewEvaluationReexam(evaluationId: string, comment: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrlEval}/${evaluationId}/review`, {
      decision: 'REEXAM',
      comment
    });
  }

  getMethodology(controlId: string) {
    return this.http.get(`${this.baseUrlMeth}/${controlId}`, { observe: 'response' })
      .pipe(map(res => res.status === 204 ? null : (res.body as ControlMethodologyViewDto)));
  }

  createMethodology(data: ControlMethodologyCreateDto) {
    return this.http.post(`${this.baseUrlMeth}`, data);
  }

  suspendControl(controlId: string) {
    return this.http.patch(`${this.baseUrlTemp}/${controlId}/suspend`, {});
  }

  activateControl(controlId: string) {
    return this.http.patch(`${this.baseUrlTemp}/${controlId}/activate`, {});
  }

  getLastExecution(controlId: string) {
    const params = new HttpParams().set("controlId", controlId);
    return this.http.get<ControlExecution>(this.baseUrlExec + '/last', { params: params })
  }
}
