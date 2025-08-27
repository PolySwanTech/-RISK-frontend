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
    // const allPlans = this.getActionsPlan();
    // return allPlans.find(plan => plan.id === id);

    return this.http.get<ActionPlan>(`${this.base}/${id}`);
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
}