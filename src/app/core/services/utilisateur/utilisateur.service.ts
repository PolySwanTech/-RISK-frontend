import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Utilisateur } from '../../models/Utilisateur';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  private readonly http: HttpClient = inject(HttpClient);

  private apiUrl = environment.apiUrl + '/user';

  constructor() { }

  getUsers() {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }
}
