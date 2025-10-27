import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ToDo } from '../../models/ToDo';

@Injectable({
  providedIn: 'root'
})
export class ToDoService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/to-do';

  getToDos() {
    return this.http.get<ToDo[]>(this.baseUrl);
  }

}
