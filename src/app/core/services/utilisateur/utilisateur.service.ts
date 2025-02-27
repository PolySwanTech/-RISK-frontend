import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {

  private readonly http: HttpClient = inject(HttpClient);

  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  constructor() { }

  getPosts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
