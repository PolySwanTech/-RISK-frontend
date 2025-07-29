import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Process } from '../../models/Process';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  http = inject(HttpClient);
  baseUrl = environment.apiUrl + '/processes'; ;

  getAllGroupedByBu() {
    return this.http.get<{ [key: string]: Process[] }>(this.baseUrl);
  }

  getAll(): Observable<Process[]> {
    return this.http.get<Process[]>(this.baseUrl);
  }

  /** Récupère un process par son UUID */
  get(id: string): Observable<Process> {
    return this.http.get<Process>(`${this.baseUrl}/${id}`);
  }

  createProcess(process : { name: string; bu: { id: string; name: string }; parentId?: string }){ 
    return this.http.post<Process>(this.baseUrl , process)
  }

  getProcessTree(buId : string): Observable<Process[]> { 
    let param = new HttpParams();
    param = param.set('bu', buId);
    return this.http.get<any[]>(`${this.baseUrl}/tree`, {params : param});
  }

  getAllByEntite(entiteId : string){
    let param = new HttpParams();
    param = param.set('buId', entiteId);
    return this.http.get<Process[]>(this.baseUrl, {params : param})
  }
}
