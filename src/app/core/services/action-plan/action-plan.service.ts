import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActionPlan } from '../../models/ActionPlan';

@Injectable({
  providedIn: 'root'
})
export class ActionPlanService {

  base = environment.apiUrl + '/risks/action-plans';
  http = inject(HttpClient);  

  createActionPlan(actionPlan: ActionPlan) {
    return this.http.post(this.base, actionPlan);
  }
}
