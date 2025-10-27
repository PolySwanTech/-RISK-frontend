import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  private base = environment.apiUrl + '/password';
  private http = inject(HttpClient);

  requestLink(email: string) {
    return this.http.post(this.base + '/forgot', { mail: email })
  }

  resetPassword(token: string, password: string) {
    return this.http.post<any>(this.base + '/reset', { token: token, newPassword: password })
  }
}
