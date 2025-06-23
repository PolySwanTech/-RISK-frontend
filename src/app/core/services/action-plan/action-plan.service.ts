import { Priority } from './../../models/Priority';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Action, ActionPlan } from '../../models/ActionPlan';
import { Status } from '../../models/ControlExecution';

@Injectable({
  providedIn: 'root'
})
export class ActionPlanService {

  base = environment.apiUrl + '/risks/action-plans';
  http = inject(HttpClient);

  createActionPlan(actionPlan: ActionPlan) {
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
}
