import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Process } from '../../models/Process';
import { EntiteResponsable } from '../../models/EntiteResponsable';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/users/processes'; ;

  getAllGroupedByBu() {
    return this.http.get<{ [key: string]: Process[] }>(this.baseUrl);
  }

  getAll(): Observable<Process[]> {
  return this.http.get<Process[]>(this.baseUrl);
}


  createProcess(process : Process){ 
    return this.http.post<Process>(this.baseUrl , process)
  }

  getAllByEntite(entiteId : string){
    let param = new HttpParams();
    param = param.set('buId', entiteId);
    return this.http.get<Process[]>(this.baseUrl, {params : param})
  }
}
