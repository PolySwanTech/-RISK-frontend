import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';
import { PermissionName } from '../../enum/permission.enum';


@Injectable({ providedIn: 'root' })
export class PermissionService {
  private baseUrl = (environment.log ? environment.apiLogUserUrl : environment.apiUserUrl) + '/permissions';

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<PermissionName[]> {
    return this.http.get<PermissionName[]>(this.baseUrl);
  }
}