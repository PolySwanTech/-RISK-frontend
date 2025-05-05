import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';

export interface Role {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private http = inject(HttpClient);
  private baseUrl = (environment.log ? environment.apiLogUserUrl : environment.apiUserUrl) + '/roles';

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}`);
  }
}
