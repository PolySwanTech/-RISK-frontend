import { Priority } from '../../enum/Priority';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Action, ActionPlan, ActionPlanCreateDto } from '../../models/ActionPlan';

@Injectable({
  providedIn: 'root'
})
export class ActionPlanService {

  base = environment.apiUrl + '/action-plans';
  http = inject(HttpClient);

  createActionPlan(actionPlan: ActionPlanCreateDto) {
    return this.http.post<string>(this.base, actionPlan);
  }

  getActionPlan(id: string) {
    return this.http.get<ActionPlan>(`${this.base}/${id}`);
  }

  startActionPlan(id: string) {
    return this.http.put(`${this.base + '/start/' + id}`, null);
  }

  endActionPlan(id: string) {
    return this.http.put(`${this.base + '/end/' + id}`, null);
  }

  getActionsPlan() {
    return this.http.get<ActionPlan[]>(this.base);
  }

  addActions(actions: Action[], id: string) {
    return this.http.post(`${this.base}/${id}/actions`, actions);
  }

  getActionPlanByIncident(incidentId: string) {
    const params = new HttpParams().set("incidentId", incidentId);
    return this.http.get<ActionPlan>(`${this.base + '/incident'}`, { params : params});
  }

  finishAction(actionId : string){
    return this.http.put(this.base + '/actions/finish/' + actionId, null);
  }
}