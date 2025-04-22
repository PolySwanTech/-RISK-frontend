import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Permission } from '../../models/permission'; // chemin à adapter


@Injectable({ providedIn: 'root' })
export class PermissionService {
  private baseUrl = environment.apiUserUrl + '/permissions';

  constructor(private http: HttpClient) {}

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.baseUrl);
  }
}