import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActionPlan, ActionPlanCreationDto, ActionPlanDto, ActionPlanListDto } from '../../models/action-plan/ActionPlan';
import { ActionCreationDto } from '../../models/action-plan/Action';

@Injectable({
  providedIn: 'root'
})
export class ActionPlanService {

  base = environment.apiUrl + '/action-plans';
  baseAction = environment.apiUrl + '/actions';
  http = inject(HttpClient);

  createActionPlan(actionPlan: ActionPlanCreationDto) {
    return this.http.post<string>(this.base, actionPlan);
  }

  getActionPlan(id: string) {
    return this.http.get<ActionPlanDto>(`${this.base}/${id}`);
  }

  startActionPlan(id: string) {
    return this.http.put(`${this.base + '/start/' + id}`, null);
  }

  endActionPlan(id: string) {
    return this.http.put(`${this.base + '/end/' + id}`, null);
  }

  getActionsPlan() {
    return this.http.get<ActionPlanListDto[]>(this.base);
  }

  addActions(actions: ActionCreationDto[], id: string) {
    return this.http.post(`${this.baseAction}`, actions, { params: { actionPlanId: id } });
  }

  getActionPlanByIncident(incidentId: string) {
    const params = new HttpParams().set("incidentId", incidentId);
    return this.http.get<ActionPlan>(`${this.base + '/incident'}`, { params: params });
  }

  finishAction(actionId: string) {
    return this.http.put(this.baseAction + '/finish/' + actionId, {});
  }

  abandonAction(id: string) {
    return this.http.put(`${this.baseAction}/deactivate/${id}`, {})
  }

  delete(id: string) {
    return this.http.put(`${this.base}/${id}/deactivate`, {})
  }
}