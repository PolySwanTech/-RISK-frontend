import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Utilisateur } from '../../models/Utilisateur';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  base = environment.apiUrl;
  http = inject(HttpClient);

  constructor() { }

  register(user : Utilisateur){
    return this.http.post<Utilisateur>(this.base + '/auth/register', user);
  }
}
