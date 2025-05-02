import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod'
import { Utilisateur } from '../../models/Utilisateur';
import { UtilisateurProfil } from '../../models/UtilisateurProfil';
import { PermissionName } from '../../models/Utilisateur';


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  http = inject(HttpClient);
  
  baseUrl = (environment.log ? environment.apiLogUserUrl : environment.apiUserUrl) + '/user';

  getUsers(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.baseUrl);
  }    

  getUserProfiles(): Observable<UtilisateurProfil[]> {
    return this.http.get<UtilisateurProfil[]>(this.baseUrl);
  }  

  updateUserPermissions(userId: string, permissionIds: PermissionName[]) {
    return this.http.put(`${this.baseUrl}/${userId}/permissions`, permissionIds);
  }

  updateUser(userId: string, payload: any) {
    return this.http.put(`${this.baseUrl}/${userId}`, payload);
  }  
  
}
